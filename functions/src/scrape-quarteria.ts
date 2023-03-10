import puppeteer, {Page} from 'puppeteer'
import * as functions from 'firebase-functions'
import {CalendarDay} from './calendar-day'

async function getCalenderDays(page: Page): Promise<CalendarDay[]> {
    return await page.$$eval('div[data-section-id="AVAILABILITY_CALENDAR_INLINE"] .notranslate', divs => {
        return divs
            .map(div => {
                const dateAsString = div.getAttribute('data-testid') || ''
                    .replace('calendar-day-', '')

                return {
                    date: Date.parse(dateAsString),
                    booked: JSON.parse(div.getAttribute('data-is-day-blocked') || ''),
                }
            })
    })
}

async function clickNextOnCalendar(page: Page): Promise<void> {
    await page.click('div[data-section-id="AVAILABILITY_CALENDAR_INLINE"] div._qz9x4fc > button', {
        delay: 1000,
    })
}

function removeDuplicates(calendarDays: CalendarDay[]) {
    return calendarDays.filter((object, index, self) => {
        return index === self.findIndex(day => day['date'] === object['date'])
    })
}

const scrapeQuarteira = async (): Promise<CalendarDay[]> => {
    let calendarDays: CalendarDay[] = []

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

        await page.goto('https://www.airbnb.com/rooms/647559808158441027', {
            waitUntil: 'networkidle2',
        })

        await clickNextOnCalendar(page)
        await clickNextOnCalendar(page)
        await getCalenderDays(page).then(days => calendarDays.push(...days))

        for (let i = 0; i < 9; i++) {
            await clickNextOnCalendar(page)
            await getCalenderDays(page).then(days => calendarDays.push(...days))
            calendarDays = removeDuplicates(calendarDays)
        }

        calendarDays.map(d => functions.logger.debug(new Date(d.date)))
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

export default scrapeQuarteira
