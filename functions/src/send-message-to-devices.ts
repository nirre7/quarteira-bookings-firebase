import {firestore, messaging} from 'firebase-admin'
import {DeviceToken} from './device-tokens'
import {format} from 'date-fns'
import * as functions from 'firebase-functions'
import {Booking} from './booking'
import {Review} from './review'
import {BaseMessage} from 'firebase-admin/lib/messaging'

async function sendBookingNotifications(bookings: Booking[]): Promise<void> {
    const numberOfNewBookings = bookings.length
    if (numberOfNewBookings) {
        const title = numberOfNewBookings === 1 ? 'New booking' : 'New bookings'
        // eslint-disable-next-line max-len
        let body = numberOfNewBookings === 1 ? 'One booking has been added:\n' : `${numberOfNewBookings} bookings has been added:\n`
        bookings.forEach(b => body += `> ${format(b.start, 'yyyy-MM-dd')} - ${format(b.end, 'yyyy-MM-dd')} \n`)

        await sendMessageToDevices({
            notification: {title, body},
            data: {
                numberOfNewBookings: numberOfNewBookings.toString(),
                added: format(new Date(), 'yyyy-MM-dd'),
            },
        })
    }
}

async function sendMessageToDevices(message: BaseMessage) {
    const deviceToken = await getToken()

    try {
        messaging().sendMulticast({
            ...message,
            tokens: deviceToken.tokens,
            android: {
                priority: 'high',
                notification: {
                    priority: 'high',
                    icon: 'ic_notification',
                },
            },
            apns: {
                payload: {
                    aps: {
                        contentAvailable: true,
                    },
                },
            },
        }).then(response => {
            if (response.failureCount > 0) {
                functions.logger.warn(`Error sending ${response.failureCount} message(s)`)
            } else {
                functions.logger.info(`${response.successCount} message(s) sent successfully`)
            }
        })
    } catch (e) {
        functions.logger.error(e, 'Could not send message to device(s)')
    }
}

async function getToken(): Promise<DeviceToken> {
    const documentSnapshot = await firestore()
        .collection('deviceTokens')
        .doc('niso@niso.com')
        .get()

    return documentSnapshot.data() as DeviceToken
}

async function sendReviewsNotifications(reviews: Review[]): Promise<void> {
    const numberOfNewReviews = reviews.length
    if (numberOfNewReviews) {
        const title = numberOfNewReviews === 1 ? 'New review' : 'New reviews'
        // eslint-disable-next-line max-len
        let body = numberOfNewReviews === 1 ? 'One review has been added:\n' : `${numberOfNewReviews} reviews has been added:\n`
        reviews.forEach(r => body += `> ${format(r.created, 'yyyy-MM-dd')} - ${r.reviewer.hostName} \n`)

        await sendMessageToDevices({
            notification: {title, body},
            data: {
                numberOfNewReviews: numberOfNewReviews.toString(),
                added: format(new Date(), 'yyyy-MM-dd'),
            },
        })
    }
}

export {sendReviewsNotifications, sendBookingNotifications}
