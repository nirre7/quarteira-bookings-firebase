import puppeteer from 'puppeteer'
import * as functions from 'firebase-functions'
import {CalendarDay} from './calendar-day'
import {CalendarResponse} from './calendar-response'

const scrapeQuarteira = async (): Promise<CalendarDay[]> => {
    const calendarDays: CalendarDay[] = []

    const browser = await puppeteer.launch({
        headless: true,
        timeout: 20000,
        ignoreHTTPSErrors: true,
        args: [
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--disable-setuid-sandbox',
            '--no-first-run',
            '--no-sandbox',
            '--no-zygote',
            '--window-size=1280,720',
        ],
    })

    try {
        functions.logger.info('Starting scrape')

        const page = await browser.newPage()
        await page.setViewport({width: 1280, height: 720})
        await page.setUserAgent(
            // eslint-disable-next-line max-len
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36'
        )

        page.on('response', async interceptedResponse => {
            if (interceptedResponse.url().startsWith('https://www.airbnb.com/api/v3/PdpAvailabilityCalendar')) {
                const days = getCalenderDays(await interceptedResponse.json())
                calendarDays.push(...days)
            }
        })

        await page.goto('https://www.airbnb.com/rooms/647559808158441027', {
            waitUntil: 'networkidle2',
        })
    } catch (e) {
        functions.logger.error(e)
    } finally {
        if (browser) {
            await browser.close()
        }

        functions.logger.info('Done with scrape')
    }

    return calendarDays
}

function getCalenderDays(calendar: CalendarResponse): CalendarDay[] {
    const calendarDays: CalendarDay[] = []

    calendar?.data?.merlin?.pdpAvailabilityCalendar?.calendarMonths.forEach(month => {
        month.days.forEach(day => {
            calendarDays.push({
                date: Date.parse(day.calendarDate),
                booked: !day.available,
            })
        })
    })

    return removeDuplicates(calendarDays)
}

function removeDuplicates(calendarDays: CalendarDay[]) {
    return calendarDays.filter((object, index, self) => {
        return index === self.findIndex(day => day['date'] === object['date'])
    })
}

export default scrapeQuarteira
