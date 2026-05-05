import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Get this from Firebase Project Settings
  authDomain: "order-system-e669f.firebaseapp.com",
  projectId: "order-system-e669f",
  databaseURL: "https://order-system-e669f-default-rtdb.asia-southeast1.firebasedatabase.app/",
  storageBucket: "order-system-e669f.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase (prevents errors during Next.js reloads)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };