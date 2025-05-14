
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
      console.error("useAuth: Firebase auth instance from '@/lib/firebase' is not available. Firebase might not have initialized correctly due to missing/incorrect environment variables on your hosting platform.");
      setIsLoading(false);
      return;
    } else {
      if (typeof window !== 'undefined') { // Only log on client
        console.log("useAuth: Firebase auth instance is available. Setting up onAuthStateChanged listener.");
      }
    }

    const unsubscribe = onAuthStateChanged(firebaseAuthInstance, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const profileResult = await getUserProfile(firebaseUser.uid);
        if (profileResult.success && profileResult.profile) {
          setAuthUser({ 
            ...profileResult.profile, 
            firebaseUid: firebaseUser.uid 
          });
        } else {
          console.warn("useAuth: User profile not found for UID:", firebaseUser.uid, "Error:", profileResult.error);
          // User exists in Firebase Auth but not in 'users' collection or error fetching.
          // Signing out to ensure consistent state.
          await firebaseSignOut(firebaseAuthInstance);
          setAuthUser(null);
        }
      } else {
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
        router.push('/auth/login');
      } catch (error) {
        console.error("Error signing out: ", error);
      }
      // onAuthStateChanged will set isLoading to false eventually
    } else {
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
    // Expose the raw auth instance for direct checks if needed elsewhere, though typically not used by components.
    rawAuthLoaded: !!firebaseAuthInstance 
  };
}
