// lib/firebase/customRequests.js
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function sendCustomRequest(requestData) {
  try {
    await addDoc(collection(db, "customRequests"), {
      ...requestData,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to save custom request:", error);
    throw new Error("Saving request to database failed.");
  }
}
