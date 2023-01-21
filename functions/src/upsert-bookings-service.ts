import {Booking} from './booking'
import {CalendarDay} from './calendar-day'
import {BookingStatus} from './booking-status'
import {initializeApp} from 'firebase-admin'
import {getFirestore} from 'firebase-admin/firestore'
import {isEqual, isFuture} from 'date-fns'

async function filterNewBookings(bookings: Booking[], bookingsInDb: Booking[]) {
    return bookings
        .filter(b => isFuture(b.start))
        .filter(b => {
            bookingsInDb.find(bInDb => !isEqual(bInDb.start, b.start) && !isEqual(bInDb.end, b.end))
        })
}

async function getAllBookingsFromDb(firestore: FirebaseFirestore.Firestore): Promise<Booking[]> {
    const dbSnapshot = await firestore.collection('bookings').get()
    const bookingsInDb: Booking[] = []
    dbSnapshot.forEach(doc => bookingsInDb.push(doc.data() as Booking))
    return bookingsInDb
}

async function saveBookings(bookings: Booking[]) {
    initializeApp()
    const firestore = getFirestore()

    const bookingsInDb = await getAllBookingsFromDb(firestore)
    bookings = await filterNewBookings(bookings, bookingsInDb)
    await bookings.forEach(b => firestore.collection('bookings').add(b))

    await firestore.terminate()
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
                bookings.push(structuredClone(booking) as Booking)
                booking = {}
            }

            if (booking?.start && calendarDaysArray.length == index + 1) {
                booking.end = calendarDate
                bookings.push(structuredClone(booking) as Booking)
                booking = {}
            }
        }
    })

    return bookings
}

export {createBookingsFromCalenderDays, saveBookings}
