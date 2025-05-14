
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
  const [rawAuthLoaded, setRawAuthLoaded] = useState(false); // To track if onAuthStateChanged has fired at least once
  const router = useRouter();

  useEffect(() => {
    if (!firebaseAuthInstance) {
      if (typeof window !== 'undefined') { // Only log on client
          console.error("useAuth: Firebase auth instance from '@/lib/firebase' is not available. Check Firebase initialization and environment variables.");
      }
      setRawAuthLoaded(true); // Mark as loaded to prevent infinite loading state
      setIsLoading(false);
      return;
    } else {
      if (typeof window !== 'undefined' && !rawAuthLoaded) {
        console.log("useAuth: Firebase auth instance is available. Setting up onAuthStateChanged listener.");
      }
    }

    const unsubscribe = onAuthStateChanged(firebaseAuthInstance, async (firebaseUser: FirebaseUser | null) => {
      if (typeof window !== 'undefined' && !rawAuthLoaded) {
        console.log("useAuth: onAuthStateChanged listener fired for the first time.");
        setRawAuthLoaded(true);
      }

      if (firebaseUser) {
        console.log("useAuth: Firebase user authenticated (firebaseUser available). UID:", firebaseUser.uid);
        const profileResult = await getUserProfile(firebaseUser.uid);
        console.log("useAuth: getUserProfile result:", JSON.stringify(profileResult));
        
        if (profileResult.success && profileResult.profile) {
          console.log("useAuth: Profile fetched successfully. Setting authUser.");
          setAuthUser({ 
            ...profileResult.profile, 
            firebaseUid: firebaseUser.uid 
          });
        } else {
          console.warn(
            `useAuth: User profile not found or failed to fetch for UID: ${firebaseUser.uid}. Error: ${profileResult.error}. ` +
            "The user is authenticated with Firebase Auth, but their Firestore profile is missing or inaccessible. " +
            "This might be a temporary state during signup, or a data issue for existing users."
          );
          // Do NOT sign out here anymore. Let the app reflect that Auth is done, but profile might be missing.
          setAuthUser(null); 
        }
      } else {
        console.log("useAuth: No Firebase user (logged out or not yet logged in). Setting authUser to null.");
        setAuthUser(null);
      }
      console.log("useAuth: Setting isLoading to false.");
      setIsLoading(false);
    });

    return () => {
      console.log("useAuth: Unsubscribing from onAuthStateChanged.");
      unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Ensure rawAuthLoaded is not in deps to keep its "first fire" meaning

  const logout = useCallback(async () => {
    console.log("useAuth: logout called.");
    setIsLoading(true);
    if (firebaseAuthInstance) {
      try {
        await firebaseSignOut(firebaseAuthInstance);
        // onAuthStateChanged will set authUser to null and isLoading to false
        console.log("useAuth: Firebase sign out successful. Router will push to /auth/login.");
        // No need to setAuthUser(null) here, onAuthStateChanged will handle it
        // No need to setIsLoading(false) here, onAuthStateChanged will handle it
        router.push('/auth/login'); 
      } catch (error) {
        console.error("useAuth: Error signing out from Firebase: ", error);
        setAuthUser(null); 
        setIsLoading(false);
        router.push('/auth/login'); 
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
    // Ensure isLoading is true until onAuthStateChanged has fired at least once
    // and then also until the profile fetch attempt is complete.
    isLoading: isLoading || !rawAuthLoaded, 
    logout,
    rawAuthLoaded // Expose this if needed by other parts of the app for specific checks
  };
}
