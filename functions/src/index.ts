import * as functions from 'firebase-functions'
import scrapeQuarteria from './scrape-quarteria'
import {createBookingsFromCalenderDays, saveBookings} from './upsert-bookings-service'
import {sendBookingNotifications, sendReviewsNotifications} from './send-message-to-devices'
import {getApps, initializeApp} from 'firebase-admin/app'
import {credential} from 'firebase-admin'
import {saveReviews} from './upsert-reviews-service'
import {getFirestore} from 'firebase-admin/firestore'

if (!getApps().length) {
    initializeApp({
        credential: credential.applicationDefault(),
    })
}

// // TODO only for dev
// const DATE_2033_01_16 = 1989446400000
// const DATE_2033_01_17 = 1989532800000
// const DATE_2033_01_20 = 1989792000000
// const DATE_2033_01_21 = 1989878400000
// exports.testNotification = functions
//     .runWith({
//         timeoutSeconds: 120,
//     })
//     .region('europe-west3')
//     .https.onRequest(async (req, res) => {
//         const bookings: Booking[] = [
//             {
//                 start: new Date(DATE_2033_01_16),
//                 end: new Date(DATE_2033_01_17),
//                 status: BookingStatus.ACTIVE,
//                 year: 2033,
//                 created: new Date(DATE_2033_01_16),
//                 modified: new Date(DATE_2033_01_16),
//             },
//             {
//                 start: new Date(DATE_2033_01_20),
//                 end: new Date(DATE_2033_01_21),
//                 status: BookingStatus.ACTIVE,
//                 year: 2033,
//                 created: new Date(DATE_2033_01_16),
//                 modified: new Date(DATE_2033_01_16),
//             },
//         ]
//         await sendMessageToDevices(bookings)
//         res.type('html').send('Send message')
//     })

export const firestore = getFirestore()

// TODO only for dev
exports.scrape = functions
    .runWith({
        timeoutSeconds: 120,
        memory: '512MB' || '2GB',
    })
    .region('europe-west3')
    .https.onRequest(async (req, res) => {
        const datesFromNewBookings = await scrapeAndSaveNewBookings()
        res.type('html').send(datesFromNewBookings)
    })

exports.scrapingSchedule = functions
    .runWith({
        timeoutSeconds: 120,
        memory: '512MB' || '2GB',
    })
    .region('europe-west3')
    .pubsub
    .schedule('0 */4 * * *')
    .timeZone('Europe/Stockholm')
    .onRun(async context => {
        await scrapeAndSaveNewBookings()
        return null
    })

async function scrapeAndSaveNewBookings(): Promise<string> {
    const scrapeResult = await scrapeQuarteria()

    let bookings = createBookingsFromCalenderDays(scrapeResult.calendarDays)
    bookings = await saveBookings(bookings, firestore)
    await sendBookingNotifications(bookings)

    const reviews = await saveReviews(scrapeResult.reviews, firestore)
    await sendReviewsNotifications(reviews)

    const datesFromNewBookings = bookings.map(b => `${b.start.toDateString()} - ${b.end.toDateString()}`).join(', ')
    functions.logger.info(`Saved ${bookings.length} bookings. ${datesFromNewBookings}`)

    const idsFromReviews = reviews.map(r => `${r.id}`).join(', ')
    functions.logger.info(`Saved ${bookings.length} reviews. ${idsFromReviews}`)
    return idsFromReviews
}
