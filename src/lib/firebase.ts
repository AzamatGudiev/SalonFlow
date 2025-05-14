
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
  // All essential configurations seem to be present
  const firebaseConfig = {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    measurementId,
  };

  // Initialize Firebase universally (works for client and server components/actions)
  if (getApps().length === 0) {
    try {
      app = initializeApp(firebaseConfig);
      console.log("Firebase app initialized successfully.");
    } catch (error) {
      console.error("Firebase initialization failed:", error);
      // app remains undefined
    }
  } else {
    app = getApp(); // Use the existing initialized app
    console.log("Using existing Firebase app instance.");
  }

  if (app) {
    try {
      auth = getAuth(app); // Obtain Auth instance
      db = getFirestore(app); // Obtain Firestore instance
      console.log("Firebase Auth and Firestore services obtained.");
    } catch (serviceError) {
      console.error("Failed to obtain Firebase Auth/Firestore services:", serviceError);
      // auth and db might remain undefined or throw during getAuth/getFirestore
    }
  } else {
    // This warning will now primarily trigger if initializeApp failed even with config present.
    if (apiKey && projectId) { 
        console.warn("Firebase app instance is not available even though config was provided. Auth and Firestore cannot be initialized.");
    }
  }
}

export { app, auth, db };
