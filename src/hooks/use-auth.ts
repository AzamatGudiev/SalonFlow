
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
  const [rawAuthLoaded, setRawAuthLoaded] = useState(false); // To track if Firebase Auth itself has initialized
  const router = useRouter();

  useEffect(() => {
    if (!firebaseAuthInstance) {
      if (typeof window !== 'undefined') {
          console.error("useAuth: Firebase auth instance from '@/lib/firebase' is not available. Check Firebase initialization and environment variables.");
      }
      setRawAuthLoaded(true); // Mark as loaded even if instance is not there, to stop loading UI
      setIsLoading(false);
      return;
    } else {
      if (typeof window !== 'undefined' && !rawAuthLoaded) {
        // console.log("useAuth: Firebase auth instance is available. Setting up onAuthStateChanged listener.");
      }
    }

    const unsubscribe = onAuthStateChanged(firebaseAuthInstance, async (firebaseUser: FirebaseUser | null) => {
      if (typeof window !== 'undefined' && !rawAuthLoaded) {
        // console.log("useAuth: onAuthStateChanged listener fired.");
        setRawAuthLoaded(true);
      }

      if (firebaseUser) {
        // console.log("useAuth: Firebase user authenticated (firebaseUser available). UID:", firebaseUser.uid);
        // Attempt to fetch user profile from Firestore
        const profileResult = await getUserProfile(firebaseUser.uid);
        // console.log("useAuth: profileResult from getUserProfile:", JSON.stringify(profileResult));
        
        if (profileResult.success && profileResult.profile) {
          // console.log("useAuth: Profile fetched successfully. Setting authUser.");
          setAuthUser({ 
            ...profileResult.profile, 
            firebaseUid: firebaseUser.uid 
          });
        } else {
          console.warn(`useAuth: User profile not found or failed to fetch for UID: ${firebaseUser.uid}. Error: ${profileResult.error}. User remains authenticated with Firebase Auth, but local app profile is missing or inaccessible.`);
          setAuthUser(null); // Keep user authenticated with Firebase Auth, but app profile is not available.
        }
      } else {
        // console.log("useAuth: No Firebase user (logged out or not yet logged in). Setting authUser to null.");
        setAuthUser(null);
      }
      // console.log("useAuth: Setting isLoading to false.");
      setIsLoading(false);
    });

    return () => {
      // console.log("useAuth: Unsubscribing from onAuthStateChanged.");
      unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Added rawAuthLoaded to dependency array if it were used, but firebaseAuthInstance is stable

  const logout = useCallback(async () => {
    // console.log("useAuth: logout called.");
    setIsLoading(true);
    if (firebaseAuthInstance) {
      try {
        await firebaseSignOut(firebaseAuthInstance);
        // onAuthStateChanged will set authUser to null and isLoading to false
        // console.log("useAuth: Firebase sign out successful. Router will push to /auth/login.");
        router.push('/auth/login'); 
      } catch (error) {
        console.error("useAuth: Error signing out from Firebase: ", error);
        setAuthUser(null); // Ensure local state is cleared
        setIsLoading(false);
        router.push('/auth/login'); // Attempt redirect even on error
      }
    } else {
        console.warn("useAuth: logout called but firebaseAuthInstance is not available.");
        setAuthUser(null);
        setIsLoading(false);
        router.push('/auth/login');
    }
  }, [router]);

  return { 
    user: authUser,
    role: authUser?.role || null, 
    isLoggedIn: !!authUser, 
    isLoading: isLoading || !rawAuthLoaded, //isLoading is true until rawAuthLoaded and onAuthStateChanged has fired at least once
    logout,
    rawAuthLoaded // Expose this if needed by other parts of the app
  };
}
