
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, CalendarCheck2, UserCircle, LogOut } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export function CustomerDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="container mx-auto py-12 px-4">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Welcome, {user?.firstName || 'Customer'}!</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Manage your appointments and explore salons.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-foreground mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-primary"><Search className="h-6 w-6" /> Find a Salon</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Discover and book services at top salons.</p>
              <Button asChild className="w-full"><Link href="/salons">Explore Salons</Link></Button>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-primary"><CalendarCheck2 className="h-6 w-6" /> My Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">View your upcoming and past appointments.</p>
              <Button asChild className="w-full"><Link href="/dashboard/my-bookings">View My Bookings</Link></Button>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-primary"><UserCircle className="h-6 w-6" /> My Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Update your personal information.</p>
              <Button asChild className="w-full"><Link href="/dashboard/profile">Edit Profile</Link></Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="mt-12 text-center">
        <Button variant="outline" size="lg" onClick={logout} className="inline-flex items-center gap-2">
          <LogOut className="h-5 w-5" /> Logout
        </Button>
      </div>
    </div>
  );
}
