
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { ArrowLeft, CalendarDays, Trash2, Info, Loader2, SearchX } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getBookings, deleteBooking } from "@/app/actions/bookingActions";
import type { Booking } from "@/lib/schemas";
import { useToast } from "@/hooks/use-toast";
import { format, isFuture, parseISO } from 'date-fns';

export default function MyBookingsPage() {
  const { isLoggedIn, isLoading: authIsLoading, role, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!authIsLoading && (!isLoggedIn || role !== 'customer')) {
      router.push(isLoggedIn ? '/dashboard' : '/auth/login');
    }
  }, [authIsLoading, isLoggedIn, role, router]);

  useEffect(() => {
    async function fetchMyBookings() {
      if (user?.email && role === 'customer') {
        setIsLoadingBookings(true);
        try {
          const result = await getBookings({ customerEmail: user.email });
          if(Array.isArray(result)) { // Check if result is an array (success case)
            setBookings(result);
          } else if (result && 'error' in result) { // Check if it's an error object
             toast({ title: "Error", description: result.error || "Could not fetch your bookings.", variant: "destructive" });
             setBookings([]); // Set to empty array on error
          } else {
            // Handle unexpected result format
            toast({ title: "Error", description: "An unexpected error occurred while fetching bookings.", variant: "destructive" });
            setBookings([]);
          }
        } catch (error: any) {
          console.error("Error fetching customer bookings:", error);
          toast({ title: "Error", description: error.message || "Could not fetch your bookings.", variant: "destructive" });
          setBookings([]);
        } finally {
          setIsLoadingBookings(false);
        }
      } else if (!user?.email && !authIsLoading && role === 'customer') {
        toast({ title: "Error", description: "User email not found, cannot fetch bookings.", variant: "destructive" });
        setIsLoadingBookings(false);
        setBookings([]);
      }
    }
    
    if (!authIsLoading && isLoggedIn && role === 'customer') {
      fetchMyBookings();
    } else if (!authIsLoading && !isLoggedIn) {
        setIsLoadingBookings(false); 
        setBookings([]);
    }
  }, [user, authIsLoading, isLoggedIn, role, toast]);
  
  const handleOpenCancelDialog = (booking: Booking) => {
    setBookingToCancel(booking);
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;
    setIsCancelling(true);
    const result = await deleteBooking(bookingToCancel.id);
    if (result.success) {
      setBookings(prev => prev.filter(b => b.id !== bookingToCancel.id));
      toast({ title: "Booking Cancelled", description: "Your appointment has been cancelled." });
    } else {
      toast({ title: "Cancellation Failed", description: result.error || "Could not cancel booking.", variant: "destructive" });
    }
    setBookingToCancel(null);
    setIsCancelling(false);
  };

  const isBookingInFuture = (bookingDate: string, bookingTime: string): boolean => {
    try {
      // Assuming bookingDate is 'YYYY-MM-DD' and bookingTime is 'HH:MM' (24-hour)
      const dateTimeString = `${bookingDate}T${bookingTime}:00`; // Add seconds for robust parsing
      const bookingDateTime = parseISO(dateTimeString);
      return isFuture(bookingDateTime);
    } catch (e) {
        console.error("Error parsing date/time for future check:", e, "Date:", bookingDate, "Time:", bookingTime);
        // If parsing fails, conservatively assume it's not in the future or not cancellable by default
        return false; 
    }
  };


  if (authIsLoading || isLoadingBookings) {
    return (
      <div className="container mx-auto py-12 px-4 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!isLoggedIn || role !== 'customer') {
    return <div className="container mx-auto py-12 px-4">Redirecting...</div>;
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

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" />Your Appointments</CardTitle>
          <CardDescription>A list of your scheduled and past bookings.</CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length > 0 ? (
             <Table>
              <TableCaption>Your booking history.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Salon</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.salonName}</TableCell>
                    <TableCell>{booking.service}</TableCell>
                    <TableCell>{format(parseISO(booking.date), 'PPP')}</TableCell>
                    <TableCell>{booking.time}</TableCell>
                    <TableCell>{booking.staff || 'Any Available'}</TableCell>
                    <TableCell className="text-right">
                      {isBookingInFuture(booking.date, booking.time) && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleOpenCancelDialog(booking)}
                          disabled={isCancelling}
                        >
                          <Trash2 className="mr-1 h-4 w-4" /> Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="min-h-[200px] flex flex-col items-center justify-center bg-muted/30 rounded-md p-6 text-center">
              <SearchX className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold text-foreground">No bookings found.</p>
              <p className="text-sm text-muted-foreground mt-2 mb-6">
                When you book an appointment, it will appear here.
              </p>
              <Button asChild>
                <Link href="/salons">Find a Salon to Book</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

       <AlertDialog open={!!bookingToCancel} onOpenChange={(isOpen) => !isOpen && setBookingToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Your appointment for 
              "{bookingToCancel?.service}" at "{bookingToCancel?.salonName}" on 
              {bookingToCancel && format(parseISO(bookingToCancel.date), 'PPP')} at {bookingToCancel?.time} 
              will be cancelled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBookingToCancel(null)} disabled={isCancelling}>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmCancel} 
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={isCancelling}
            >
              {isCancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isCancelling ? 'Cancelling...' : 'Yes, Cancel Booking'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

