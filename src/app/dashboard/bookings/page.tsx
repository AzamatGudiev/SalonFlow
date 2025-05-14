
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusCircle, CalendarDays, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  TableCaption
} from "@/components/ui/table";

interface Booking {
  id: string;
  customerName: string;
  service: string;
  date: string;
  time: string;
  staff?: string; // Optional staff member
  notes?: string; // Optional notes
}

const initialBookingsData: Booking[] = [
  { id: "1", customerName: "John Doe", service: "Classic Haircut", date: "2024-08-15", time: "10:00 AM", staff: "Alice Wonderland", notes: "Prefers minimal chat." },
  { id: "2", customerName: "Jane Smith", service: "Manicure", date: "2024-08-16", time: "02:30 PM", staff: "Carol Danvers" },
  { id: "3", customerName: "Mike Johnson", service: "Deep Tissue Massage", date: "2024-08-18", time: "11:00 AM", notes: "Focus on shoulder area." },
];


export default function BookingsPage() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [currentBookingToEdit, setCurrentBookingToEdit] = useState<Booking | null>(null);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [service, setService] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [staff, setStaff] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setBookings(initialBookingsData);
  }, []);

  const resetForm = () => {
    setCustomerName(''); setService(''); setDate(''); setTime(''); setStaff(''); setNotes('');
    setCurrentBookingToEdit(null);
  };

  const handleOpenAddDialog = () => {
    resetForm();
    setIsAddEditDialogOpen(true);
  };

  const handleOpenEditDialog = (booking: Booking) => {
    setCurrentBookingToEdit(booking);
    setCustomerName(booking.customerName);
    setService(booking.service);
    setDate(booking.date);
    setTime(booking.time);
    setStaff(booking.staff || '');
    setNotes(booking.notes || '');
    setIsAddEditDialogOpen(true);
  };

  const handleSaveBooking = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!customerName || !service || !date || !time) {
      toast({ title: "Error", description: "Customer Name, Service, Date, and Time are required.", variant: "destructive" });
      return;
    }

    const bookingData = { customerName, service, date, time, staff: staff || undefined, notes: notes || undefined };

    if (currentBookingToEdit) {
      setBookings(bookings.map(b => b.id === currentBookingToEdit.id ? { ...currentBookingToEdit, ...bookingData } : b));
      toast({ title: "Booking Updated", description: `Booking for ${customerName} updated.` });
    } else {
      const newBooking: Booking = { id: String(Date.now()), ...bookingData };
      setBookings(prev => [newBooking, ...prev]); // Add to the top of the list
      toast({ title: "Booking Added", description: `New booking for ${customerName} created.` });
    }
    setIsAddEditDialogOpen(false);
    resetForm();
  };

  const handleOpenDeleteDialog = (booking: Booking) => {
    setBookingToDelete(booking);
  };

  const confirmDeleteBooking = () => {
    if (bookingToDelete) {
      setBookings(bookings.filter(b => b.id !== bookingToDelete.id));
      toast({ title: "Booking Deleted", description: `Booking for ${bookingToDelete.customerName} deleted.`, variant: "destructive" });
      setBookingToDelete(null);
    }
  };

  const handleCloseDialog = () => {
    setIsAddEditDialogOpen(false);
    resetForm();
  }


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

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary"/>Upcoming Bookings</CardTitle>
            <CardDescription>A list of scheduled appointments.</CardDescription>
          </div>
          <Button onClick={handleOpenAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Booking
          </Button>
        </CardHeader>
        <CardContent>
          {bookings.length > 0 ? (
            <Table>
              <TableCaption>A list of your salon bookings.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
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
                    <TableCell className="font-medium">{booking.customerName}</TableCell>
                    <TableCell>{booking.service}</TableCell>
                    <TableCell>{booking.date}</TableCell>
                    <TableCell>{booking.time}</TableCell>
                    <TableCell>{booking.staff || 'Any'}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" aria-label="Edit Booking" onClick={() => handleOpenEditDialog(booking)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="Delete Booking" className="text-destructive hover:text-destructive" onClick={() => handleOpenDeleteDialog(booking)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="min-h-[200px] flex flex-col items-center justify-center bg-muted/30 rounded-md p-4 text-center">
              <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold text-muted-foreground">No bookings yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Click &quot;Add New Booking&quot; to schedule an appointment.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

       {/* Add/Edit Booking Dialog */}
      <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveBooking}>
            <DialogHeader>
              <DialogTitle>{currentBookingToEdit ? 'Edit Booking' : 'Add New Booking'}</DialogTitle>
              <DialogDescription>
                {currentBookingToEdit ? 'Update the details of this booking.' : 'Fill in the details for the new booking.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g., John Doe" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="service">Service</Label>
                <Input id="service" value={service} onChange={(e) => setService(e.target.value)} placeholder="e.g., Haircut, Manicure" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="staff">Staff Member (Optional)</Label>
                <Input id="staff" value={staff} onChange={(e) => setStaff(e.target.value)} placeholder="e.g., Alice" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any specific requests or preferences..." />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              </DialogClose>
              <Button type="submit">Save Booking</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!bookingToDelete} onOpenChange={(open) => !open && setBookingToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the booking for &quot;{bookingToDelete?.customerName} - {bookingToDelete?.service}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBookingToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteBooking} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

    