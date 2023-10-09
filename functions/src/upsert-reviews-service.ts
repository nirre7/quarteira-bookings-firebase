import {Review} from './review'
import {firestore} from 'firebase-admin'
import Firestore = firestore.Firestore
import QuerySnapshot = firestore.QuerySnapshot
import DocumentData = firestore.DocumentData

// eslint-disable-next-line max-len
function filterNewReviews(scrapedReviews: Review[], allReviewsFromDb: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>): Review[] {
    const idsFromDb = allReviewsFromDb.docs.map(doc => ((doc.data()) as Review).id) || []
    return scrapedReviews.filter(review => !idsFromDb.includes(review.id))
}

function saveNewReviews(firestore: FirebaseFirestore.Firestore, newReviews: Review[]): void {
    newReviews.forEach(review => {
        firestore.collection('reviews').add(review)
    })
}

async function saveReviews(scrapedReviews: Review[], firestore: FirebaseFirestore.Firestore): Promise<Review[]> {
    const allReviewsFromDb = await getAllReviewsFromDb(firestore)
    const newReviews = filterNewReviews(scrapedReviews, allReviewsFromDb)
    saveNewReviews(firestore, newReviews)

    return newReviews
}

async function getAllReviewsFromDb(firestore: Firestore): Promise<QuerySnapshot<DocumentData>> {
    return await firestore.collection('reviews').get()
}

export {saveReviews}
