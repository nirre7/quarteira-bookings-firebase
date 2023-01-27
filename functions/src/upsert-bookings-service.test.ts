import {createBookingsFromCalenderDays, exportedForTesting} from './upsert-bookings-service'
import {CalendarDay} from './calendar-day'
import {BookingStatus} from './booking-status'
import {Booking} from './booking'
import * as admin from 'firebase-admin'
import {firestore} from 'firebase-admin'
import QuerySnapshot = firestore.QuerySnapshot

const DATE_2023_01_16 = 1673827200000
const DATE_2023_01_17 = 1673913600000
const DATE_2023_01_18 = 1674000000000
const DATE_2023_01_19 = 1674086400000
const DATE_2023_01_20 = 1674172800000
const DATE_2023_01_21 = 1674259200000
const DATE_2023_01_22 = 1674345600000
const DATE_2033_01_16 = 1989446400000
const DATE_2033_01_17 = 1989532800000
const DATE_2033_01_19 = 1989705600000
const DATE_2033_01_20 = 1989792000000
const DATE_2033_01_21 = 1989878400000

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

    test('Filter bookings, only "future" bookings', () => {
        const {filterNewBookings} = exportedForTesting

        const bookings: Booking[] = [
            {
                start: new Date(DATE_2023_01_16),
                end: new Date(DATE_2023_01_17),
                status: BookingStatus.ACTIVE,
                year: 2023,
                created: new Date(DATE_2023_01_16),
                modified: new Date(DATE_2023_01_16),
            },
        ]

        const bookingsFromDb = {docs: []} as unknown as QuerySnapshot<FirebaseFirestore.DocumentData>

        const filteredBookings = filterNewBookings(bookings, bookingsFromDb)

        expect(filteredBookings.length).toBe(0)
    })

    test('Filter bookings - same bookings in scrape and db', () => {
        const {filterNewBookings} = exportedForTesting

        const scrapedBookings: Booking[] = [
            {
                start: new Date(DATE_2033_01_16),
                end: new Date(DATE_2033_01_17),
                status: BookingStatus.ACTIVE,
                year: 2033,
                created: new Date(DATE_2033_01_16),
                modified: new Date(DATE_2033_01_16),
            },
        ]

        const bookingsFromDb = {
            docs: [
                {
                    data: () => {
                        return {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            start: admin.firestore.Timestamp.fromMillis(DATE_2033_01_16),
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            end: admin.firestore.Timestamp.fromMillis(DATE_2033_01_17),
                            status: BookingStatus.ACTIVE,
                            year: 2033,
                            created: new Date(DATE_2033_01_16),
                            modified: new Date(DATE_2033_01_16),
                        }
                    },
                },
            ],
        } as unknown as QuerySnapshot<FirebaseFirestore.DocumentData>

        const filteredBookings = filterNewBookings(scrapedBookings, bookingsFromDb)

        expect(filteredBookings.length).toBe(0)
    })

    test('Filter bookings - new bookings from scrape', () => {
        const {filterNewBookings} = exportedForTesting

        const scrapedBookings: Booking[] = [
            {
                start: new Date(DATE_2033_01_16),
                end: new Date(DATE_2033_01_17),
                status: BookingStatus.ACTIVE,
                year: 2033,
                created: new Date(DATE_2033_01_16),
                modified: new Date(DATE_2033_01_16),
            },
        ]

        const bookingsFromDb = {
            docs: [
                {
                    data: () => {
                        return {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            start: admin.firestore.Timestamp.fromMillis(DATE_2033_01_19),
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            end: admin.firestore.Timestamp.fromMillis(DATE_2033_01_21),
                            status: BookingStatus.ACTIVE,
                            year: 2033,
                            created: new Date(DATE_2033_01_19),
                            modified: new Date(DATE_2033_01_19),
                        }
                    },
                },
            ],
        } as unknown as QuerySnapshot<FirebaseFirestore.DocumentData>

        const filteredBookings = filterNewBookings(scrapedBookings, bookingsFromDb)

        expect(filteredBookings.length).toBe(1)
    })

    test('Filter bookings - new bookings from scrape 2', () => {
        const {filterNewBookings} = exportedForTesting

        const scrapedBookings: Booking[] = [
            {
                start: new Date(DATE_2033_01_16),
                end: new Date(DATE_2033_01_17),
                status: BookingStatus.ACTIVE,
                year: 2033,
                created: new Date(DATE_2033_01_16),
                modified: new Date(DATE_2033_01_16),
            },
        ]

        const bookingsFromDb = {docs: []} as unknown as QuerySnapshot<FirebaseFirestore.DocumentData>

        const filteredBookings = filterNewBookings(scrapedBookings, bookingsFromDb)

        expect(filteredBookings.length).toBe(1)
    })

    test('Filter bookings - new bookings from scrape 3', () => {
        const {filterNewBookings} = exportedForTesting

        const scrapedBookings: Booking[] = [
            {
                start: new Date(DATE_2033_01_16),
                end: new Date(DATE_2033_01_17),
                status: BookingStatus.ACTIVE,
                year: 2033,
                created: new Date(DATE_2033_01_16),
                modified: new Date(DATE_2033_01_16),
            },
        ]

        const bookingsFromDb = {
            docs: [
                {
                    data: () => {
                        return {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            start: admin.firestore.Timestamp.fromMillis(DATE_2033_01_19),
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            end: admin.firestore.Timestamp.fromMillis(DATE_2033_01_21),
                            status: BookingStatus.ACTIVE,
                            year: 2033,
                            created: new Date(DATE_2033_01_19),
                            modified: new Date(DATE_2033_01_19),
                        }
                    },
                },
                {
                    data: () => {
                        return {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            start: admin.firestore.Timestamp.fromMillis(DATE_2033_01_16),
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            end: admin.firestore.Timestamp.fromMillis(DATE_2033_01_17),
                            status: BookingStatus.ACTIVE,
                            year: 2033,
                            created: new Date(DATE_2033_01_16),
                            modified: new Date(DATE_2033_01_16),
                        }
                    },
                },
            ],
        } as unknown as QuerySnapshot<FirebaseFirestore.DocumentData>

        const filteredBookings = filterNewBookings(scrapedBookings, bookingsFromDb)

        expect(filteredBookings.length).toBe(0)
    })

    test('Filter bookings - new bookings from scrape 4', () => {
        const {filterNewBookings} = exportedForTesting

        const scrapedBookings: Booking[] = [
            {
                start: new Date(DATE_2033_01_16),
                end: new Date(DATE_2033_01_17),
                status: BookingStatus.ACTIVE,
                year: 2033,
                created: new Date(DATE_2033_01_16),
                modified: new Date(DATE_2033_01_16),
            },
            {
                start: new Date(DATE_2033_01_20),
                end: new Date(DATE_2033_01_21),
                status: BookingStatus.ACTIVE,
                year: 2033,
                created: new Date(DATE_2033_01_16),
                modified: new Date(DATE_2033_01_16),
            },
        ]

        const bookingsFromDb = {
            docs: [
                {
                    data: () => {
                        return {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            start: admin.firestore.Timestamp.fromMillis(DATE_2033_01_19),
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            end: admin.firestore.Timestamp.fromMillis(DATE_2033_01_21),
                            status: BookingStatus.ACTIVE,
                            year: 2033,
                            created: new Date(DATE_2033_01_19),
                            modified: new Date(DATE_2033_01_19),
                        }
                    },
                },
                {
                    data: () => {
                        return {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            start: admin.firestore.Timestamp.fromMillis(DATE_2033_01_16),
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            end: admin.firestore.Timestamp.fromMillis(DATE_2033_01_17),
                            status: BookingStatus.ACTIVE,
                            year: 2033,
                            created: new Date(DATE_2033_01_16),
                            modified: new Date(DATE_2033_01_16),
                        }
                    },
                },
            ],
        } as unknown as QuerySnapshot<FirebaseFirestore.DocumentData>

        const filteredBookings = filterNewBookings(scrapedBookings, bookingsFromDb)

        expect(filteredBookings.length).toBe(1)
    })

    test('Filter bookings - new bookings from scrape 5', () => {
        const {filterNewBookings} = exportedForTesting

        const scrapedBookings: Booking[] = [
            {
                start: new Date(DATE_2033_01_16),
                end: new Date(DATE_2033_01_17),
                status: BookingStatus.ACTIVE,
                year: 2033,
                created: new Date(DATE_2033_01_16),
                modified: new Date(DATE_2033_01_16),
            },
        ]

        const bookingsFromDb = {
            docs: [
                {
                    data: () => {
                        return {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            start: admin.firestore.Timestamp.fromMillis(DATE_2033_01_16),
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            end: admin.firestore.Timestamp.fromMillis(DATE_2033_01_17),
                            status: BookingStatus.REMOVED,
                            year: 2033,
                            created: new Date(DATE_2033_01_19),
                            modified: new Date(DATE_2033_01_19),
                        }
                    },
                },
            ],
        } as unknown as QuerySnapshot<FirebaseFirestore.DocumentData>

        const filteredBookings = filterNewBookings(scrapedBookings, bookingsFromDb)

        expect(filteredBookings.length).toBe(1)
    })

    test('Set bookings to removed if needed 1', () => {
        const {setBookingsToRemovedIfNeeded} = exportedForTesting
        const mockUpdate = jest.fn(obj => obj.status)

        const bookingsFromDb = {
            docs: [
                {
                    data: () => {
                        return {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            start: admin.firestore.Timestamp.fromMillis(DATE_2033_01_19),
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            end: admin.firestore.Timestamp.fromMillis(DATE_2033_01_21),
                            status: BookingStatus.REMOVED,
                            year: 2033,
                            created: new Date(DATE_2033_01_19),
                            modified: new Date(DATE_2033_01_19),
                        }
                    },
                    ref: {
                        update: mockUpdate,
                    },
                },
            ],
        } as unknown as QuerySnapshot<FirebaseFirestore.DocumentData>

        setBookingsToRemovedIfNeeded(bookingsFromDb, [])

        expect(mockUpdate.mock.calls).toHaveLength(0)
    })

    test('Set bookings to removed if needed 2', () => {
        const {setBookingsToRemovedIfNeeded} = exportedForTesting
        const mockUpdate = jest.fn(obj => obj.status)

        const scrapedBookings: Booking[] = [
            {
                start: new Date(DATE_2023_01_20),
                end: new Date(DATE_2033_01_21),
                status: BookingStatus.ACTIVE,
                year: 2033,
                created: new Date(DATE_2033_01_16),
                modified: new Date(DATE_2033_01_16),
            },
        ]

        const bookingsFromDb = {
            docs: [
                {
                    data: () => {
                        return {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            start: admin.firestore.Timestamp.fromMillis(DATE_2033_01_19),
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            end: admin.firestore.Timestamp.fromMillis(DATE_2033_01_21),
                            status: BookingStatus.ACTIVE,
                            year: 2033,
                            created: new Date(DATE_2033_01_19),
                            modified: new Date(DATE_2033_01_19),
                        }
                    },
                    ref: {
                        update: mockUpdate,
                    },
                },
            ],
        } as unknown as QuerySnapshot<FirebaseFirestore.DocumentData>

        setBookingsToRemovedIfNeeded(bookingsFromDb, scrapedBookings)

        expect(mockUpdate.mock.calls).toHaveLength(1)
    })

    test('Set bookings to removed if needed 3', () => {
        const {setBookingsToRemovedIfNeeded} = exportedForTesting
        const mockUpdate = jest.fn(obj => obj.status)

        const scrapedBookings: Booking[] = []

        const bookingsFromDb = {
            docs: [
                {
                    data: () => {
                        return {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            start: admin.firestore.Timestamp.fromMillis(DATE_2033_01_19),
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            end: admin.firestore.Timestamp.fromMillis(DATE_2033_01_21),
                            status: BookingStatus.ACTIVE,
                            year: 2033,
                            created: new Date(DATE_2033_01_19),
                            modified: new Date(DATE_2033_01_19),
                        }
                    },
                    ref: {
                        update: mockUpdate,
                    },
                },
            ],
        } as unknown as QuerySnapshot<FirebaseFirestore.DocumentData>

        setBookingsToRemovedIfNeeded(bookingsFromDb, scrapedBookings)

        expect(mockUpdate.mock.calls).toHaveLength(1)
    })

    test('Set bookings to removed if needed 4', () => {
        const {setBookingsToRemovedIfNeeded} = exportedForTesting
        const mockUpdate = jest.fn(obj => obj.status)

        const scrapedBookings: Booking[] = [
            {
                start: new Date(DATE_2033_01_19),
                end: new Date(DATE_2033_01_21),
                status: BookingStatus.ACTIVE,
                year: 2033,
                created: new Date(DATE_2033_01_16),
                modified: new Date(DATE_2033_01_16),
            },
        ]

        const bookingsFromDb = {
            docs: [
                {
                    data: () => {
                        return {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            start: admin.firestore.Timestamp.fromMillis(DATE_2033_01_19),
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            end: admin.firestore.Timestamp.fromMillis(DATE_2033_01_21),
                            status: BookingStatus.ACTIVE,
                            year: 2033,
                            created: new Date(DATE_2033_01_19),
                            modified: new Date(DATE_2033_01_19),
                        }
                    },
                    ref: {
                        update: mockUpdate,
                    },
                },
            ],
        } as unknown as QuerySnapshot<FirebaseFirestore.DocumentData>

        setBookingsToRemovedIfNeeded(bookingsFromDb, scrapedBookings)

        expect(mockUpdate.mock.calls).toHaveLength(0)
    })

    test('Set bookings to removed if needed 5', () => {
        const {setBookingsToRemovedIfNeeded} = exportedForTesting
        const mockUpdate = jest.fn(obj => obj.status)

        const scrapedBookings: Booking[] = [
            {
                start: new Date(DATE_2033_01_16),
                end: new Date(DATE_2033_01_17),
                status: BookingStatus.ACTIVE,
                year: 2033,
                created: new Date(DATE_2033_01_16),
                modified: new Date(DATE_2033_01_16),
            },
            {
                start: new Date(DATE_2033_01_20),
                end: new Date(DATE_2033_01_21),
                status: BookingStatus.ACTIVE,
                year: 2033,
                created: new Date(DATE_2033_01_16),
                modified: new Date(DATE_2033_01_16),
            },
        ]

        const bookingsFromDb = {
            docs: [
                {
                    data: () => {
                        return {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            start: admin.firestore.Timestamp.fromMillis(DATE_2033_01_20),
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            end: admin.firestore.Timestamp.fromMillis(DATE_2033_01_21),
                            status: BookingStatus.ACTIVE,
                            year: 2033,
                            created: new Date(DATE_2033_01_19),
                            modified: new Date(DATE_2033_01_19),
                        }
                    },
                    ref: {
                        update: mockUpdate,
                    },
                },
                {
                    data: () => {
                        return {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            start: admin.firestore.Timestamp.fromMillis(DATE_2033_01_16),
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            end: admin.firestore.Timestamp.fromMillis(DATE_2033_01_17),
                            status: BookingStatus.ACTIVE,
                            year: 2033,
                            created: new Date(DATE_2033_01_16),
                            modified: new Date(DATE_2033_01_16),
                        }
                    },
                    ref: {
                        update: mockUpdate,
                    },
                },
            ],
        } as unknown as QuerySnapshot<FirebaseFirestore.DocumentData>

        setBookingsToRemovedIfNeeded(bookingsFromDb, scrapedBookings)

        expect(mockUpdate.mock.calls).toHaveLength(0)
    })
})
