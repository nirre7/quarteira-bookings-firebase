import {firestore, messaging} from 'firebase-admin'
import {DeviceToken} from './device-tokens'
import {format} from 'date-fns'
import * as functions from 'firebase-functions'
import {Booking} from './booking'

async function sendMessageToDevices(bookings: Booking[]) {
    const numberOfNewBookings = bookings.length
    if (numberOfNewBookings) {
        const deviceToken = await getToken()
        const title = numberOfNewBookings === 1 ? 'New booking' : 'New bookings'
        // eslint-disable-next-line max-len
        let body = numberOfNewBookings === 1 ? 'One booking has been added:\n' : `${numberOfNewBookings} bookings has been added:\n`
        bookings.forEach(b => body += `> ${format(b.start, 'yyyy-MM-dd')} - ${format(b.end, 'yyyy-MM-dd')} \n`)

        try {
            messaging().sendMulticast({
                tokens: deviceToken.tokens,
                android: {
                    priority: 'high',
                    notification: {
                        priority: 'high',
                        icon: 'ic_notification',
                    },
                },
                notification: {
                    title,
                    body,
                },
                data: {
                    numberOfNewBookings: numberOfNewBookings.toString(),
                    added: format(new Date(), 'yyyy-MM-dd'),
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
}

async function getToken(): Promise<DeviceToken> {
    const documentSnapshot = await firestore()
        .collection('deviceTokens')
        .doc('niso@niso.com')
        .get()

    return documentSnapshot.data() as DeviceToken
}

export {sendMessageToDevices}
