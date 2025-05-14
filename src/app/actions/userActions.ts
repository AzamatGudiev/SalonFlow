
'use server';

import { db } from '@/lib/firebase';
import { UserProfileSchema, type UserProfile } from '@/lib/schemas';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const USERS_COLLECTION = 'users';

/**
 * Creates or updates a user's profile in Firestore.
 * Uses uid as the document ID.
 */
export async function setUserProfile(userData: UserProfile): Promise<{ success: boolean; error?: string }> {
  if (!db) {
    return { success: false, error: "Firestore database is not initialized (setUserProfile)." };
  }
  const validationResult = UserProfileSchema.safeParse(userData);
  if (!validationResult.success) {
    const errorMessages = JSON.stringify(validationResult.error.flatten().fieldErrors);
    console.error("Validation errors (setUserProfile):", errorMessages);
    return { success: false, error: errorMessages };
  }

  try {
    const userDocRef = doc(db, USERS_COLLECTION, userData.uid);
    await setDoc(userDocRef, { ...validationResult.data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error setting user profile in Firestore:", error);
    return { success: false, error: "Failed to save user profile." };
  }
}

/**
 * Fetches a user's profile from Firestore by their UID.
 */
export async function getUserProfile(uid: string): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
  if (!db) {
    return { success: false, error: "Firestore database is not initialized (getUserProfile)." };
  }
  if (!uid) {
    return { success: false, error: "User UID is required to fetch profile." };
  }

  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Exclude timestamp fields before parsing with UserProfileSchema if they exist and are not part of schema
      const { createdAt, updatedAt, ...profileData } = data;
      const validationResult = UserProfileSchema.safeParse({ ...profileData, uid: docSnap.id });
      if (validationResult.success) {
        return { success: true, profile: validationResult.data };
      } else {
        console.warn("Fetched user profile data is invalid:", validationResult.error.flatten().fieldErrors, "Document ID:", docSnap.id);
        return { success: false, error: "Invalid user profile data." };
      }
    } else {
      return { success: false, error: "User profile not found." };
    }
  } catch (error) {
    console.error("Error fetching user profile from Firestore:", error);
    return { success: false, error: "Failed to fetch user profile." };
  }
}
