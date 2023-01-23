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

exports.scrapingSchedule = functions
    .region('europe-west3')
    .pubsub
    .schedule('06:00')
    .timeZone('Europe/Stockholm')
    .onRun(async context => {
        const calendarDays = await scrapeQuarteria()
        let bookings = createBookingsFromCalenderDays(calendarDays)
        bookings = await saveBookings(bookings)
        const datesFromNewBookings = bookings.map(b => `${b.start.toDateString()} - ${b.end.toDateString()}`).join(', ')
        functions.logger.info(`Saved ${bookings.length} bookings. ${datesFromNewBookings}`)
        return null
    })
