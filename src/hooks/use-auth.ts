
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth as firebaseAuthInstance } from '@/lib/firebase'; // Renamed to avoid conflict
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { getUserProfile, type UserProfile } from '@/app/actions/userActions';

export type { UserRole, UserProfile } from '@/lib/schemas'; // Re-export for convenience

// Combined type for our hook's user object
export interface AuthenticatedUser extends UserProfile {
  firebaseUid: string;
}

export function useAuth() {
  const [authUser, setAuthUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!firebaseAuthInstance) {
      if (typeof window !== 'undefined') { // Only log on client
          console.error("useAuth: Firebase auth instance from '@/lib/firebase' is not available. Firebase might not have initialized correctly due to missing/incorrect environment variables on your hosting platform or an issue in firebase.ts.");
      }
      setIsLoading(false);
      return;
    } else {
      if (typeof window !== 'undefined') { // Only log on client
        console.log("useAuth: Firebase auth instance is available. Setting up onAuthStateChanged listener.");
      }
    }

    const unsubscribe = onAuthStateChanged(firebaseAuthInstance, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Attempt to fetch user profile from Firestore
        const profileResult = await getUserProfile(firebaseUser.uid);
        if (profileResult.success && profileResult.profile) {
          setAuthUser({ 
            ...profileResult.profile, 
            firebaseUid: firebaseUser.uid 
          });
        } else {
          // Profile not found in Firestore or error fetching.
          // This can happen during signup if Firestore write is slower than this check.
          // Instead of signing out immediately, we'll log the warning and set authUser to null.
          // The user is still authenticated with Firebase Auth.
          // If it's a new signup, the profile should appear shortly.
          // If it's an existing user and profile is missing, it's a data integrity issue.
          console.warn(`useAuth: User profile not found or failed to fetch for UID: ${firebaseUser.uid}. Error: ${profileResult.error}. The user is authenticated with Firebase Auth, but their Firestore profile is missing or inaccessible. This might be a temporary state during signup, or a data issue for existing users.`);
          setAuthUser(null); // Clear local authUser state, but DONT sign out of Firebase Auth here.
                             // This allows the signup process to complete the Firestore profile write.
                             // If redirect to dashboard still fails, it means profile was not created successfully.
        }
      } else {
        // No Firebase user (logged out)
        setAuthUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    if (firebaseAuthInstance) {
      try {
        await firebaseSignOut(firebaseAuthInstance);
        // onAuthStateChanged will set authUser to null and isLoading to false
        router.push('/auth/login'); 
      } catch (error) {
        console.error("Error signing out: ", error);
        // Even if sign out fails, clear local state and attempt redirect
        setAuthUser(null);
        setIsLoading(false);
        router.push('/auth/login');
      }
    } else {
        // Fallback if firebaseAuthInstance was never available
        setAuthUser(null);
        setIsLoading(false);
        router.push('/auth/login');
    }
  }, [router]);

  return { 
    user: authUser,
    role: authUser?.role || null, 
    isLoggedIn: !!authUser, 
    isLoading, 
    logout,
    rawAuthLoaded: !!firebaseAuthInstance 
  };
}
