import {Reviewer} from './reviews-response'

export interface Review {
    guestComments: string
    created: Date
    id: string
    language: string
    response: string
    reviewer: Reviewer
}
