// Firebase Configuration
// Get these values from your Firebase Console: https://console.firebase.google.com

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// ============================================
// FIREBASE SETUP INSTRUCTIONS:
// ============================================
// 1. Go to https://console.firebase.google.com
// 2. Click "Create a new project" or select existing project
// 3. Project name: "sattiyar-matrimony"
// 4. Enable Google Analytics (optional)
// 5. Go to Project Settings (gear icon)
// 6. Copy the Web SDK config values below
// 7. Enable Phone Authentication:
//    - Go to Authentication > Sign-in method
//    - Click "Phone"
//    - Enable it
//    - Add reCAPTCHA Enterprise or reCAPTCHA v3
// ============================================

const firebaseConfig = {
  // Replace these with your Firebase project credentials
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Set language for error messages
auth.languageCode = "en";

export default app;
