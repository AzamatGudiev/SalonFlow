
'use client';

import { useState, useEffect, type FormEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Building, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { Salon } from '@/lib/schemas';
import { SalonSchema } from '@/lib/schemas';
import { addSalon, updateSalon, getSalons } from '@/app/actions/salonActions';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const DEFAULT_SERVICES = [
  "Haircut - Women", "Haircut - Men", "Haircut - Children", "Hair Coloring", "Highlights - Full", "Highlights - Partial", "Balayage",
  "Blowout", "Updo/Styling", "Keratin Treatment", "Perm", "Manicure - Classic", "Pedicure - Classic", "Gel Manicure",
  "Gel Pedicure", "Nail Art", "Facial - Basic", "Facial - Advanced", "Eyebrow Shaping/Waxing", "Full Face Waxing",
  "Massage - Swedish", "Massage - Deep Tissue", "Body Scrub", "Makeup Application"
];

const DEFAULT_OPERATING_HOURS = [
  "Mon: 9am - 5pm", "Tue: 9am - 5pm", "Wed: 9am - 5pm", "Thu: 9am - 7pm", "Fri: 9am - 7pm",
  "Sat: 10am - 6pm", "Sun: 12pm - 5pm", "Mon-Fri: Morning Only (9am-1pm)", "Mon-Fri: Afternoon Only (1pm-5pm)",
  "Weekends: Full Day", "Closed Mondays", "Closed Sundays"
];

const DEFAULT_AMENITIES = [
  "Free WiFi", "Complimentary Drinks (Water, Coffee, Tea)", "Parking Available", "Street Parking", "Air Conditioning",
  "Accepts Credit Cards", "Accepts Mobile Payments", "Wheelchair Accessible", "Kid-Friendly Atmosphere", "Loyalty Program",
  "Online Booking", "Walk-ins Welcome", "Gender-Neutral Restrooms", "Background Music", "Magazines/Reading Material"
];

const OWNER_SALON_ID_LOCAL_STORAGE_KEY_PREFIX = 'owner_salon_id_';

export default function MySalonPage() {
  const { user, role, isLoading: authLoading, isLoggedIn } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [salonDetails, setSalonDetails] = useState<Partial<Salon>>({
    name: '', location: '', description: '', services: [], operatingHours: [], amenities: [],
    image: '', rating: 0, aiHint: '', ownerUid: user?.firebaseUid || '',
  });
  const [salonIdToUpdate, setSalonIdToUpdate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedOperatingHours, setSelectedOperatingHours] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const getOwnerSalonIdKey = useCallback(() => user ? `${OWNER_SALON_ID_LOCAL_STORAGE_KEY_PREFIX}${user.firebaseUid}` : null, [user]);

  const populateFormWithSalonData = useCallback((salon: Salon) => {
    setSalonDetails(salon);
    setSalonIdToUpdate(salon.id);
    setSelectedServices(salon.services || []);
    setSelectedOperatingHours(salon.operatingHours || []);
    setSelectedAmenities(salon.amenities || []);
  }, []);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/auth/login');
      return;
    }
    if (!authLoading && isLoggedIn && role !== 'owner') {
      toast({ title: "Access Denied", description: "You must be a salon owner to access this page.", variant: "destructive" });
      router.push('/dashboard');
      return;
    }
  }, [authLoading, isLoggedIn, role, router, toast]);
  
  useEffect(() => {
    async function fetchOwnerSalon() {
      if (role === 'owner' && user?.firebaseUid) {
        setIsLoadingData(true);
        try {
          const allSalons = await getSalons(); 
          const ownerSalon = allSalons.find(s => s.ownerUid === user.firebaseUid);
          
          if (ownerSalon) {
            populateFormWithSalonData(ownerSalon);
            const ownerSalonIdKey = getOwnerSalonIdKey();
            if (ownerSalonIdKey) { localStorage.setItem(ownerSalonIdKey, ownerSalon.id); }
          } else {
            setSalonDetails(prev => ({ ...prev, ownerUid: user.firebaseUid, name: '', location: '', description: '', services: [], operatingHours: [], amenities: [], image: '', rating: 0, aiHint: '' }));
            setSelectedServices([]); setSelectedOperatingHours([]); setSelectedAmenities([]);
            setSalonIdToUpdate(null);
            const ownerSalonIdKey = getOwnerSalonIdKey();
            if (ownerSalonIdKey) { localStorage.removeItem(ownerSalonIdKey); }
          }
        } catch (err: any) {
          console.error("Error fetching salon details:", err);
          toast({ title: "Error", description: err.message || "Could not fetch your salon details.", variant: "destructive" });
        } finally {
          setIsLoadingData(false);
        }
      } else if (!user && !authLoading) {
        router.push('/auth/login');
      } else if (user && role !== 'owner' && !authLoading){
        setIsLoadingData(false);
      }
    }
    fetchOwnerSalon();
  }, [authLoading, role, user, router, toast, getOwnerSalonIdKey, populateFormWithSalonData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSalonDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (
    value: string, currentSelectedArray: string[], setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !user.firebaseUid) {
      toast({ title: "Authentication Error", description: "User not found. Please log in again.", variant: "destructive" });
      return;
    }
    if (selectedServices.length === 0) {
        toast({ title: "Validation Error", description: "Please select at least one service category.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);

    const finalSalonDataInput = {
      ...salonDetails,
      ownerUid: user.firebaseUid, 
      name: salonDetails.name || 'My Salon', // Should be caught by required field
      location: salonDetails.location || 'Default Location', // Should be caught by required field
      services: selectedServices,
      operatingHours: selectedOperatingHours, 
      amenities: selectedAmenities,
      rating: salonDetails.rating || parseFloat(((Math.random() * 1.5) + 3.5).toFixed(1)),
      image: salonDetails.image || `https://placehold.co/1200x800.png?text=${encodeURIComponent(salonDetails.name || 'Salon')}`,
      aiHint: salonDetails.aiHint || salonDetails.name?.split(' ')[0]?.toLowerCase() || 'salon',
    };
    
    let result;
    if (salonIdToUpdate) {
      const dataToUpdate: Salon = { ...finalSalonDataInput, id: salonIdToUpdate } as Salon; 
      const validation = SalonSchema.safeParse(dataToUpdate);
      if (!validation.success) {
        toast({ title: "Validation Error", description: JSON.stringify(validation.error.flatten().fieldErrors), variant: "destructive" });
        setIsSubmitting(false); return;
      }
      result = await updateSalon(validation.data);
    } else {
      // For addSalon, we omit 'id' as Firestore generates it.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...dataToAddWithoutId } = finalSalonDataInput;
      const dataToAdd: Omit<Salon, 'id'> = dataToAddWithoutId as Omit<Salon, 'id'>;
      
      const validation = SalonSchema.omit({id: true}).safeParse(dataToAdd);
       if (!validation.success) {
        toast({ title: "Validation Error", description: JSON.stringify(validation.error.flatten().fieldErrors), variant: "destructive" });
        setIsSubmitting(false); return;
      }
      result = await addSalon(validation.data);
    }

    if (result.success && result.salon) {
      toast({ title: salonIdToUpdate ? "Salon Updated" : "Salon Created", description: `Salon details for "${result.salon.name}" have been saved.` });
      populateFormWithSalonData(result.salon); // Repopulate form with saved data, including new ID if created
      const ownerSalonIdKey = getOwnerSalonIdKey();
      if (ownerSalonIdKey) { localStorage.setItem(ownerSalonIdKey, result.salon.id); }
    } else {
      toast({ title: "Error", description: result.error || "Could not save salon details.", variant: "destructive" });
    }
    setIsSubmitting(false);
  };
  
  if (authLoading || isLoadingData) {
    return (
      <div className="container mx-auto p-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary flex items-center">
            <Building className="mr-3 h-10 w-10" /> {salonIdToUpdate ? 'Manage Your Salon' : 'Create Your Salon Profile'}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {salonIdToUpdate ? 'Update your salon\'s information that customers will see.' : 'Showcase your salon on SalonFlow to attract bookings.'}
          </p>
        </div>
        <Button asChild variant="outline"><Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Link></Button>
      </header>

      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader> <CardTitle>Salon Information</CardTitle> <CardDescription>Fill in the details below. Fields marked with * are essential.</CardDescription> </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2"> <Label htmlFor="name">Salon Name *</Label> <Input id="name" name="name" value={salonDetails.name || ''} onChange={handleChange} placeholder="e.g., The Glamour Spot" required /> </div>
            <div className="space-y-2"> <Label htmlFor="location">Location / Address *</Label> <Input id="location" name="location" value={salonDetails.location || ''} onChange={handleChange} placeholder="e.g., 123 Beauty Ave, Anytown" required /> </div>
            <div className="space-y-2"> <Label htmlFor="description">Description</Label> <Textarea id="description" name="description" value={salonDetails.description || ''} onChange={handleChange} placeholder="Tell customers about your salon, its atmosphere, and unique qualities." className="min-h-[100px]" /> </div>
            <Separator className="my-4" />
            <div className="space-y-2"> <Label htmlFor="image">Main Image URL</Label> <Input id="image" name="image" value={salonDetails.image || ''} onChange={handleChange} placeholder="https://placehold.co/1200x800.png" /> <p className="text-xs text-muted-foreground">A captivating image of your salon. Uses a default placeholder if empty.</p> </div>
            <div className="space-y-2"> <Label htmlFor="aiHint">Image AI Hint (1-2 words for placeholder image)</Label> <Input id="aiHint" name="aiHint" value={salonDetails.aiHint || ''} onChange={handleChange} placeholder="e.g., modern salon" /> <p className="text-xs text-muted-foreground">Helps generate a relevant placeholder image if no URL is provided. E.g., "luxury spa", "barber shop".</p> </div>
            <Separator className="my-4" />
            <div className="space-y-2"> <Label>Service Categories Offered *</Label>
              <ScrollArea className="h-48 w-full rounded-md border p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                  {DEFAULT_SERVICES.map(service => (
                    <div key={service} className="flex items-center space-x-2">
                      <Checkbox id={`service-${service.replace(/\s+/g, '-')}`} checked={selectedServices.includes(service)} onCheckedChange={() => handleCheckboxChange(service, selectedServices, setSelectedServices)} aria-label={service} />
                      <Label htmlFor={`service-${service.replace(/\s+/g, '-')}`} className="font-normal text-sm cursor-pointer"> {service} </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              {selectedServices.length === 0 && <p className="text-xs text-destructive">Please select at least one service category your salon offers.</p>}
            </div>
            <Separator className="my-4" />
            <div className="space-y-2"> <Label>Operating Hours</Label>
              <ScrollArea className="h-48 w-full rounded-md border p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                  {DEFAULT_OPERATING_HOURS.map(hours => (
                    <div key={hours} className="flex items-center space-x-2">
                      <Checkbox id={`hours-${hours.replace(/\s+/g, '-')}`} checked={selectedOperatingHours.includes(hours)} onCheckedChange={() => handleCheckboxChange(hours, selectedOperatingHours, setSelectedOperatingHours)} aria-label={hours} />
                      <Label htmlFor={`hours-${hours.replace(/\s+/g, '-')}`} className="font-normal text-sm cursor-pointer"> {hours} </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <Separator className="my-4" />
            <div className="space-y-2"> <Label>Amenities</Label>
              <ScrollArea className="h-48 w-full rounded-md border p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                  {DEFAULT_AMENITIES.map(amenity => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox id={`amenity-${amenity.replace(/\s+/g, '-')}`} checked={selectedAmenities.includes(amenity)} onCheckedChange={() => handleCheckboxChange(amenity, selectedAmenities, setSelectedAmenities)} aria-label={amenity} />
                      <Label htmlFor={`amenity-${amenity.replace(/\s+/g, '-')}`} className="font-normal text-sm cursor-pointer"> {amenity} </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <Button type="submit" className="w-full text-lg py-6 mt-4" disabled={isSubmitting || authLoading || isLoadingData || selectedServices.length === 0 || !salonDetails.name || !salonDetails.location}>
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              {isSubmitting ? 'Saving...' : (salonIdToUpdate ? 'Save Changes' : 'Create My Salon')}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
