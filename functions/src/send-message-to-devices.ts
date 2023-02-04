import {messaging, firestore} from 'firebase-admin'
import {DeviceToken} from './device-tokens'
import {format} from 'date-fns'

async function sendMessageToDevices(numberOfNewBookings: number) {
    const deviceToken = await getToken()
    await messaging().sendToDevice(deviceToken.tokens, {
        data: {
            numberOfNewBookings: numberOfNewBookings.toString(),
            added: format(new Date(), 'YYYY-MM-DD'),
        },
    })
}

async function getToken(): Promise<DeviceToken> {
    return await firestore()
        .collection('deviceTokens')
        .doc('niso@niso.com')
        .get() as unknown as DeviceToken
}

export {sendMessageToDevices}
