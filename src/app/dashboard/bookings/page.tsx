
'use client'; // Required for useToast

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast"; // Import useToast

export default function BookingsPage() {
  const { toast } = useToast(); // Initialize useToast

  const handleAddNewBooking = () => {
    toast({
      title: "Feature In Progress",
      description: "Adding a new booking functionality is not yet implemented in this prototype.",
    });
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary">Manage Bookings</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            View, modify, and manage all your salon bookings.
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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Upcoming Bookings</CardTitle>
            <CardDescription>A list of scheduled appointments.</CardDescription>
          </div>
          <Button onClick={handleAddNewBooking}> {/* Add onClick handler */}
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Booking
          </Button>
        </CardHeader>
        <CardContent className="min-h-[300px] flex flex-col items-center justify-center bg-muted/30 rounded-md">
          {/* Placeholder for bookings list or calendar */}
          <p className="text-muted-foreground">Booking management interface will be here.</p>
          <p className="text-sm text-muted-foreground mt-2">
            This section will display a table or calendar view of bookings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
