/**
 * Firebase Configuration for Production & Localhost
 * 
 * IMPORTANT: This file reads from environment variables that MUST be set in:
 * 1. .env.local (for local development)
 * 2. Vercel Environment Variables (for production)
 */

import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

// ============================================
// VALIDATE ENVIRONMENT VARIABLES
// ============================================

const requiredEnvVars = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
] as const;

type EnvVar = typeof requiredEnvVars[number];

/**
 * Get environment variable with fallback and validation
 */
function getEnvVar(key: EnvVar): string {
  const value = import.meta.env[key];
  
  if (!value || value === `YOUR_${key}`) {
    const isDev = import.meta.env.DEV;
    const environment = isDev ? "localhost" : "Vercel";
    
    console.error(
      `[Firebase] Missing or invalid environment variable: ${key}\n` +
      `Environment: ${environment}\n` +
      `Please check:\n` +
      (isDev 
        ? `  1. Create .env.local in project root\n` +
          `  2. Copy from .env.example\n` +
          `  3. Fill in your Firebase credentials\n` +
          `  4. Restart dev server`
        : `  1. Go to Vercel Dashboard > Settings > Environment Variables\n` +
          `  2. Add ${key} with your Firebase credential\n` +
          `  3. Redeploy the project`)
    );
    
    // Return placeholder to prevent complete failure during build
    return `[MISSING_${key}]`;
  }
  
  return value as string;
}

/**
 * Firebase configuration object
 * All values come from environment variables
 */
const firebaseConfig = {
  apiKey: getEnvVar("VITE_FIREBASE_API_KEY"),
  authDomain: getEnvVar("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnvVar("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: getEnvVar("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnvVar("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnvVar("VITE_FIREBASE_APP_ID"),
};

// ============================================
// VALIDATE CONFIGURATION
// ============================================

const isMissingCredentials = Object.values(firebaseConfig).some((val) =>
  typeof val === "string" && val.startsWith("[MISSING_")
);

if (isMissingCredentials) {
  console.error(
    "[Firebase] ❌ Configuration incomplete. App will not work properly.\n" +
    "Check console errors above for missing environment variables."
  );
} else {
  console.log(
    "[Firebase] ✅ Configuration loaded:\n" +
    `  • Project: ${firebaseConfig.projectId}\n` +
    `  • Domain: ${firebaseConfig.authDomain}\n` +
    `  • Environment: ${import.meta.env.DEV ? "Development" : "Production"}`
  );
}

// ============================================
// INITIALIZE FIREBASE
// ============================================

let app: FirebaseApp;
let auth: Auth;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  
  // Set language for error messages
  auth.languageCode = "en";
  
  console.log("[Firebase] ✅ Firebase initialized successfully");
} catch (error) {
  const err = error as Error;
  console.error(
    "[Firebase] ❌ Failed to initialize Firebase:\n" +
    err.message + "\n" +
    "This usually means your environment variables are invalid."
  );
  throw error;
}

export { app, auth };
export default app;
