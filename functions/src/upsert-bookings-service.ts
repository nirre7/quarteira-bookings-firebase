import {Booking} from './booking'
import {CalendarDay} from './calendar-day'
import {BookingStatus} from './booking-status'
import {getFirestore} from 'firebase-admin/firestore'
import {eachDayOfInterval, isAfter, isFuture, isSameDay, isWithinInterval, max, min} from 'date-fns'
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

function doesBookingOverlapBookingsInDb(scrapedBooking: Booking, bookingsInDb: QuerySnapshot<DocumentData>): boolean {
    return bookingsInDb.docs
        .filter(bInDb => bInDb.data()?.status === BookingStatus.ACTIVE)
        .filter(bInDb => {
            const startInDb = getStart(bInDb)
            const endInDb = getEnd(bInDb)
            return !isSameDay(startInDb, scrapedBooking.start) || !isSameDay(endInDb, scrapedBooking.end)
        })
        .some(bInDb => {
            const startInDb = getStart(bInDb)
            const endInDb = getEnd(bInDb)
            return isWithinInterval(startInDb, {start: scrapedBooking.start, end: scrapedBooking.end}) &&
                isWithinInterval(endInDb, {start: scrapedBooking.start, end: scrapedBooking.end})
        })
}

function getNweBookingFromOverlap(scrapedBooking: Booking, bookingsInDb: QuerySnapshot<DocumentData>): Booking {
    const bookingsInDbWithinSameInterval = bookingsInDb.docs
        .filter(bInDb => bInDb.data()?.status === BookingStatus.ACTIVE)
        .filter(bInDb => {
            const startInDb = getStart(bInDb)
            const endInDb = getEnd(bInDb)
            return isWithinInterval(startInDb, {start: scrapedBooking.start, end: scrapedBooking.end}) &&
                isWithinInterval(endInDb, {start: scrapedBooking.start, end: scrapedBooking.end})
        })

    const datesWithinIntervalInDb = bookingsInDbWithinSameInterval.flatMap(bInDb => eachDayOfInterval({
        start: getStart(bInDb),
        end: getEnd(bInDb),
    }))

    const datesInNewBookingInterval = eachDayOfInterval({start: scrapedBooking.start, end: scrapedBooking.end})
    // eslint-disable-next-line max-len
    const newBookingDates = datesInNewBookingInterval.filter(d1 => !datesWithinIntervalInDb.some(d2 => isSameDay(d1, d2)))

    return {
        ...scrapedBooking,
        start: min(newBookingDates),
        end: max(newBookingDates),
    }
}

function isNewBooking(scrapedBooking: Booking, bookingsInDb: QuerySnapshot<DocumentData>): boolean {
    return !bookingsInDb.docs
        .filter(bInDb => bInDb.data()?.status === BookingStatus.ACTIVE)
        .some(bInDb => {
            const startInDb = getStart(bInDb)
            const endInDb = getEnd(bInDb)

            return isSameDay(scrapedBooking.start, startInDb) && isSameDay(scrapedBooking.end, endInDb)
        })
}

function findNewBookings(bookings: Booking[], bookingsInDb: QuerySnapshot<FirebaseFirestore.DocumentData>) {
    const newBookings: Booking[] = []

    bookings
        .filter(b => isFuture(new Date(b.start)))
        .forEach(b => {
            const overlapBookingsInDb = doesBookingOverlapBookingsInDb(b, bookingsInDb)

            if (overlapBookingsInDb) {
                newBookings.push(getNweBookingFromOverlap(b, bookingsInDb))
            } else if (isNewBooking(b, bookingsInDb)) {
                newBookings.push(b)
            }
        })

    return newBookings
}

export const exportedForTesting = {
    filterNewBookings: findNewBookings,
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

async function saveBookings(scrapedBookings: Booking[]): Promise<Booking[]> {
    const firestore = getFirestore()

    const bookingsInDb = await getAllBookingsFromDb(firestore)
    await setBookingsToRemovedIfNeeded(bookingsInDb, scrapedBookings)
    const newBookings = findNewBookings(scrapedBookings, bookingsInDb)

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
