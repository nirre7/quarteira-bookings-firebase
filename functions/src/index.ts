import * as functions from 'firebase-functions'
import scrapeQuarteria from './scrape-quarteria'
import {createBookingsFromCalenderDays, saveBookings} from './upsert-bookings-service'
import {sendMessageToDevices} from './send-message-to-devices'
import {getApps, initializeApp} from 'firebase-admin/app'
import {credential} from 'firebase-admin'

if (!getApps().length) {
    initializeApp({
        credential: credential.applicationDefault(),
    })
}

// TODO only for dev
// exports.scrape = functions
//     .runWith({
//         timeoutSeconds: 120,
//         memory: '512MB' || '2GB',
//     })
//     .region('europe-west3')
//     .https.onRequest(async (req, res) => {
//         const datesFromNewBookings = await scrapeAndSaveNewBookings()
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
        await scrapeAndSaveNewBookings()
        return null
    })

async function scrapeAndSaveNewBookings(): Promise<string> {
    const calendarDays = await scrapeQuarteria()
    let bookings = createBookingsFromCalenderDays(calendarDays)
    bookings = await saveBookings(bookings)
    await sendMessageToDevices(bookings.length)

    const datesFromNewBookings = bookings.map(b => `${b.start.toDateString()} - ${b.end.toDateString()}`).join(', ')
    functions.logger.info(`Saved ${bookings.length} bookings. ${datesFromNewBookings}`)
    return datesFromNewBookings
}
