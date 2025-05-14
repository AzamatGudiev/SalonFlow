
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, MapPin, Star, CalendarDays, Tag, Clock, ShieldCheck, Loader2, Users, ConciergeBell, Edit3 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Salon, Service, StaffMember, Booking } from '@/lib/schemas';
import { getSalonById } from '@/app/actions/salonActions';
import { getServices } from '@/app/actions/serviceActions';
import { getStaffMembers } from '@/app/actions/staffActions';
import { addBooking } from '@/app/actions/bookingActions';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';


export default function SalonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoggedIn } = useAuth();

  const [salon, setSalon] = useState<Salon | null>(null);
  const [salonServices, setSalonServices] = useState<Service[]>([]);
  const [salonStaff, setSalonStaff] = useState<StaffMember[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingLoading, setIsBookingLoading] = useState(false);

  // Booking form state
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookingNotes, setBookingNotes] = useState<string>('');

  const salonId = params.id as string;

  useEffect(() => {
    if (salonId) {
      setIsLoading(true);
      Promise.all([
        getSalonById(salonId),
        getServices(), // Fetch all services
        getStaffMembers({ salonId: salonId }) // Fetch staff for this salon
      ]).then(([foundSalon, allServices, staffForSalon]) => {
        setSalon(foundSalon);
        if (foundSalon) {
          // Filter services: only show services whose category is in the salon's defined service categories
          const filteredServices = allServices.filter(service => 
            foundSalon.services.includes(service.category)
          );
          setSalonServices(filteredServices);
        } else {
          setSalonServices([]);
        }
        setSalonStaff(staffForSalon.map(s => ({...s, providedServices: s.providedServices || []})));
      }).catch(error => {
        console.error("Error fetching salon details, services, or staff:", error);
        toast({ title: "Error", description: "Could not fetch salon information.", variant: "destructive" });
      }).finally(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [salonId, toast]);

  const availableStaffForSelectedService = salonStaff.filter(staff => {
    if (!selectedServiceId) return true; // Show all salon staff if no service is selected yet
    const service = salonServices.find(s => s.id === selectedServiceId);
    return service && staff.providedServices?.includes(service.name);
  });

  const handleBookAppointment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isLoggedIn || !user) {
      toast({ title: "Login Required", description: "Please log in to book an appointment.", variant: "destructive" });
      router.push('/auth/login');
      return;
    }
    if (!salon || !selectedServiceId || !selectedDate || !selectedTime) {
      toast({ title: "Missing Information", description: "Please select a service, date, and time.", variant: "destructive" });
      return;
    }
    setIsBookingLoading(true);

    const serviceDetails = salonServices.find(s => s.id === selectedServiceId);
    const staffDetails = salonStaff.find(s => s.id === selectedStaffId);

    const bookingData: Omit<Booking, 'id'> = {
      customerName: `${user.firstName} ${user.lastName}`, // Use logged-in user's name
      service: serviceDetails?.name || 'Unknown Service',
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime,
      staff: staffDetails?.name || (selectedStaffId === 'any' ? 'Any Available' : undefined),
      notes: bookingNotes || undefined,
    };
    
    const result = await addBooking(bookingData);
    setIsBookingLoading(false);

    if (result.success && result.booking) {
      toast({
        title: "Booking Confirmed!",
        description: `Your appointment for ${result.booking.service} at ${salon.name} on ${format(selectedDate, 'PPP')} at ${selectedTime} is confirmed.`,
        duration: 7000,
      });
      // Reset form or redirect
      setSelectedServiceId('');
      setSelectedStaffId('');
      setSelectedDate(undefined);
      setSelectedTime('');
      setBookingNotes('');
      // router.push('/dashboard/my-bookings'); // Optional: redirect to user's bookings
    } else {
      toast({ title: "Booking Failed", description: result.error || "Could not complete your booking.", variant: "destructive" });
    }
  };


  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 animate-pulse">
        <Skeleton className="h-9 w-36 mb-6" />
        <Card className="overflow-hidden">
          <Skeleton className="w-full h-64 md:h-96" />
          <div className="grid md:grid-cols-3 gap-0">
            <div className="md:col-span-2 p-6 md:p-8">
              <Skeleton className="h-10 w-3/4 mb-2" />
              <Skeleton className="h-5 w-1/2 mb-6" />
              <Skeleton className="h-6 w-1/3 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-8" />
              <Skeleton className="h-px w-full my-8" />
              <Skeleton className="h-6 w-1/2 mb-4" />
              <div className="flex flex-wrap gap-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 w-24 rounded-full" />)}
              </div>
            </div>
            <aside className="md:col-span-1 bg-secondary/50 p-6 md:p-8 border-l">
              <div className="sticky top-24">
                <Skeleton className="h-8 w-1/2 mb-4" />
                <Skeleton className="h-12 w-full mb-6" />
                <Skeleton className="h-6 w-1/3 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4 mb-6" />
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            </aside>
          </div>
        </Card>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-semibold text-destructive mb-4">Salon Not Found</h1>
        <p className="text-muted-foreground mb-6">The salon you are looking for does not exist or the link is incorrect.</p>
        <Button asChild variant="outline">
          <Link href="/salons">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Salons
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button asChild variant="outline" className="mb-6">
        <Link href="/salons">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Salons
        </Link>
      </Button>

      <Card className="overflow-hidden shadow-xl">
        <div className="relative w-full h-64 md:h-96">
          <Image
            src={salon.image}
            alt={salon.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
            objectFit="cover"
            data-ai-hint={salon.aiHint}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent flex flex-col justify-end p-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white shadow-md">{salon.name}</h1>
            <div className="flex items-center mt-2">
              <Star className="h-6 w-6 text-yellow-300 fill-yellow-300 mr-1.5" />
              <span className="font-semibold text-xl text-white">{salon.rating.toFixed(1)}</span>
              <span className="text-sm text-gray-200 ml-2">({Math.floor(Math.random() * 200) + 50} reviews)</span>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-0">
          <main className="md:col-span-2 p-6 md:p-8">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-3xl text-primary mb-1">Welcome to {salon.name}</CardTitle>
              <div className="flex items-center text-muted-foreground text-md">
                <MapPin className="h-5 w-5 mr-2 text-primary" /> {salon.location}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-3">About Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {salon.description || 'Detailed description coming soon.'}
                </p>
              </section>

              <Separator className="my-8" />

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Service Categories</h2>
                <div className="flex flex-wrap gap-3">
                  {salon.services.map(serviceCategory => ( // These are categories from salon.services
                    <Badge key={serviceCategory} variant="secondary" className="text-sm px-3 py-1.5 bg-primary/10 text-primary border-primary/30">
                      <ConciergeBell className="mr-2 h-4 w-4" /> {serviceCategory}
                    </Badge>
                  ))}
                </div>
                {salon.services.length === 0 && <p className="text-muted-foreground">No service categories defined by this salon yet.</p>}
              </section>
             
              {salon.amenities && salon.amenities.length > 0 && (
                <>
                <Separator className="my-8" />
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-foreground mb-4">Amenities</h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-muted-foreground">
                    {salon.amenities.map(amenity => (
                        <li key={amenity} className="flex items-center">
                        <ShieldCheck className="h-5 w-5 mr-2 text-green-500" /> {amenity}
                        </li>
                    ))}
                    </ul>
                </section>
                </>
              )}

              {salon.operatingHours && salon.operatingHours.length > 0 && (
                 <>
                <Separator className="my-8" />
                <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">Operating Hours</h2>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                        {salon.operatingHours.map(hours => (
                        <li key={hours}  className="flex items-center"><Clock className="mr-2 h-4 w-4 text-primary/70" /> {hours}</li>
                        ))}
                    </ul>
                </section>
                </>
              )}

            </CardContent>
          </main>

          <aside className="md:col-span-1 bg-secondary/50 p-6 md:p-8 border-l border-border">
            <div className="sticky top-24">
              <h3 className="text-2xl font-semibold text-foreground mb-6">Book Your Visit</h3>
              <form onSubmit={handleBookAppointment} className="space-y-6">
                <div>
                  <Label htmlFor="service-select" className="text-sm font-medium">Service</Label>
                  <Select 
                    value={selectedServiceId} 
                    onValueChange={(value) => {
                      setSelectedServiceId(value);
                      setSelectedStaffId(''); // Reset staff if service changes
                    }}
                    required
                    disabled={salonServices.length === 0}
                  >
                    <SelectTrigger id="service-select" className="mt-1" aria-label="Select Service">
                      <SelectValue placeholder={salonServices.length > 0 ? "Select a service" : "No services available"} />
                    </SelectTrigger>
                    <SelectContent>
                      {salonServices.map(service => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} ({service.duration}, {service.price})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {salonServices.length === 0 && <p className="text-xs text-muted-foreground mt-1">This salon has not listed specific services yet.</p>}
                </div>

                <div>
                  <Label htmlFor="staff-select" className="text-sm font-medium">Staff Member (Optional)</Label>
                  <Select 
                    value={selectedStaffId} 
                    onValueChange={setSelectedStaffId}
                    disabled={!selectedServiceId || availableStaffForSelectedService.length === 0}
                  >
                    <SelectTrigger id="staff-select" className="mt-1" aria-label="Select Staff Member">
                      <SelectValue placeholder={
                        !selectedServiceId ? "Select service first" :
                        availableStaffForSelectedService.length === 0 ? "No staff for this service" :
                        "Any Available or Select Staff"
                      }/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Available</SelectItem>
                      {availableStaffForSelectedService.map(staff => (
                        <SelectItem key={staff.id} value={staff.id}>{staff.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date-select" className="text-sm font-medium">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date-select"
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal mt-1"
                        disabled={!selectedServiceId}
                      >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) } // Disable past dates
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                    <Label htmlFor="time-select" className="text-sm font-medium">Time</Label>
                    <Input 
                        id="time-select" 
                        type="time" 
                        value={selectedTime} 
                        onChange={e => setSelectedTime(e.target.value)} 
                        className="mt-1"
                        required
                        disabled={!selectedDate}
                    />
                </div>

                <div>
                    <Label htmlFor="booking-notes" className="text-sm font-medium">Notes (Optional)</Label>
                    <Textarea 
                        id="booking-notes"
                        value={bookingNotes}
                        onChange={e => setBookingNotes(e.target.value)}
                        placeholder="Any specific requests or preferences..."
                        className="mt-1 min-h-[80px]"
                    />
                </div>

                <Button type="submit" size="lg" className="w-full text-lg py-3" disabled={isBookingLoading || !selectedServiceId || !selectedDate || !selectedTime || !isLoggedIn}>
                  {isBookingLoading ? <Loader2 className="animate-spin mr-2"/> : <Edit3 className="mr-2 h-5 w-5" />}
                  {isLoggedIn ? 'Book Appointment' : 'Login to Book'}
                </Button>
                {!isLoggedIn && <p className="text-xs text-center text-muted-foreground mt-2">You need to be logged in to make a booking.</p>}
              </form>
            </div>
          </aside>
        </div>
      </Card>
    </div>
  );
}
