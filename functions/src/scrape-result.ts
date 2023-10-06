import {CalendarDay} from './calendar-day'
import {Review} from './review'

export interface ScrapeResult {
    calendarDays: CalendarDay[]
    reviews: Review[]
}
