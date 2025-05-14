
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { OwnerDashboard } from '@/components/dashboard/owner-dashboard';
import { CustomerDashboard } from '@/components/dashboard/customer-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  const { role, isLoggedIn, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/auth/login');
    }
  }, [isLoading, isLoggedIn, router]);

  if (isLoading || (!isLoggedIn && typeof window !== 'undefined')) { // Added window check for SSR safety
    return (
      <div className="container mx-auto py-12 px-4 animate-pulse">
        <Skeleton className="h-10 w-1/2 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
        </div>
        <Skeleton className="h-10 w-1/3 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (!isLoggedIn && !isLoading) {
     // This case should ideally be caught by the useEffect redirect,
     // but as a fallback, offer a link to login.
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-semibold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You need to be logged in to view the dashboard.</p>
        <Button asChild>
          <Link href="/auth/login">Go to Login</Link>
        </Button>
      </div>
    );
  }


  if (role === 'owner' || role === 'staff') {
    return <OwnerDashboard />;
  }

  if (role === 'customer') {
    return <CustomerDashboard />;
  }
  
  // Fallback if role is somehow null despite being logged in, or if component renders before redirect effect.
  // This might happen briefly or if localStorage gets into an unexpected state.
  return (
    <div className="container mx-auto py-12 px-4 text-center">
        <p className="text-muted-foreground">Loading user dashboard or role not recognized...</p>
    </div>
  );
}
