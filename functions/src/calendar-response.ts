export interface CalendarResponse {
    data: CalendarResponseMerlin
}

export interface CalendarResponseMerlin {
    merlin: Merlin
}

export interface Merlin {
    pdpAvailabilityCalendar: PdpAvailabilityCalendar
}

export interface PdpAvailabilityCalendar {
    calendarMonths: CalendarMonth[]
}

export interface CalendarMonth {
    month: number
    year: number
    days: Day[]
    conditionRanges: ConditionRange[]
}

export interface Day {
    calendarDate: string
    available: boolean
    maxNights: number
    minNights: number
    availableForCheckin: boolean
    availableForCheckout: boolean
    bookable?: boolean
    price: Price
}

export interface Price {
    localPriceFormatted: any
}

export interface ConditionRange {
    conditions: Conditions
    startDate: string
    endDate: string
}

export interface Conditions {
    closedToArrival: boolean
    closedToDeparture: boolean
    endDayOfWeek?: number
    maxNights: number
    minNights: number
}
