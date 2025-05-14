
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusCircle, CalendarDays, Edit2, Trash2, Loader2, Inbox } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, type FormEvent, useMemo, useCallback } from "react";
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
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";

const OWNER_SALON_ID_KEY_PREFIX = 'owner_salon_id_';

export default function BookingsPage() {
  const { toast } = useToast();
  const { user, role, isLoading: authIsLoading, isLoggedIn } = useAuth();
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allStaff, setAllStaff] = useState<StaffMember[]>([]);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [ownerSalonId, setOwnerSalonId] = useState<string | null>(null);
  
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [currentBookingToEdit, setCurrentBookingToEdit] = useState<Booking | null>(null);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [notes, setNotes] = useState('');

  const getOwnerSalonIdKey = useCallback(() => user ? `${OWNER_SALON_ID_KEY_PREFIX}${user.firebaseUid}` : null, [user]);

  useEffect(() => {
    if (!authIsLoading && !isLoggedIn) {
      router.push('/auth/login');
      return;
    }
    if (!authIsLoading && isLoggedIn && role !== 'owner' && role !== 'staff') {
       router.push('/dashboard'); 
      return;
    }
  }, [authIsLoading, isLoggedIn, role, router]);
  
  useEffect(() => {
    async function fetchInitialData() {
      if (!user || (role !== 'owner' && role !== 'staff')) {
        setIsLoadingData(false);
        return;
      }
      setIsLoadingData(true);
      let currentOwnerSalonId: string | null = null;
      if (role === 'owner' && user) {
        const key = getOwnerSalonIdKey();
        currentOwnerSalonId = key ? localStorage.getItem(key) : null;
        if (!currentOwnerSalonId) {
            toast({ title: "Salon Not Configured", description: "Please set up your salon in 'My Salon' to manage bookings.", variant: "default" });
        }
        setOwnerSalonId(currentOwnerSalonId);
      }
      

      try {
        const [fetchedBookings, fetchedStaff, fetchedServices] = await Promise.all([
          getBookings({ salonId: currentOwnerSalonId || undefined }), 
          getStaffMembers({ salonId: currentOwnerSalonId || undefined }), 
          getServices() 
        ]);
        setBookings(fetchedBookings);
        setAllStaff(fetchedStaff.map(s => ({ ...s, providedServices: s.providedServices || [] })));
        setAvailableServices(fetchedServices);
      } catch (error: any) {
        console.error("Error fetching initial data:", error);
        toast({ title: "Error fetching data", description: error.message || "Could not load bookings, staff, or services.", variant: "destructive" });
      } finally {
        setIsLoadingData(false);
      }
    }
     if (user && (role === 'owner' || role === 'staff')) {
      fetchInitialData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, role, toast]);

  const filteredStaffForSelectedService = useMemo(() => {
    if (!selectedServiceId) return allStaff;
    const service = availableServices.find(s => s.id === selectedServiceId);
    if (!service) return allStaff;
    return allStaff.filter(staff => 
      staff.providedServices?.includes(service.name)
    );
  }, [selectedServiceId, allStaff, availableServices]);

  const resetForm = () => {
    setCustomerName(''); setCustomerEmail(''); setSelectedServiceId(''); setDate(''); setTime(''); setSelectedStaffId(''); setNotes('');
    setCurrentBookingToEdit(null);
  };

  const handleOpenAddDialog = () => { 
    if (!ownerSalonId && role === 'owner') {
      toast({ title: "Salon ID Missing", description: "Your salon is not configured. Please set it up in 'My Salon'.", variant: "destructive" });
      return;
    }
    if (availableServices.length === 0) {
        toast({ title: "No Services Available", description: "Please add services in 'Manage Services' before creating bookings.", variant: "default" });
        return;
    }
    resetForm(); setIsAddEditDialogOpen(true); 
  };

  const handleOpenEditDialog = (booking: Booking) => {
    setCurrentBookingToEdit(booking);
    setCustomerName(booking.customerName);
    setCustomerEmail(booking.customerEmail);
    const service = availableServices.find(s => s.name === booking.service);
    setSelectedServiceId(service ? service.id : '');
    setDate(booking.date); setTime(booking.time);
    const staffMember = allStaff.find(s => s.name === booking.staff);
    setSelectedStaffId(staffMember ? staffMember.id : '');
    setNotes(booking.notes || '');
    setIsAddEditDialogOpen(true);
  };

  const handleSaveBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!ownerSalonId && role === 'owner') {
      toast({ title: "Salon ID Missing", description: "Cannot save booking without a salon context.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    
    const staffMember = allStaff.find(s => s.id === selectedStaffId);
    const serviceDetails = availableServices.find(s => s.id === selectedServiceId);
    const salonName = user?.firstName ? `${user.firstName}'s Salon` : 'Your Salon'; // Placeholder, ideally fetch from salon details

    const bookingDataInput = { 
        salonId: ownerSalonId!, 
        salonName: salonName, // This should be dynamically fetched or from user's salon details
        customerName, 
        customerEmail,
        service: serviceDetails?.name || 'Unknown Service', 
        date, 
        time, 
        staff: staffMember?.name || (selectedStaffId === '' || selectedStaffId === 'any' ? undefined : 'Any Available'), 
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

    let result;
    if (currentBookingToEdit) {
      result = await updateBooking({ ...clientValidation.data, id: currentBookingToEdit.id });
    } else {
      result = await addBooking(clientValidation.data);
    }

    if (result.success && result.booking) {
      toast({ title: currentBookingToEdit ? "Booking Updated" : "Booking Added", description: `Booking for ${result.booking.customerName} saved.` });
      if (currentBookingToEdit) {
        setBookings(prev => prev.map(b => b.id === result.booking!.id ? result.booking! : b));
      } else {
        setBookings(prev => [result.booking!, ...prev.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.time.localeCompare(a.time))]); 
      }
      setIsAddEditDialogOpen(false);
      resetForm();
    } else {
      toast({ title: currentBookingToEdit ? "Update Failed" : "Add Failed", description: result.error || "Could not save booking.", variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const handleOpenDeleteDialog = (booking: Booking) => { setBookingToDelete(booking); };

  const confirmDeleteBooking = async () => {
    if (bookingToDelete) {
      setIsSubmitting(true);
      const result = await deleteBooking(bookingToDelete.id);
      if (result.success) {
        setBookings(bookings.filter(b => b.id !== bookingToDelete.id));
        toast({ title: "Booking Deleted", description: `Booking for ${bookingToDelete.customerName} deleted.`, variant: "default" });
      } else {
        toast({ title: "Delete Failed", description: result.error || "Could not delete booking.", variant: "destructive" });
      }
      setBookingToDelete(null);
      setIsSubmitting(false);
    }
  };

  const handleCloseDialog = () => { if (isSubmitting) return; setIsAddEditDialogOpen(false); resetForm(); }
  
  if (authIsLoading || isLoadingData) {
    return <div className="container mx-auto p-6 flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <header className="mb-10 flex items-center justify-between">
        <div> <h1 className="text-4xl font-bold tracking-tight text-primary">Manage Bookings</h1> <p className="mt-2 text-lg text-muted-foreground"> View, modify, and manage all your salon bookings. </p> </div>
        <Button asChild variant="outline"> <Link href="/dashboard"> <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard </Link> </Button>
      </header>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div> <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary"/>Upcoming Bookings</CardTitle> <CardDescription>A list of scheduled appointments for your salon.</CardDescription> </div>
          <Button onClick={handleOpenAddDialog} disabled={isLoadingData || isSubmitting || !ownerSalonId || availableServices.length === 0}> <PlusCircle className="mr-2 h-4 w-4" /> Add New Booking </Button>
        </CardHeader>
        <CardContent>
          {bookings.length > 0 ? (
            <Table>
              <TableCaption>A list of your salon bookings.</TableCaption>
              <TableHeader> <TableRow> <TableHead>Customer</TableHead> <TableHead>Email</TableHead> <TableHead>Service</TableHead> <TableHead>Date</TableHead> <TableHead>Time</TableHead> <TableHead>Staff</TableHead> <TableHead className="text-right">Actions</TableHead> </TableRow> </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.customerName}</TableCell>
                    <TableCell>{booking.customerEmail}</TableCell>
                    <TableCell>{booking.service}</TableCell>
                    <TableCell>{format(parseISO(booking.date), 'PPP')}</TableCell>
                    <TableCell>{booking.time}</TableCell>
                    <TableCell>{booking.staff || 'Any'}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" aria-label="Edit Booking" onClick={() => handleOpenEditDialog(booking)} disabled={isSubmitting}> <Edit2 className="h-4 w-4" /> </Button>
                      <Button variant="ghost" size="icon" aria-label="Delete Booking" className="text-destructive hover:text-destructive" onClick={() => handleOpenDeleteDialog(booking)} disabled={isSubmitting}> <Trash2 className="h-4 w-4" /> </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="min-h-[200px] flex flex-col items-center justify-center bg-muted/30 rounded-md p-6 text-center">
              <Inbox className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold text-foreground">No bookings found for your salon.</p>
              <p className="text-sm text-muted-foreground mt-2">
                {ownerSalonId 
                  ? 'Click "Add New Booking" to schedule an appointment for a customer, or customers can book through your salon page.'
                  : "Please set up your salon in 'My Salon' to start managing bookings."}
              </p>
              {!ownerSalonId && (
                <Button asChild className="mt-4">
                  <Link href="/dashboard/my-salon">Set Up My Salon</Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddEditDialogOpen} onOpenChange={(isOpen) => { if (isSubmitting) return; setIsAddEditDialogOpen(isOpen); if (!isOpen) resetForm(); }}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveBooking}>
            <DialogHeader> <DialogTitle>{currentBookingToEdit ? 'Edit Booking' : 'Add New Booking'}</DialogTitle> <DialogDescription> {currentBookingToEdit ? 'Update the details of this booking.' : 'Fill in the details for the new booking.'} </DialogDescription> </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-1.5"> <Label htmlFor="customerName">Customer Name</Label> <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g., John Doe" aria-label="Customer Name" required/> </div>
              <div className="space-y-1.5"> <Label htmlFor="customerEmail">Customer Email</Label> <Input id="customerEmail" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="e.g., john@example.com" aria-label="Customer Email" required/> </div>
              <div className="space-y-1.5"> <Label htmlFor="service-select">Service</Label>
                <Select value={selectedServiceId} onValueChange={(value) => { setSelectedServiceId(value); setSelectedStaffId(''); }}>
                  <SelectTrigger id="service-select" aria-label="Service" disabled={availableServices.length === 0}> <SelectValue placeholder={availableServices.length > 0 ? "Select a service" : "No services available"} /> </SelectTrigger>
                  <SelectContent> {availableServices.map((service) => ( <SelectItem key={service.id} value={service.id}> {service.name} ({service.duration} - {service.price}) </SelectItem> ))} </SelectContent>
                </Select>
                {availableServices.length === 0 && <p className="text-xs text-muted-foreground">Please add services in the 'Manage Services' section first.</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"> <Label htmlFor="date">Date</Label> <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Date" required/> </div>
                <div className="space-y-1.5"> <Label htmlFor="time">Time</Label> <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} aria-label="Time" required/> </div>
              </div>
              <div className="space-y-1.5"> <Label htmlFor="staff-select">Staff Member (Optional)</Label>
                <Select value={selectedStaffId} onValueChange={setSelectedStaffId} disabled={!selectedServiceId || filteredStaffForSelectedService.length === 0}>
                  <SelectTrigger id="staff-select" aria-label="Staff Member"> <SelectValue placeholder={!selectedServiceId ? "Select a service first" : (filteredStaffForSelectedService.length > 0 ? "Select available staff" : "No staff for this service")} /> </SelectTrigger>
                  <SelectContent> <SelectItem value="any">Any Available</SelectItem> {filteredStaffForSelectedService.map((staffMember) => ( <SelectItem key={staffMember.id} value={staffMember.id}> {staffMember.name} </SelectItem> ))} </SelectContent>
                </Select>
                {!selectedServiceId && <p className="text-xs text-muted-foreground">Please select a service to see available staff.</p>}
                {selectedServiceId && filteredStaffForSelectedService.length === 0 && <p className="text-xs text-muted-foreground">No staff members are configured to provide the selected service.</p>}
              </div>
              <div className="space-y-1.5"> <Label htmlFor="notes">Notes (Optional)</Label> <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any specific requests or preferences..." aria-label="Notes" /> </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting || !selectedServiceId || availableServices.length === 0}>
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
                {isSubmitting ? (currentBookingToEdit ? 'Saving...' : 'Adding...') : 'Save Booking'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!bookingToDelete} onOpenChange={(open) => { if (isSubmitting) return; !open && setBookingToDelete(null)}}>
        <AlertDialogContent>
          <AlertDialogHeader> <AlertDialogTitle>Are you sure?</AlertDialogTitle> <AlertDialogDescription> This action cannot be undone. This will permanently delete the booking for &quot;{bookingToDelete?.customerName} - {bookingToDelete?.service}&quot;. </AlertDialogDescription> </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBookingToDelete(null)} disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteBooking} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

