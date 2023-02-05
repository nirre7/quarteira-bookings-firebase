import {firestore, messaging} from 'firebase-admin'
import {DeviceToken} from './device-tokens'
import {format} from 'date-fns'
import * as functions from 'firebase-functions'

async function sendMessageToDevices(numberOfNewBookings: number) {
    if (numberOfNewBookings > 0) {
        const deviceToken = await getToken()
        try {
            messaging().sendMulticast({
                tokens: deviceToken.tokens,
                data: {
                    numberOfNewBookings: numberOfNewBookings.toString(),
                    added: format(new Date(), 'yyyy-MM-dd'),
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
