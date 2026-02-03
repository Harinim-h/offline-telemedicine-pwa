// src/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 🔹 Your Firebase configuration
// (Copy EXACTLY from Firebase Console → Project settings)
const firebaseConfig = {
  apiKey: "AIzaSyCkF7vnpw_U7lASQ2wiC2YhlaL_LcEVkto",
  authDomain: "offline-telemedicine-pwa.firebaseapp.com",
  projectId: "offline-telemedicine-pwa",
  storageBucket: "offline-telemedicine-pwa.firebasestorage.app",
  messagingSenderId: "157619316543",
  appId: "1:157619316543:web:29da9321dbc34d8d66d58a"
};

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔹 Initialize Firestore
export const db = getFirestore(app);

