import {Booking} from './booking'
import {CalendarDay} from './calendar-day'
import {BookingStatus} from './booking-status'
import {initializeApp} from 'firebase-admin'
import {getFirestore} from 'firebase-admin/firestore'

async function saveBookings(bookings: Partial<Booking>[]) {
    initializeApp()
    const firestore = getFirestore()
    await bookings.forEach(b => firestore.collection('bookings').add(b))
    await firestore.terminate()
}

function createBookingsFromCalenderDays(calendarDays: CalendarDay[]): Partial<Booking>[] {
    const bookings: Partial<Booking>[] = []
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
                bookings.push(structuredClone(booking))
                booking = {}
            }

            if (booking?.start && calendarDaysArray.length == index + 1) {
                booking.end = calendarDate
                bookings.push(structuredClone(booking))
                booking = {}
            }
        }
    })

    return bookings
}

export {createBookingsFromCalenderDays, saveBookings}
