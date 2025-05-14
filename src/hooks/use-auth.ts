
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole = 'customer' | 'owner' | 'staff' | null;

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

export function useAuth() {
  const [user, setUser] = useState<UserData | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // This effect runs only on the client after hydration
    try {
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        const parsedUser = JSON.parse(storedUserData) as UserData;
        setUser(parsedUser);
        setRole(parsedUser.role);
      }
    } catch (error) {
      console.error("Failed to parse user data from localStorage", error);
      localStorage.removeItem('userData'); // Clear corrupted data
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((userData: UserData) => {
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
    setRole(userData.role);
    router.push('/dashboard');
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem('userData');
    setUser(null);
    setRole(null);
    router.push('/auth/login');
  }, [router]);

  return { user, role, isLoggedIn: !!user, isLoading, login, logout };
}
