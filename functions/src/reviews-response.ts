export interface ReviewsResponse {
    data: Data
    extensions: Extensions
}

export interface Data {
    presentation: Presentation
}

export interface Presentation {
    stayProductDetailPage: StayProductDetailPage
}

export interface StayProductDetailPage {
    reviews: Reviews
}

export interface Reviews {
    reviews: Review[]
    metadata: Metadata
}

export interface Review {
    collectionTag: any
    comments: string
    id: string
    language: string
    createdAt: string
    reviewee: Reviewee
    reviewer: Reviewer
    reviewHighlight: any
    localizedDate: string
    localizedRespondedDate: string
    localizedReviewerLocation: any
    localizedReview: LocalizedReview
    rating: number
    recommendedNumberOfLines: any
    response: string
    roomTypeListingTitle: any
    highlightedReviewSentence: any[]
    highlightReviewMentioned: any
    showMoreButton: ShowMoreButton
    subtitleItems: any[]
    channel: any
    reviewMediaItems: any[]
    isHostHighlightedReview: any
}

export interface Reviewee {
    deleted: boolean
    firstName: string
    hostName: string
    id: string
    pictureUrl: string
    profilePath: string
    isSuperhost: boolean
    userProfilePicture: UserProfilePicture
}

export interface UserProfilePicture {
    baseUrl: string
    onPressAction: OnPressAction
}

export interface OnPressAction {
    url: string
}

export interface Reviewer {
    deleted: boolean
    firstName: string
    hostName: string
    id: string
    pictureUrl: string
    profilePath: string
    isSuperhost: boolean
    userProfilePicture: UserProfilePicture2
}

export interface UserProfilePicture2 {
    baseUrl: string
    onPressAction: OnPressAction2
}

export interface OnPressAction2 {
    url: string
}

export interface LocalizedReview {
    comments: string
    commentsLanguage: string
    disclaimer: string
    needsTranslation: boolean
    response: string
    responseDisclaimer: string
}

export interface ShowMoreButton {
    __typename: string
    title: string
    loggingEventData: LoggingEventData
}

export interface LoggingEventData {
    loggingId: string
    experiments: any[]
    eventData: any
    eventDataSchemaName: any
    section: any
    component: any
}

export interface Metadata {
    reviewsCount: number
    modalSubtitle: any
    isReviewsSearchResults: any
    isReviewsHighlightTagResults: any
    isAutoTranslateOn: boolean
    endCursor: any
    experiments: any[]
}

export interface Extensions {
    traceId: string
}
