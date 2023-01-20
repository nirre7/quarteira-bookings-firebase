import {Booking} from './booking'
import {CalendarDay} from './calendar-day'
import {BookingStatus} from './booking-status'

function createBookingsFromCalenderDays(calendarDays: CalendarDay[]): Partial<Booking>[] {
    const bookings: Partial<Booking>[] = []
    let booking: Partial<Booking>
    const today = new Date()

    calendarDays.forEach((day, index, calendarDaysArray) => {
        if (day.booked && !booking?.start) {
            booking = {
                start: day.date,
                created: today,
                modified: today,
                year: day.date.getUTCFullYear(),
                status: BookingStatus.ACTIVE,
            }
        }

        if (booking?.start && !booking?.end) {
            if (!day.booked) {
                booking.end = calendarDaysArray[index - 1].date
                bookings.push(structuredClone(booking))
                booking = {}
            }

            if (booking?.start && calendarDaysArray.length == index + 1) {
                booking.end = day.date
                bookings.push(structuredClone(booking))
                booking = {}
            }
        }
    })

    return bookings
}

export {createBookingsFromCalenderDays}
