
'use server';

import { db } from '@/lib/firebase';
import { UserProfileSchema, type UserProfile } from '@/lib/schemas';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'; // Added serverTimestamp

const USERS_COLLECTION = 'users';

/**
 * Creates or updates a user's profile in Firestore.
 * Uses uid as the document ID.
 */
export async function setUserProfile(userData: UserProfile): Promise<{ success: boolean; error?: string }> {
  if (!db) {
    console.error("setUserProfile: Firestore database (db) is not initialized.");
    return { success: false, error: "Firestore database is not initialized (setUserProfile)." };
  }
  const validationResult = UserProfileSchema.safeParse(userData);
  if (!validationResult.success) {
    const errorMessages = JSON.stringify(validationResult.error.flatten().fieldErrors);
    console.error("setUserProfile: Validation errors:", errorMessages);
    return { success: false, error: `Invalid user data: ${errorMessages}` };
  }

  try {
    const userDocRef = doc(db, USERS_COLLECTION, userData.uid);
    const dataToSet = {
      ...validationResult.data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(userDocRef, dataToSet, { merge: true });
    console.log(`setUserProfile: Profile successfully set for UID: ${userData.uid}`);
    return { success: true };
  } catch (error: any) {
    console.error("setUserProfile: Error setting user profile in Firestore. Code:", error.code, "Message:", error.message, "Raw Error:", error);
    return { success: false, error: `Failed to save user profile. Firebase Code: ${error.code}` };
  }
}

/**
 * Fetches a user's profile from Firestore by their UID.
 */
export async function getUserProfile(uid: string): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
  if (!db) {
    console.error("getUserProfile: Firestore database (db) is not initialized.");
    return { success: false, error: "Firestore database is not initialized (getUserProfile)." };
  }
  if (!uid) {
    console.warn("getUserProfile: User UID is required to fetch profile.");
    return { success: false, error: "User UID is required to fetch profile." };
  }

  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Exclude timestamp fields before parsing with UserProfileSchema if they exist and are not part of schema
      // UserProfileSchema itself does not define createdAt/updatedAt, so Firestore data can have them.
      const { createdAt, updatedAt, ...profileData } = data;
      const validationResult = UserProfileSchema.safeParse({ ...profileData, uid: docSnap.id });
      
      if (validationResult.success) {
        return { success: true, profile: validationResult.data };
      } else {
        console.warn("getUserProfile: Fetched user profile data is invalid for UID:", uid, "Errors:", validationResult.error.flatten().fieldErrors, "Data:", data);
        return { success: false, error: "Invalid user profile data structure after fetch." };
      }
    } else {
      console.log(`getUserProfile: User profile document not found for UID: ${uid}`);
      return { success: false, error: "User profile not found." };
    }
  } catch (error: any) {
    console.error("getUserProfile: Error fetching user profile from Firestore for UID:", uid, "Code:", error.code, "Message:", error.message, "Raw Error:", error);
    return { success: false, error: `Failed to fetch user profile. Firebase Code: ${error.code}` };
  }
}

