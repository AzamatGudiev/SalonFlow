
'use server';

import { db, auth } from '@/lib/firebase'; // Ensure auth is imported
import { UserProfileSchema, type UserProfile } from '@/lib/schemas';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const USERS_COLLECTION = 'users';

/**
 * Creates or updates a user's profile in Firestore.
 * Uses uid as the document ID.
 */
export async function setUserProfile(userData: UserProfile): Promise<{ success: boolean; error?: string }> {
  console.log("setUserProfile ACTION: Received userData:", JSON.stringify(userData));

  if (!db) {
    const errorMsg = "Firestore database (db) is not initialized in setUserProfile. Check firebase.ts and Vercel env vars.";
    console.error("setUserProfile ACTION:", errorMsg);
    return { success: false, error: errorMsg };
  }
  console.log("setUserProfile ACTION: 'db' instance appears to be defined.");

  if (!auth) {
    console.log("setUserProfile ACTION: Firebase 'auth' instance is not available in setUserProfile.");
  } else {
    console.log("setUserProfile ACTION: auth.currentUser on server (at start of action):", auth.currentUser ? auth.currentUser.uid : 'null');
  }

  const validationResult = UserProfileSchema.safeParse(userData);
  if (!validationResult.success) {
    const errorMessages = JSON.stringify(validationResult.error.flatten().fieldErrors);
    console.error("setUserProfile ACTION: Validation errors:", errorMessages);
    return { success: false, error: `Invalid user data: ${errorMessages}` };
  }

  try {
    const userDocRef = doc(db, USERS_COLLECTION, userData.uid);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { uid, ...profileDataForDoc } = validationResult.data;

    const dataToSet = {
      uid: userData.uid, // Ensure uid is part of the data written for rules like `request.resource.data.uid == userId`
      ...profileDataForDoc,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    console.log("setUserProfile ACTION: Attempting to set document with data:", JSON.stringify(dataToSet));
    await setDoc(userDocRef, dataToSet, { merge: true });
    console.log(`setUserProfile ACTION: Profile successfully set for UID: ${userData.uid}`);
    return { success: true };
  } catch (error: any) {
    console.error("setUserProfile ACTION: Error setting user profile in Firestore. Code:", error.code, "Message:", error.message, "Raw Error:", error);
    return { success: false, error: `Failed to save user profile. Firebase Code: ${error.code || 'UNKNOWN_ERROR'}` };
  }
}

/**
 * Fetches a user's profile from Firestore by their UID.
 */
export async function getUserProfile(uid: string): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
  console.log("getUserProfile ACTION: Attempting to fetch profile for UID:", uid);
  
  if (!db) {
    const errorMsg = "Firestore database (db) is not initialized in getUserProfile. Check firebase.ts and Vercel env vars.";
    console.error("getUserProfile ACTION:", errorMsg);
    return { success: false, error: errorMsg };
  }
  console.log("getUserProfile ACTION: 'db' instance appears to be defined.");

  if (!auth) {
    console.log("getUserProfile ACTION: Firebase 'auth' instance is not available in getUserProfile.");
  } else {
    console.log("getUserProfile ACTION: auth.currentUser on server (at start of action):", auth.currentUser ? auth.currentUser.uid : 'null');
  }
  
  if (!uid) {
    const errorMsg = "User UID is required to fetch profile (getUserProfile).";
    console.warn("getUserProfile ACTION:", errorMsg);
    return { success: false, error: errorMsg };
  }

  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { createdAt, updatedAt, ...profileData } = data;
      
      const validationResult = UserProfileSchema.safeParse({ ...profileData, uid: docSnap.id });
      
      if (validationResult.success) {
        console.log("getUserProfile ACTION: Profile successfully fetched for UID:", uid);
        return { success: true, profile: validationResult.data };
      } else {
        const errorMessages = JSON.stringify(validationResult.error.flatten().fieldErrors);
        console.warn("getUserProfile ACTION: Fetched user profile data is invalid for UID:", uid, "Errors:", errorMessages, "Data:", data);
        return { success: false, error: `Invalid user profile data structure after fetch. Errors: ${errorMessages}` };
      }
    } else {
      console.log(`getUserProfile ACTION: User profile document not found for UID: ${uid}`);
      return { success: false, error: "User profile not found." };
    }
  } catch (error: any) {
    console.error("getUserProfile ACTION: Error fetching user profile from Firestore for UID:", uid, "Code:", error.code, "Message:", error.message, "Raw Error:", error);
    return { success: false, error: `Failed to fetch user profile. Firebase Code: ${error.code || 'UNKNOWN_ERROR'}` };
  }
}

