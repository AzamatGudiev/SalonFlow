
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// Check for essential Firebase config variables
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error(
    "Firebase initialization error: Missing API Key or Project ID. " +
    "Please ensure NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID are correctly set in your .env.local file " +
    "and that you have restarted your development server."
  );
  // Depending on how critical Firebase is at startup, you might throw an error here
  // or allow the app to load with Firebase features disabled.
  // For now, we'll log the error and proceed, which will likely cause issues if Firebase is used.
}

if (getApps().length === 0) {
  // Only attempt to initialize if essential configs are present
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    try {
      app = initializeApp(firebaseConfig);
    } catch (error) {
      console.error("Firebase initialization failed:", error);
      // Handle the error appropriately - app might remain undefined
    }
  } else {
    // Log that initialization is skipped, app will remain undefined
    console.warn("Firebase initialization skipped due to missing essential configuration values (API Key or Project ID).");
  }
} else {
  app = getApp(); // Use the existing initialized app
}

// Initialize auth and db only if app was successfully initialized
if (app!) { // Using non-null assertion, assuming app should be initialized if config is correct
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  // If app is not initialized, auth and db cannot be.
  // This will likely lead to errors when auth or db are accessed elsewhere,
  // which will help identify the root configuration problem.
  console.error("Firebase app instance is not available. Auth and Firestore cannot be initialized.");
  // To prevent 'auth is not defined' errors later, you might assign dummy objects or throw:
  // auth = {} as Auth; // Or throw new Error("Auth not initialized");
  // db = {} as Firestore; // Or throw new Error("Firestore not initialized");
  // For this prototype, we'll let subsequent errors occur if app isn't init'd
  // as it points back to a setup issue.
}

export { app, auth, db };
