import {createBookingsFromCalenderDays} from './upsert-bookings-service'
import {CalendarDay} from './calendar-day'
import {BookingStatus} from './booking-status'

describe('Create bookings from the airbnb calendar', () => {
    test('Can create bookings 1', () => {
        const calendarDays: CalendarDay[] = [
            {date: new Date('2023-01-16'), booked: false},
            {date: new Date('2023-01-17'), booked: true},
            {date: new Date('2023-01-18'), booked: true},
            {date: new Date('2023-01-19'), booked: false},
            {date: new Date('2023-01-20'), booked: true},
            {date: new Date('2023-01-21'), booked: true},
            {date: new Date('2023-01-22'), booked: true},
        ]

        const bookings = createBookingsFromCalenderDays(calendarDays)
        const booking1 = bookings[0]
        const booking2 = bookings[1]

        expect(bookings.length).toBe(2)

        expect(booking1.start).toEqual(new Date('2023-01-17'))
        expect(booking1.end).toEqual(new Date('2023-01-18'))
        expect(booking1.year).toEqual(2023)
        expect(booking1.status).toEqual(BookingStatus.ACTIVE)

        expect(booking2.start).toEqual(new Date('2023-01-20'))
        expect(booking2.end).toEqual(new Date('2023-01-22'))
        expect(booking2.year).toEqual(2023)
        expect(booking2.status).toEqual(BookingStatus.ACTIVE)
    })

    test('Can create bookings 2', () => {
        const calendarDays: CalendarDay[] = [
            {date: new Date('2023-01-16'), booked: true},
            {date: new Date('2023-01-17'), booked: true},
            {date: new Date('2023-01-18'), booked: true},
            {date: new Date('2023-01-19'), booked: true},
            {date: new Date('2023-01-20'), booked: true},
            {date: new Date('2023-01-21'), booked: true},
            {date: new Date('2023-01-22'), booked: true},
        ]

        const bookings = createBookingsFromCalenderDays(calendarDays)
        const booking = bookings[0]

        expect(bookings.length).toBe(1)
        expect(booking.start).toEqual(new Date('2023-01-16'))
        expect(booking.end).toEqual(new Date('2023-01-22'))
        expect(booking.year).toEqual(2023)
        expect(booking.status).toEqual(BookingStatus.ACTIVE)
    })

    test('Can create bookings 3', () => {
        const calendarDays: CalendarDay[] = [
            {date: new Date('2023-01-16'), booked: true},
            {date: new Date('2023-01-17'), booked: true},
            {date: new Date('2023-01-18'), booked: true},
            {date: new Date('2023-01-19'), booked: false},
            {date: new Date('2023-01-20'), booked: false},
            {date: new Date('2023-01-21'), booked: true},
            {date: new Date('2023-01-22'), booked: false},
        ]

        const bookings = createBookingsFromCalenderDays(calendarDays)
        const booking1 = bookings[0]
        const booking2 = bookings[1]

        expect(bookings.length).toBe(2)
        expect(booking1.start).toEqual(new Date('2023-01-16'))
        expect(booking1.end).toEqual(new Date('2023-01-18'))
        expect(booking1.year).toEqual(2023)
        expect(booking1.status).toEqual(BookingStatus.ACTIVE)

        expect(booking2.start).toEqual(new Date('2023-01-21'))
        expect(booking2.end).toEqual(new Date('2023-01-21'))
        expect(booking2.year).toEqual(2023)
        expect(booking2.status).toEqual(BookingStatus.ACTIVE)
    })

    test('Can create bookings 4', () => {
        const calendarDays: CalendarDay[] = [
            {date: new Date('2023-01-16'), booked: false},
            {date: new Date('2023-01-17'), booked: false},
            {date: new Date('2023-01-18'), booked: false},
            {date: new Date('2023-01-19'), booked: false},
            {date: new Date('2023-01-20'), booked: false},
            {date: new Date('2023-01-21'), booked: false},
            {date: new Date('2023-01-22'), booked: false},
        ]

        const bookings = createBookingsFromCalenderDays(calendarDays)
        expect(bookings.length).toBe(0)
    })

    test('Can create bookings 5', () => {
        const calendarDays: CalendarDay[] = [
            {date: new Date('2023-01-16'), booked: true},
            {date: new Date('2023-01-17'), booked: false},
            {date: new Date('2023-01-18'), booked: false},
            {date: new Date('2023-01-19'), booked: false},
            {date: new Date('2023-01-20'), booked: false},
            {date: new Date('2023-01-21'), booked: false},
            {date: new Date('2023-01-22'), booked: false},
        ]

        const bookings = createBookingsFromCalenderDays(calendarDays)
        expect(bookings.length).toBe(1)
        const booking1 = bookings[0]

        expect(booking1.start).toEqual(new Date('2023-01-16'))
        expect(booking1.end).toEqual(new Date('2023-01-16'))
        expect(booking1.year).toEqual(2023)
        expect(booking1.status).toEqual(BookingStatus.ACTIVE)
    })

    test('Can create bookings 6', () => {
        const calendarDays: CalendarDay[] = [
            {date: new Date('2023-01-16'), booked: true},
            {date: new Date('2023-01-17'), booked: false},
            {date: new Date('2023-01-18'), booked: false},
            {date: new Date('2023-01-19'), booked: false},
            {date: new Date('2023-01-20'), booked: false},
            {date: new Date('2023-01-21'), booked: false},
            {date: new Date('2023-01-22'), booked: true},
        ]

        const bookings = createBookingsFromCalenderDays(calendarDays)
        const booking1 = bookings[0]
        const booking2 = bookings[1]

        expect(bookings.length).toBe(2)
        expect(booking1.start).toEqual(new Date('2023-01-16'))
        expect(booking1.end).toEqual(new Date('2023-01-16'))
        expect(booking1.year).toEqual(2023)
        expect(booking1.status).toEqual(BookingStatus.ACTIVE)

        expect(booking2.start).toEqual(new Date('2023-01-22'))
        expect(booking2.end).toEqual(new Date('2023-01-22'))
        expect(booking2.year).toEqual(2023)
        expect(booking2.status).toEqual(BookingStatus.ACTIVE)
    })
})
