import {firestore, messaging} from 'firebase-admin'
import {DeviceToken} from './device-tokens'
import {format} from 'date-fns'
import * as functions from 'firebase-functions'

async function sendMessageToDevices(numberOfNewBookings: number) {
    if (numberOfNewBookings > 0) {
        const deviceToken = await getToken()
        try {
            await messaging().sendToDevice(deviceToken.tokens, {
                data: {
                    numberOfNewBookings: numberOfNewBookings.toString(),
                    added: format(new Date(), 'yyyy-MM-dd'),
                },
            })
        } catch (e) {
            functions.logger.error(e, 'Could not send message to device')
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
