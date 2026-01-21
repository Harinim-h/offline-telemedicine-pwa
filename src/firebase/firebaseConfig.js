// src/firebase/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

// 🔹 Your Firebase config (from Firebase Console)
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
const db = getFirestore(app);

// 🔥 Enable OFFLINE persistence (IndexedDB)
enableIndexedDbPersistence(db)
  .then(() => {
    console.log("✅ Firestore offline persistence enabled");
  })
  .catch((err) => {
    console.log("❌ Persistence error:", err.code);
  });

// 🔹 Export database
export { db };
