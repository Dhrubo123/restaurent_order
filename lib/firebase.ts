import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  // Use environment variables for security
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "order-system-e669f.firebaseapp.com",
  projectId: "order-system-e669f",
  // This Asia-Southeast URL is perfect for low latency in Bangladesh
  databaseURL: "https://order-system-e669f-default-rtdb.asia-southeast1.firebasedatabase.app/",
  storageBucket: "order-system-e669f.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase (prevents errors during Next.js reloads)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };