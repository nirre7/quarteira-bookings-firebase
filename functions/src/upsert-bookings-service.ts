import {Booking} from './booking'
import {CalendarDay} from './calendar-day'
import {BookingStatus} from './booking-status'
import {isAfter, isFuture, isSameDay, isWithinInterval} from 'date-fns'
import {firestore} from 'firebase-admin'
import {cloneDeep} from 'lodash'
import Timestamp = firestore.Timestamp
import QuerySnapshot = firestore.QuerySnapshot
import DocumentData = firestore.DocumentData
import Firestore = firestore.Firestore

function getStart(doc: DocumentData): Date {
    return ((doc.data() as Booking).start as unknown as Timestamp).toDate()
}

function getEnd(doc: DocumentData): Date {
    return ((doc.data() as Booking).end as unknown as Timestamp).toDate()
}

function filterNewBookings(bookings: Booking[], bookingsInDb: QuerySnapshot<FirebaseFirestore.DocumentData>) {
    return bookings
        .filter(b => isFuture(new Date(b.start)))
        .filter(b => {
            return !bookingsInDb.docs
                .filter(bInDb => bInDb.data()?.status === BookingStatus.ACTIVE)
                .some(bInDb => {
                    const startInDb = getStart(bInDb)
                    const endInDb = getEnd(bInDb)

                    return isWithinInterval(b.start, {start: startInDb, end: endInDb}) &&
                        isWithinInterval(b.end, {start: startInDb, end: endInDb})
                })
        })
}

export const exportedForTesting = {
    filterNewBookings,
    setBookingsToRemovedIfNeeded,
}

async function getAllBookingsFromDb(firestore: Firestore): Promise<QuerySnapshot<DocumentData>> {
    return await firestore.collection('bookings').get()
}

// eslint-disable-next-line max-len
async function setBookingsToRemovedIfNeeded(bookingsInDb: QuerySnapshot<DocumentData>, scrapedBookings: Booking[]): Promise<void> {
    const bookingsToBeSetToRemoved = bookingsInDb.docs
        .filter(b => (b.data() as Booking).status === BookingStatus.ACTIVE)
        .filter(b => isFuture(getStart(b)))
        .filter(b => {
            const startInDb = getStart(b)
            const endInDb = getEnd(b)

            return !scrapedBookings.some(sb => isSameDay(sb.start, startInDb) && isSameDay(sb.end, endInDb))
        })

    for (const booking of bookingsToBeSetToRemoved) {
        await booking.ref.update({status: BookingStatus.REMOVED})
    }
}

async function saveBookings(scrapedBookings: Booking[], firestore: FirebaseFirestore.Firestore): Promise<Booking[]> {
    const bookingsInDb = await getAllBookingsFromDb(firestore)
    await setBookingsToRemovedIfNeeded(bookingsInDb, scrapedBookings)
    const newBookings = filterNewBookings(scrapedBookings, bookingsInDb)

    await newBookings.forEach(b => firestore.collection('bookings').add(b))

    return newBookings
}

function createBookingsFromCalenderDays(calendarDays: CalendarDay[]): Booking[] {
    const bookings: Booking[] = []
    let booking: Partial<Booking>
    const today = new Date()

    calendarDays.forEach((day, index, calendarDaysArray) => {
        const calendarDate = new Date(day.date)

        if (day.booked && !booking?.start && isAfter(calendarDate, today)) {
            booking = {
                start: calendarDate,
                created: today,
                modified: today,
                year: calendarDate.getUTCFullYear(),
                status: BookingStatus.ACTIVE,
            }
        }

        if (booking?.start && !booking?.end) {
            if (!day.booked) {
                booking.end = new Date(calendarDaysArray[index - 1].date)
                bookings.push(cloneDeep(booking) as Booking)
                booking = {}
            }

            if (booking?.start && calendarDaysArray.length == index + 1) {
                booking.end = calendarDate
                bookings.push(cloneDeep(booking) as Booking)
                booking = {}
            }
        }
    })

    return bookings
}

export {createBookingsFromCalenderDays, saveBookings}
