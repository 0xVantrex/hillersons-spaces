// lib/firebase/logPurchase.js
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";


export const logPurchase = async (userId, productId) => {
    try {
        await addDoc (collection(db, "purchases"), {
            userId,
            productId,
            timestamp: serverTimestamp(),
        });
    } catch (error) {
        console.error("Failed to log purchase:", error);
    }
};