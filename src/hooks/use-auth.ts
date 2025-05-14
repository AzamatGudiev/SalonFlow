
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase'; // Assuming auth is exported from firebase.ts
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { getUserProfile, type UserProfile } from '@/app/actions/userActions'; // We'll create this action

export type { UserRole, UserProfile } from '@/lib/schemas'; // Re-export for convenience

// Combined type for our hook's user object
export interface AuthenticatedUser extends UserProfile {
  // FirebaseUser properties can be added if needed, e.g., emailVerified: boolean
  firebaseUid: string; // To clearly distinguish from profile.uid if needed
}

export function useAuth() {
  const [authUser, setAuthUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
      console.error("Firebase auth is not initialized. User authentication will not work.");
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in, now fetch their profile from Firestore
        const profileResult = await getUserProfile(firebaseUser.uid);
        if (profileResult.success && profileResult.profile) {
          setAuthUser({ 
            ...profileResult.profile, 
            firebaseUid: firebaseUser.uid 
          });
        } else {
          // Profile not found or error fetching; sign out to clear state or handle appropriately
          console.warn("User profile not found for UID:", firebaseUser.uid, "Error:", profileResult.error);
          // Potentially, this user exists in Firebase Auth but not in our 'users' collection (e.g. if creation failed)
          // For now, treat as not fully logged in for our app's purposes
          await firebaseSignOut(auth); // Sign them out of Firebase Auth as well
          setAuthUser(null);
        }
      } else {
        // User is signed out
        setAuthUser(null);
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    if (auth) {
      try {
        await firebaseSignOut(auth);
        // onAuthStateChanged will handle setting authUser to null
        router.push('/auth/login');
      } catch (error) {
        console.error("Error signing out: ", error);
        // Handle error (e.g., show toast)
      } finally {
        // setIsLoading(false); // onAuthStateChanged will set loading to false
      }
    } else {
       // Fallback for local storage if auth isn't available somehow (should not happen in normal flow)
        localStorage.removeItem('userData'); // Clear any old simulated user data
        setAuthUser(null);
        setIsLoading(false);
        router.push('/auth/login');
    }
  }, [router]);

  return { 
    user: authUser, // This is now the AuthenticatedUser (profile + firebaseUid)
    role: authUser?.role || null, 
    isLoggedIn: !!authUser, 
    isLoading, 
    logout 
    // login function is removed as Firebase handles login flow, and onAuthStateChanged updates state
  };
}
