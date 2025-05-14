
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

// Log all expected environment variables to see what Vercel functions are receiving
console.log("Firebase Init: NEXT_PUBLIC_FIREBASE_API_KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "Exists" : "MISSING");
console.log("Firebase Init: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "Exists" : "MISSING");
console.log("Firebase Init: NEXT_PUBLIC_FIREBASE_PROJECT_ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "Exists" : "MISSING");
console.log("Firebase Init: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:", process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? "Exists" : "MISSING");
console.log("Firebase Init: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:", process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? "Exists" : "MISSING");
console.log("Firebase Init: NEXT_PUBLIC_FIREBASE_APP_ID:", process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "Exists" : "MISSING");

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

let app: FirebaseApp | undefined = undefined;
let auth: Auth | undefined = undefined;
let db: Firestore | undefined = undefined;

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error(
    "Firebase Core Configuration Error: Critical Firebase config (apiKey or projectId) is MISSING. " +
    "Verify Vercel environment variables. Firebase services will NOT be available."
  );
} else {
  if (getApps().length === 0) {
    try {
      console.log("Firebase Init: No existing apps, attempting to initializeApp()...");
      app = initializeApp(firebaseConfig);
      console.log("Firebase Init: initializeApp() SUCCEEDED.");
    } catch (error) {
      console.error("Firebase Init: initializeApp() FAILED:", error);
    }
  } else {
    console.log("Firebase Init: Existing app found, using getApp().");
    app = getApp();
  }

  if (app) {
    try {
      auth = getAuth(app);
      console.log("Firebase Init: getAuth(app) SUCCEEDED.");
    } catch (serviceError) {
      console.error("Firebase Init: getAuth(app) FAILED:", serviceError);
    }
    try {
      db = getFirestore(app);
      console.log("Firebase Init: getFirestore(app) SUCCEEDED.");
    } catch (serviceError) {
      console.error("Firebase Init: getFirestore(app) FAILED:", serviceError);
    }
  } else {
    console.error("Firebase Init: Firebase app instance is UNDEFINED after initialization attempt.");
  }
}

if (!db) {
    console.error("Firebase Init: Firestore 'db' instance is UNDEFINED at the end of firebase.ts. Writes will fail.");
}
if (!auth) {
    console.error("Firebase Init: Firebase 'auth' instance is UNDEFINED at the end of firebase.ts. Auth operations will fail.");
}

export { app, auth, db };
