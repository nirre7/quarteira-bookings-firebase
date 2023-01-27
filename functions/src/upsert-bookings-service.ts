import {Booking} from './booking'
import {CalendarDay} from './calendar-day'
import {BookingStatus} from './booking-status'
import {getFirestore} from 'firebase-admin/firestore'
import {isEqual, isFuture} from 'date-fns'
import {firestore} from 'firebase-admin'
import {getApps, initializeApp} from 'firebase-admin/app'
import {cloneDeep} from 'lodash'
import Timestamp = firestore.Timestamp
import QuerySnapshot = firestore.QuerySnapshot
import DocumentData = firestore.DocumentData
import Firestore = firestore.Firestore

function filterNewBookings(bookings: Booking[], bookingsInDb: QuerySnapshot<FirebaseFirestore.DocumentData>) {
    return bookings
        .filter(b => isFuture(new Date(b.start)))
        .filter(b => {
            return !bookingsInDb.docs.some(bInDb => {
                const startInDb = ((bInDb.data() as Booking).start as unknown as Timestamp).toDate()
                const endInDb = ((bInDb.data() as Booking).end as unknown as Timestamp).toDate()

                return isEqual(b.start, startInDb) &&
                    isEqual(b.end, endInDb) &&
                    bInDb.data().status !== BookingStatus.REMOVED
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
        .filter(b => (b.data() as Booking).status !== BookingStatus.REMOVED)
        .filter(b => {
            const startInDb = ((b.data() as Booking).start as unknown as Timestamp).toDate()
            const endInDb = ((b.data() as Booking).end as unknown as Timestamp).toDate()

            return !scrapedBookings.some(sb => isEqual(sb.start, startInDb) && isEqual(sb.end, endInDb))
        })

    for (const booking of bookingsToBeSetToRemoved) {
        await booking.ref.update({status: BookingStatus.REMOVED})
    }
}

async function saveBookings(scrapedBookings: Booking[]): Promise<Booking[]> {
    if (!getApps().length) {
        initializeApp()
    }
    const firestore = getFirestore()

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

        if (day.booked && !booking?.start) {
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
