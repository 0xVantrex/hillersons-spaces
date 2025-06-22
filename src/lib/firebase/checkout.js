import { db } from "@lib/firebase/firebase";
import { collection,addDoc,serverTimestamp, Timestamp } from "firebase/firestore";


/** 
 * Saves a new order to Firestore
 * @param {Array} cart - the cart items
 * @param {Number} total - The total price
 * @param {Object} contact -User contact
info (name, email, phone)
 * @param {String|null} userId - Optional user ID if logged in
 */
export async function createOrder(cart, total,contact, userId=null){
    try {
        const docRef = await
    addDoc(collection(db, "orders"), {
        userID:userId || null,
        items: cart,
        total,
        contact,
        status: "pending",
        timestamp: serverTimestamp(),
    });

    return { success: true, orderId:
docRef.id };
    } catch(error) {
        console.error("Error creating order:",error);
        return{success: false, error:
    error.message };
    }
}