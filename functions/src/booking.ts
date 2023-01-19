import {BookingStatus} from './booking-status'

export interface Booking {
    start: Date
    end: Date
    created: Date
    modified: Date
    status: BookingStatus
    year: number
}
