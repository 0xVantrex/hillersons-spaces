 // src/lib/firebase/firebase.js

//Import Firebase libraries
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth }from "firebase/auth";
import { getStorage }from "firebase/storage";

//Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDmfEUtqRYCaFkh0sAKFQf1NVazE4BYoWI",
  authDomain: "businessconsultancyweb.firebaseapp.com",
  projectId: "businessconsultancyweb",
  storageBucket: "businessconsultancyweb.firebasestorage.app",
  messagingSenderId: "977444208766",
  appId: "1:977444208766:web:b7e1f8d9162ce75d0a982f"
};

//Initialize Firebase once
const app = initializeApp(firebaseConfig);

//Export initialized services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export {db, auth, storage };
