
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusCircle, CalendarDays, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, type FormEvent, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookingSchema, type Booking, type StaffMember, type Service } from '@/lib/schemas';
import { getBookings, addBooking, updateBooking, deleteBooking } from '@/app/actions/bookingActions';
import { getStaffMembers } from '@/app/actions/staffActions';
import { getServices } from '@/app/actions/serviceActions';

export default function BookingsPage() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allStaff, setAllStaff] = useState<StaffMember[]>([]);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [currentBookingToEdit, setCurrentBookingToEdit] = useState<Booking | null>(null);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [selectedServiceName, setSelectedServiceName] = useState(''); // Stores name of selected service
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState(''); // Stores ID of selected staff
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function fetchInitialData() {
      setIsLoading(true);
      try {
        const [fetchedBookings, fetchedStaff, fetchedServices] = await Promise.all([
          getBookings(),
          getStaffMembers(),
          getServices()
        ]);
        setBookings(fetchedBookings);
        setAllStaff(fetchedStaff.map(s => ({ ...s, providedServices: s.providedServices || [] })));
        setAvailableServices(fetchedServices);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast({ title: "Error fetching data", description: "Could not load bookings, staff, or services.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchInitialData();
  }, [toast]);

  const filteredStaffForSelectedService = useMemo(() => {
    if (!selectedServiceName) return allStaff; // Show all if no service selected
    return allStaff.filter(staff => 
      staff.providedServices?.includes(selectedServiceName)
    );
  }, [selectedServiceName, allStaff]);

  const resetForm = () => {
    setCustomerName(''); setSelectedServiceName(''); setDate(''); setTime(''); setSelectedStaffId(''); setNotes('');
    setCurrentBookingToEdit(null);
  };

  const handleOpenAddDialog = () => {
    resetForm();
    setIsAddEditDialogOpen(true);
  };

  const handleOpenEditDialog = (booking: Booking) => {
    setCurrentBookingToEdit(booking);
    setCustomerName(booking.customerName);
    setSelectedServiceName(booking.service); // Service name
    setDate(booking.date); 
    setTime(booking.time);
    const staffMember = allStaff.find(s => s.name === booking.staff); // Match by name
    setSelectedStaffId(staffMember ? staffMember.id : '');
    setNotes(booking.notes || '');
    setIsAddEditDialogOpen(true);
  };

  const handleSaveBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    const staffMember = allStaff.find(s => s.id === selectedStaffId); // Find by ID
    const staffNameToSave = staffMember ? staffMember.name : undefined; // Save name

    const bookingDataInput = { 
        customerName, 
        service: selectedServiceName, // Save service name
        date, 
        time, 
        staff: staffNameToSave,
        notes: notes || undefined
    };

    const clientValidation = currentBookingToEdit
      ? BookingSchema.safeParse({ ...bookingDataInput, id: currentBookingToEdit.id })
      : BookingSchema.omit({id: true}).safeParse(bookingDataInput);

    if (!clientValidation.success) {
      const errors = clientValidation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(", ");
      toast({ title: "Validation Error", description: errors, variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    if (currentBookingToEdit) {
      const result = await updateBooking({ ...clientValidation.data, id: currentBookingToEdit.id });
      if (result.success && result.booking) {
        setBookings(prev => prev.map(b => b.id === result.booking!.id ? result.booking! : b));
        toast({ title: "Booking Updated", description: `Booking for ${result.booking.customerName} updated.` });
      } else {
        toast({ title: "Update Failed", description: result.error || "Could not update booking.", variant: "destructive" });
      }
    } else {
      const result = await addBooking(clientValidation.data);
      if (result.success && result.booking) {
        setBookings(prev => [result.booking!, ...prev]); 
        toast({ title: "Booking Added", description: `New booking for ${result.booking.customerName} created.` });
      } else {
        toast({ title: "Add Failed", description: result.error || "Could not add booking.", variant: "destructive" });
      }
    }
    setIsSubmitting(false);
    setIsAddEditDialogOpen(false);
    resetForm();
  };

  const handleOpenDeleteDialog = (booking: Booking) => {
    setBookingToDelete(booking);
  };

  const confirmDeleteBooking = async () => {
    if (bookingToDelete) {
      setIsSubmitting(true);
      const result = await deleteBooking(bookingToDelete.id);
      setIsSubmitting(false);
      if (result.success) {
        setBookings(bookings.filter(b => b.id !== bookingToDelete.id));
        toast({ title: "Booking Deleted", description: `Booking for ${bookingToDelete.customerName} deleted.`, variant: "default" });
      } else {
        toast({ title: "Delete Failed", description: result.error || "Could not delete booking.", variant: "destructive" });
      }
      setBookingToDelete(null);
    }
  };

  const handleCloseDialog = () => {
    if (isSubmitting) return;
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
          <Button onClick={handleOpenAddDialog} disabled={isLoading || isSubmitting}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Booking
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading bookings...</p>
          ) : bookings.length > 0 ? (
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
                    <TableCell>{new Date(booking.date + 'T00:00:00').toLocaleDateString()}</TableCell>
                    <TableCell>{booking.time}</TableCell>
                    <TableCell>{booking.staff || 'Any'}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" aria-label="Edit Booking" onClick={() => handleOpenEditDialog(booking)} disabled={isSubmitting}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="Delete Booking" className="text-destructive hover:text-destructive" onClick={() => handleOpenDeleteDialog(booking)} disabled={isSubmitting}>
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

      <Dialog open={isAddEditDialogOpen} onOpenChange={(isOpen) => {
        if (isSubmitting) return;
        setIsAddEditDialogOpen(isOpen);
        if (!isOpen) resetForm();
      }}>
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
                <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g., John Doe" aria-label="Customer Name" required/>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="service-select">Service</Label>
                <Select value={selectedServiceName} onValueChange={(value) => { setSelectedServiceName(value); setSelectedStaffId(''); /* Reset staff on service change */ }}>
                  <SelectTrigger id="service-select" aria-label="Service" disabled={availableServices.length === 0}>
                    <SelectValue placeholder={availableServices.length > 0 ? "Select a service" : "No services available"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableServices.map((service) => (
                      <SelectItem key={service.id} value={service.name}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                 {availableServices.length === 0 && <p className="text-xs text-muted-foreground">Please add services in the 'Manage Services' section first.</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Date" required/>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} aria-label="Time" required/>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="staff-select">Staff Member (Optional)</Label>
                <Select value={selectedStaffId} onValueChange={setSelectedStaffId} disabled={!selectedServiceName || filteredStaffForSelectedService.length === 0}>
                  <SelectTrigger id="staff-select" aria-label="Staff Member">
                    <SelectValue placeholder={!selectedServiceName ? "Select a service first" : (filteredStaffForSelectedService.length > 0 ? "Select available staff" : "No staff for this service")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Available</SelectItem>
                    {filteredStaffForSelectedService.map((staffMember) => (
                      <SelectItem key={staffMember.id} value={staffMember.id}>
                        {staffMember.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!selectedServiceName && <p className="text-xs text-muted-foreground">Please select a service to see available staff.</p>}
                {selectedServiceName && filteredStaffForSelectedService.length === 0 && <p className="text-xs text-muted-foreground">No staff members are configured to provide the selected service.</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any specific requests or preferences..." aria-label="Notes" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting || !selectedServiceName || availableServices.length === 0}>
                {isSubmitting ? (currentBookingToEdit ? 'Saving...' : 'Adding...') : 'Save Booking'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!bookingToDelete} onOpenChange={(open) => { if (isSubmitting) return; !open && setBookingToDelete(null)}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the booking for &quot;{bookingToDelete?.customerName} - {bookingToDelete?.service}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBookingToDelete(null)} disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteBooking} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground" disabled={isSubmitting}>
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
