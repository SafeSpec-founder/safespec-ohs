import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { logger } from "../utils/logger";

// Support both browser and Node environments
const env =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env
    : (process.env as Record<string, string>);

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "safespec-ohs.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "safespec-ohs",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "safespec-ohs.appspot.com",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, "us-central1");

// Connect to emulators in development
const isDev = env.DEV === "true" || env.NODE_ENV !== "production";
if (isDev) {
  const useEmulators = env.VITE_USE_FIREBASE_EMULATORS === "true";

  if (useEmulators) {
    try {
      connectAuthEmulator(auth, "http://localhost:9099");
      connectFirestoreEmulator(db, "localhost", 8080);
      connectStorageEmulator(storage, "localhost", 9199);
      connectFunctionsEmulator(functions, "localhost", 5001);
      logger.info("Connected to Firebase emulators");
    } catch (error) {
      logger.warn("Failed to connect to Firebase emulators:", error);
    }
  }
}

export default app;
