import * as functions from 'firebase-functions'
import scrapeQuarteria from './scrape-quarteria'
import {createBookingsFromCalenderDays, saveBookings} from './upsert-bookings-service'

exports.scrape = functions
    .runWith({
        timeoutSeconds: 120,
        memory: '512MB' || '2GB',
    })
    .region('europe-west3')
    .https.onRequest(async (req, res) => {
        const calendarDays = await scrapeQuarteria()
        let bookings = createBookingsFromCalenderDays(calendarDays)
        bookings = await saveBookings(bookings)
        res.type('html').send(bookings.map(b => b.start).join('<br>'))
    })

// TODO setup scheduled job
// exports.scrapingSchedule = functions.pubsub
//     .schedule('06:00')
//     .timeZone('Europe/Stockholm')
//     .onRun(async context => {
//       await scrapeQuarteria()
//       return null
//     })
