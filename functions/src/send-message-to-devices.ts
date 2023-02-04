import {firestore, messaging} from 'firebase-admin'
import {DeviceToken} from './device-tokens'
import {format} from 'date-fns'

async function sendMessageToDevices(numberOfNewBookings: number) {
    if (numberOfNewBookings > 0) {
        const deviceToken = await getToken()
        await messaging().sendToDevice(deviceToken.tokens, {
            data: {
                numberOfNewBookings: numberOfNewBookings.toString(),
                added: format(new Date(), 'yyyy-MM-dd'),
            },
        })
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
