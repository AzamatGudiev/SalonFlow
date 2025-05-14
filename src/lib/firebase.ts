
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

// It's crucial that these are correctly set in .env.local or your hosting environment
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID; // Optional

let app: FirebaseApp | undefined = undefined;
let auth: Auth | undefined = undefined;
let db: Firestore | undefined = undefined;

if (!apiKey || !projectId) {
  console.error(
    "Firebase Core Configuration Error: Missing NEXT_PUBLIC_FIREBASE_API_KEY or NEXT_PUBLIC_FIREBASE_PROJECT_ID. " +
    "Please ensure these are correctly set in your .env.local file (and that you've restarted your dev server) or in your Firebase Studio environment settings. " +
    "Firebase services will not be available."
  );
} else {
  // All essential configurations seem to be present (as strings)
  const firebaseConfig = {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    measurementId,
  };

  if (typeof window !== "undefined") { // Ensure Firebase is initialized only on the client-side for Next.js if not using App Router with server components that need it
    if (getApps().length === 0) {
      try {
        app = initializeApp(firebaseConfig);
        console.log("Firebase app initialized successfully on the client.");
      } catch (error) {
        console.error("Firebase client-side initialization failed:", error);
        // app remains undefined
      }
    } else {
      app = getApp(); // Use the existing initialized app
      console.log("Using existing Firebase app instance on the client.");
    }
  } else {
    // Handling for server-side initialization if ever needed, though typically client-side for web apps.
    // For Next.js App Router, direct server-side initialization might be less common for client SDKs.
    // If you were using Firebase Admin SDK on the server, this part would be different.
    console.warn("Firebase SDK initialization is primarily for client-side. Server-side initialization (if intended) would require a different approach (e.g., Firebase Admin SDK).");
  }


  if (app) {
    try {
      auth = getAuth(app);
      db = getFirestore(app);
      console.log("Firebase Auth and Firestore services obtained.");
    } catch (serviceError) {
      console.error("Failed to obtain Firebase Auth/Firestore services:", serviceError);
      // auth and db might remain undefined or throw during getAuth/getFirestore
    }
  } else {
    if (apiKey && projectId) { // Only warn if config was present but app still not initialized
        console.warn("Firebase app instance is not available even though config was provided. Auth and Firestore cannot be initialized.");
    }
  }
}

export { app, auth, db };
