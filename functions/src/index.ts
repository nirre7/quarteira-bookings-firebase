import * as functions from 'firebase-functions'
import scrapeQuarteria from './scrape-quarteria'
import {createBookingsFromCalenderDays, saveBookings} from './upsert-bookings-service'

// TODO only for dev
// exports.scrape = functions
//     .runWith({
//         timeoutSeconds: 120,
//         memory: '512MB' || '2GB',
//     })
//     .region('europe-west3')
//     .https.onRequest(async (req, res) => {
//         const calendarDays = await scrapeQuarteria()
//         let bookings = createBookingsFromCalenderDays(calendarDays)
//         bookings = await saveBookings(bookings)
// eslint-disable-next-line max-len
//         const datesFromNewBookings = bookings.map(b => `${b.start.toDateString()} - ${b.end.toDateString()}`).join(', ')
//         functions.logger.info(`Saved ${bookings.length} bookings. ${datesFromNewBookings}`)
//         res.type('html').send(datesFromNewBookings)
//     })

exports.scrapingSchedule = functions
    .runWith({
        timeoutSeconds: 120,
        memory: '512MB' || '2GB',
    })
    .region('europe-west3')
    .pubsub
    .schedule('0 */6 * * *')
    .timeZone('Europe/Stockholm')
    .onRun(async context => {
        const calendarDays = await scrapeQuarteria()
        let bookings = createBookingsFromCalenderDays(calendarDays)
        bookings = await saveBookings(bookings)
        const datesFromNewBookings = bookings.map(b => `${b.start.toDateString()} - ${b.end.toDateString()}`).join(', ')
        functions.logger.info(`Saved ${bookings.length} bookings. ${datesFromNewBookings}`)
        return null
    })
