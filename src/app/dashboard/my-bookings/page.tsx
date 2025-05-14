
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarDays } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MyBookingsPage() {
  const { isLoggedIn, isLoading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isLoggedIn || role !== 'customer')) {
      router.push(isLoggedIn ? '/dashboard' : '/auth/login');
    }
  }, [isLoading, isLoggedIn, role, router]);

  if (isLoading || !isLoggedIn || role !== 'customer') {
    return <div className="container mx-auto py-12 px-4">Loading or redirecting...</div>;
  }
  
  return (
    <div className="container mx-auto py-12 px-4">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary">My Bookings</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            View your upcoming and past appointments.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" />Your Appointments</CardTitle>
          <CardDescription>A list of your scheduled and past bookings.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px] flex flex-col items-center justify-center bg-muted/30 rounded-md">
          {/* Placeholder for actual booking data */}
          <CalendarDays className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl font-semibold text-muted-foreground">No bookings yet.</p>
          <p className="text-sm text-muted-foreground mt-2 mb-6">
            When you book an appointment, it will appear here.
          </p>
          <Button asChild>
            <Link href="/salons">Find a Salon to Book</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
