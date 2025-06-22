// lib/firebase/reviews.js
import { db, storage } from "../../firebase";
import { doc, addDoc, getDocs,query,where,collection,serverTimestamp, updateDoc } from "firebase/firestore";
import {ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function submitReview({userId, productId, rating, comment, displayName, imageFile }) 
{
    //Purchase verification

    const hasPurchased = await hasUserPurchasedProduct(userId,productId);
    if (!hasPurchased) throw new Error("Only verified buyers can review");

    //Image handling
    let imageUrl = null;
    if (imageFile) {
        const storageRef = ref (storage, `reviews/${userId}_${Date.now()}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
    }

    //Admin moderation layer 
    const reviewData = {
        userId,
        productId,
        rating: Math.max(1, Math.min(5, rating)),
        comment:comment.substring(0, 500),
        displayName: displayName || "Anonymous",
        imageUrl,
        status: "pending_approval",
        createdAt: serverTimestamp()
    };

    return await addDoc(collection(db, "reviews"), reviewData);
}

//Enhanced query with admin approval check
export async function getReviewsForProduct(productId) {
    const q =query(
        collection(db, "reviews"),
        where("productId", "==", productId),
        where("status", "==", "approved")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate() || new Date()
    }));
}

export async function hasUserPurchasedProduct(userId, productId) {
    const q = query(
        collection(db, "purchases"),
        where("userId", "==", userId),
        where ("productId", "==", productId)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
}

export async function  approveReview(reviewId) {
    const reviewRef = doc(db, "reviews", reviewId);
    await updateDoc(reviewRef, {
        status: "approved",
        approvedAt: serverTimestamp()
    });
}