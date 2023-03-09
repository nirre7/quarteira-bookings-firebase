import {createBookingsFromCalenderDays, exportedForTesting} from './upsert-bookings-service'
import {CalendarDay} from './calendar-day'
import {BookingStatus} from './booking-status'
import {Booking} from './booking'
import * as admin from 'firebase-admin'
import {firestore} from 'firebase-admin'
import {addDays, isSameDay, subDays} from 'date-fns'
import QuerySnapshot = firestore.QuerySnapshot

const today = Date.now()
const dayBeforeYesterday = subDays(today, 2).getTime()
const yesterday = subDays(today, 1).getTime()
const tomorrow = addDays(today, 1).getTime()
const twoDaysInTheFuture = addDays(today, 2).getTime()
const threeDaysInTheFuture = addDays(today, 3).getTime()
const fourDaysInTheFuture = addDays(today, 4).getTime()
const fiveDaysInTheFuture = addDays(today, 5).getTime()
const sixDaysInTheFuture = addDays(today, 6).getTime()
const sevenDaysInTheFuture = addDays(today, 7).getTime()
const DATE_2033_01_16 = 1989486000000
const DATE_2033_01_17 = 1989572400000
const DATE_2033_01_18 = 1989658800000
const DATE_2033_01_19 = 1989745200000
const DATE_2033_01_20 = 1989831600000
const DATE_2033_01_21 = 1989918000000

describe('Create bookings from the airbnb calendar', () => {
    test('Can create bookings in future 1', () => {
        const calendarDays: CalendarDay[] = [
            {date: tomorrow, booked: false},
            {date: twoDaysInTheFuture, booked: true},
            {date: threeDaysInTheFuture, booked: true},
            {date: fourDaysInTheFuture, booked: false},
            {date: fiveDaysInTheFuture, booked: true},
            {date: sixDaysInTheFuture, booked: true},
            {date: sevenDaysInTheFuture, booked: true},
        ]

        const bookings = createBookingsFromCalenderDays(calendarDays)
        const booking1 = bookings[0]
        const booking2 = bookings[1]

        expect(bookings.length).toBe(2)

        expect(booking1.start).toEqual(new Date(twoDaysInTheFuture))
        expect(booking1.end).toEqual(new Date(threeDaysInTheFuture))
        expect(booking1.year).toEqual(2023)
        expect(booking1.status).toEqual(BookingStatus.ACTIVE)

        expect(booking2.start).toEqual(new Date(fiveDaysInTheFuture))
        expect(booking2.end).toEqual(new Date(sevenDaysInTheFuture))
        expect(booking2.year).toEqual(2023)
        expect(booking2.status).toEqual(BookingStatus.ACTIVE)
    })

    test('Can create bookings in future 2', () => {
        const calendarDays: CalendarDay[] = [
            {date: tomorrow, booked: true},
            {date: twoDaysInTheFuture, booked: true},
            {date: threeDaysInTheFuture, booked: true},
            {date: fourDaysInTheFuture, booked: true},
            {date: fiveDaysInTheFuture, booked: true},
            {date: sixDaysInTheFuture, booked: true},
            {date: sevenDaysInTheFuture, booked: true},
        ]

        const bookings = createBookingsFromCalenderDays(calendarDays)
        const booking = bookings[0]

        expect(bookings.length).toBe(1)
        expect(booking.start).toEqual(new Date(tomorrow))
        expect(booking.end).toEqual(new Date(sevenDaysInTheFuture))
        expect(booking.year).toEqual(2023)
        expect(booking.status).toEqual(BookingStatus.ACTIVE)
    })

    test('Can create bookings in future 3', () => {
        const calendarDays: CalendarDay[] = [
            {date: tomorrow, booked: true},
            {date: twoDaysInTheFuture, booked: true},
            {date: threeDaysInTheFuture, booked: true},
            {date: fourDaysInTheFuture, booked: false},
            {date: fiveDaysInTheFuture, booked: false},
            {date: sixDaysInTheFuture, booked: true},
            {date: sevenDaysInTheFuture, booked: false},
        ]

        const bookings = createBookingsFromCalenderDays(calendarDays)
        const booking1 = bookings[0]
        const booking2 = bookings[1]

        expect(bookings.length).toBe(2)
        expect(booking1.start).toEqual(new Date(tomorrow))
        expect(booking1.end).toEqual(new Date(threeDaysInTheFuture))
        expect(booking1.year).toEqual(2023)
        expect(booking1.status).toEqual(BookingStatus.ACTIVE)

        expect(booking2.start).toEqual(new Date(sixDaysInTheFuture))
        expect(booking2.end).toEqual(new Date(sixDaysInTheFuture))
        expect(booking2.year).toEqual(2023)
        expect(booking2.status).toEqual(BookingStatus.ACTIVE)
    })

    test('Can create bookings in future 4', () => {
        const calendarDays: CalendarDay[] = [
            {date: tomorrow, booked: false},
            {date: twoDaysInTheFuture, booked: false},
            {date: threeDaysInTheFuture, booked: false},
            {date: fourDaysInTheFuture, booked: false},
            {date: fiveDaysInTheFuture, booked: false},
            {date: sixDaysInTheFuture, booked: false},
            {date: sevenDaysInTheFuture, booked: false},
        ]

        const bookings = createBookingsFromCalenderDays(calendarDays)
        expect(bookings.length).toBe(0)
    })

    test('Can create bookings in future 5', () => {
        const calendarDays: CalendarDay[] = [
            {date: tomorrow, booked: true},
            {date: twoDaysInTheFuture, booked: false},
            {date: threeDaysInTheFuture, booked: false},
            {date: fourDaysInTheFuture, booked: false},
            {date: fiveDaysInTheFuture, booked: false},
            {date: sixDaysInTheFuture, booked: false},
            {date: sevenDaysInTheFuture, booked: false},
        ]

        const bookings = createBookingsFromCalenderDays(calendarDays)
        expect(bookings.length).toBe(1)
        const booking1 = bookings[0]

        expect(booking1.start).toEqual(new Date(tomorrow))
        expect(booking1.end).toEqual(new Date(tomorrow))
        expect(booking1.year).toEqual(2023)
        expect(booking1.status).toEqual(BookingStatus.ACTIVE)
    })

    test('Can create bookings in future 6', () => {
        const calendarDays: CalendarDay[] = [
            {date: tomorrow, booked: true},
            {date: twoDaysInTheFuture, booked: false},
            {date: threeDaysInTheFuture, booked: false},
            {date: fourDaysInTheFuture, booked: false},
            {date: fiveDaysInTheFuture, booked: false},
            {date: sixDaysInTheFuture, booked: false},
            {date: sevenDaysInTheFuture, booked: true},
        ]

        const bookings = createBookingsFromCalenderDays(calendarDays)
        const booking1 = bookings[0]
        const booking2 = bookings[1]

        expect(bookings.length).toBe(2)
        expect(booking1.start).toEqual(new Date(tomorrow))
        expect(booking1.end).toEqual(new Date(tomorrow))
        expect(booking1.year).toEqual(2023)
        expect(booking1.status).toEqual(BookingStatus.ACTIVE)

        expect(booking2.start).toEqual(new Date(sevenDaysInTheFuture))
        expect(booking2.end).toEqual(new Date(sevenDaysInTheFuture))
        expect(booking2.year).toEqual(2023)
        expect(booking2.status).toEqual(BookingStatus.ACTIVE)
    })

    test('Can create bookings: previous and current day is always "booked"', () => {
        const today = Date.now()
        const todayAsDate = new Date()
        const dayBeforeYesterday = subDays(today, 2).getTime()
        const yesterday = subDays(today, 1).getTime()
        const tomorrow = addDays(today, 1).getTime()
        const dayAfterTomorrow = addDays(today, 2).getTime()

        const calendarDays: CalendarDay[] = [
            {date: dayBeforeYesterday, booked: true},
            {date: yesterday, booked: true},
            {date: today, booked: true},
            {date: tomorrow, booked: true},
            {date: dayAfterTomorrow, booked: false},
        ]

        const bookings = createBookingsFromCalenderDays(calendarDays)
        const booking1 = bookings[0]

        expect(bookings.length).toBe(1)
        expect(booking1.start).toEqual(new Date(tomorrow))
        expect(booking1.end).toEqual(new Date(tomorrow))
        expect(booking1.year).toEqual(todayAsDate.getUTCFullYear())
        expect(booking1.status).toEqual(BookingStatus.ACTIVE)
    })

    test('Filter bookings, only "future" bookings', () => {
        const {filterNewBookings} = exportedForTesting

        const bookings: Booking[] = [
            {
                start: new Date(dayBeforeYesterday),
                end: new Date(yesterday),
                status: BookingStatus.ACTIVE,
                year: 2023,
                created: new Date(dayBeforeYesterday),
                modified: new Date(dayBeforeYesterday),
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

    test('Filter bookings - scrape is within interval of booking in db', () => {
        const {filterNewBookings} = exportedForTesting

        const scrapedBookings: Booking[] = [
            {
                start: new Date(DATE_2033_01_17),
                end: new Date(DATE_2033_01_20),
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
                            end: admin.firestore.Timestamp.fromMillis(DATE_2033_01_21),
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

    test('Filter bookings - new booking is in between 2 old bookings', () => {
        const {filterNewBookings} = exportedForTesting

        const scrapedBookings: Booking[] = [
            {
                start: new Date(DATE_2033_01_16),
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
                            start: admin.firestore.Timestamp.fromMillis(DATE_2033_01_16),
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            end: admin.firestore.Timestamp.fromMillis(DATE_2033_01_17),
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
                            start: admin.firestore.Timestamp.fromMillis(DATE_2033_01_20),
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            end: admin.firestore.Timestamp.fromMillis(DATE_2033_01_21),
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
        expect(isSameDay(filteredBookings[0].start, new Date(DATE_2033_01_18))).toBeTruthy()
        expect(isSameDay(filteredBookings[0].end, new Date(DATE_2033_01_19))).toBeTruthy()
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

    /**
     * In this case a new booking should be created and the old one should still be active
     */
    test('Set bookings to removed if needed 2', () => {
        const {setBookingsToRemovedIfNeeded} = exportedForTesting
        const mockUpdate = jest.fn(obj => obj.status)

        const scrapedBookings: Booking[] = [
            {
                start: new Date(DATE_2033_01_16),
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

    /**
     * It is probably (!) a new booking between to old bookings
     */
    test('Do not set bookings to removed if bookings are within a scraped bookings date.', async () => {
        const {setBookingsToRemovedIfNeeded} = exportedForTesting
        const mockUpdate = jest.fn(obj => obj.status)

        const scrapedBookings: Booking[] = [
            {
                start: new Date(DATE_2033_01_16),
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
                            start: admin.firestore.Timestamp.fromMillis(DATE_2033_01_16),
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            end: admin.firestore.Timestamp.fromMillis(DATE_2033_01_17),
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
                            start: admin.firestore.Timestamp.fromMillis(DATE_2033_01_19),
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            end: admin.firestore.Timestamp.fromMillis(DATE_2033_01_21),
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

        await setBookingsToRemovedIfNeeded(bookingsFromDb, scrapedBookings)

        expect(mockUpdate.mock.calls).toHaveLength(2)
    })
})
