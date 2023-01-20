import {createBookingsFromCalenderDays} from './upsert-bookings-service'
import {CalendarDay} from './calendar-day'
import {BookingStatus} from './booking-status'

const DATE_2023_01_16 = 1673827200000
const DATE_2023_01_17 = 1673913600000
const DATE_2023_01_18 = 1674000000000
const DATE_2023_01_19 = 1674086400000
const DATE_2023_01_20 = 1674172800000
const DATE_2023_01_21 = 1674259200000
const DATE_2023_01_22 = 1674345600000

describe('Create bookings from the airbnb calendar', () => {
    test('Can create bookings 1', () => {
        const calendarDays: CalendarDay[] = [
            {date: DATE_2023_01_16, booked: false},
            {date: DATE_2023_01_17, booked: true},
            {date: DATE_2023_01_18, booked: true},
            {date: DATE_2023_01_19, booked: false},
            {date: DATE_2023_01_20, booked: true},
            {date: DATE_2023_01_21, booked: true},
            {date: DATE_2023_01_22, booked: true},
        ]

        const bookings = createBookingsFromCalenderDays(calendarDays)
        const booking1 = bookings[0]
        const booking2 = bookings[1]

        expect(bookings.length).toBe(2)

        expect(booking1.start).toEqual(new Date(DATE_2023_01_17))
        expect(booking1.end).toEqual(new Date(DATE_2023_01_18))
        expect(booking1.year).toEqual(2023)
        expect(booking1.status).toEqual(BookingStatus.ACTIVE)

        expect(booking2.start).toEqual(new Date(DATE_2023_01_20))
        expect(booking2.end).toEqual(new Date(DATE_2023_01_22))
        expect(booking2.year).toEqual(2023)
        expect(booking2.status).toEqual(BookingStatus.ACTIVE)
    })

    test('Can create bookings 2', () => {
        const calendarDays: CalendarDay[] = [
            {date: DATE_2023_01_16, booked: true},
            {date: DATE_2023_01_17, booked: true},
            {date: DATE_2023_01_18, booked: true},
            {date: DATE_2023_01_19, booked: true},
            {date: DATE_2023_01_20, booked: true},
            {date: DATE_2023_01_21, booked: true},
            {date: DATE_2023_01_22, booked: true},
        ]

        const bookings = createBookingsFromCalenderDays(calendarDays)
        const booking = bookings[0]

        expect(bookings.length).toBe(1)
        expect(booking.start).toEqual(new Date(DATE_2023_01_16))
        expect(booking.end).toEqual(new Date(DATE_2023_01_22))
        expect(booking.year).toEqual(2023)
        expect(booking.status).toEqual(BookingStatus.ACTIVE)
    })

    test('Can create bookings 3', () => {
        const calendarDays: CalendarDay[] = [
            {date: DATE_2023_01_16, booked: true},
            {date: DATE_2023_01_17, booked: true},
            {date: DATE_2023_01_18, booked: true},
            {date: DATE_2023_01_19, booked: false},
            {date: DATE_2023_01_20, booked: false},
            {date: DATE_2023_01_21, booked: true},
            {date: DATE_2023_01_22, booked: false},
        ]

        const bookings = createBookingsFromCalenderDays(calendarDays)
        const booking1 = bookings[0]
        const booking2 = bookings[1]

        expect(bookings.length).toBe(2)
        expect(booking1.start).toEqual(new Date(DATE_2023_01_16))
        expect(booking1.end).toEqual(new Date(DATE_2023_01_18))
        expect(booking1.year).toEqual(2023)
        expect(booking1.status).toEqual(BookingStatus.ACTIVE)

        expect(booking2.start).toEqual(new Date(DATE_2023_01_21))
        expect(booking2.end).toEqual(new Date(DATE_2023_01_21))
        expect(booking2.year).toEqual(2023)
        expect(booking2.status).toEqual(BookingStatus.ACTIVE)
    })

    test('Can create bookings 4', () => {
        const calendarDays: CalendarDay[] = [
            {date: DATE_2023_01_16, booked: false},
            {date: DATE_2023_01_17, booked: false},
            {date: DATE_2023_01_18, booked: false},
            {date: DATE_2023_01_19, booked: false},
            {date: DATE_2023_01_20, booked: false},
            {date: DATE_2023_01_21, booked: false},
            {date: DATE_2023_01_22, booked: false},
        ]

        const bookings = createBookingsFromCalenderDays(calendarDays)
        expect(bookings.length).toBe(0)
    })

    test('Can create bookings 5', () => {
        const calendarDays: CalendarDay[] = [
            {date: DATE_2023_01_16, booked: true},
            {date: DATE_2023_01_17, booked: false},
            {date: DATE_2023_01_18, booked: false},
            {date: DATE_2023_01_19, booked: false},
            {date: DATE_2023_01_20, booked: false},
            {date: DATE_2023_01_21, booked: false},
            {date: DATE_2023_01_22, booked: false},
        ]

        const bookings = createBookingsFromCalenderDays(calendarDays)
        expect(bookings.length).toBe(1)
        const booking1 = bookings[0]

        expect(booking1.start).toEqual(new Date(DATE_2023_01_16))
        expect(booking1.end).toEqual(new Date(DATE_2023_01_16))
        expect(booking1.year).toEqual(2023)
        expect(booking1.status).toEqual(BookingStatus.ACTIVE)
    })

    test('Can create bookings 6', () => {
        const calendarDays: CalendarDay[] = [
            {date: DATE_2023_01_16, booked: true},
            {date: DATE_2023_01_17, booked: false},
            {date: DATE_2023_01_18, booked: false},
            {date: DATE_2023_01_19, booked: false},
            {date: DATE_2023_01_20, booked: false},
            {date: DATE_2023_01_21, booked: false},
            {date: DATE_2023_01_22, booked: true},
        ]

        const bookings = createBookingsFromCalenderDays(calendarDays)
        const booking1 = bookings[0]
        const booking2 = bookings[1]

        expect(bookings.length).toBe(2)
        expect(booking1.start).toEqual(new Date(DATE_2023_01_16))
        expect(booking1.end).toEqual(new Date(DATE_2023_01_16))
        expect(booking1.year).toEqual(2023)
        expect(booking1.status).toEqual(BookingStatus.ACTIVE)

        expect(booking2.start).toEqual(new Date(DATE_2023_01_22))
        expect(booking2.end).toEqual(new Date(DATE_2023_01_22))
        expect(booking2.year).toEqual(2023)
        expect(booking2.status).toEqual(BookingStatus.ACTIVE)
    })
})
