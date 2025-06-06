// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDmfEUtqRYCaFkh0sAKFQf1NVazE4BYoWI",
  authDomain: "businessconsultancyweb.firebaseapp.com",
  projectId: "businessconsultancyweb",
  storageBucket: "businessconsultancyweb.firebasestorage.app",
  messagingSenderId: "977444208766",
  appId: "1:977444208766:web:b7e1f8d9162ce75d0a982f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
