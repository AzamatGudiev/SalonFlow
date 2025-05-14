
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Building } from 'lucide-react';
import Link from 'next/link';
import type { Salon } from '@/lib/schemas';
import { SalonSchema } from '@/lib/schemas';
import { addSalon, updateSalon, getSalons } from '@/app/actions/salonActions';
import { ScrollArea } from '@/components/ui/scroll-area';

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


export default function MySalonPage() {
  const { user, role, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [salonDetails, setSalonDetails] = useState<Partial<Salon>>({
    name: '',
    location: '',
    description: '',
    services: [],
    operatingHours: [],
    amenities: [],
    image: '',
    rating: 0,
    aiHint: '',
  });
  const [salonIdToUpdate, setSalonIdToUpdate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // State for checkbox selections
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedOperatingHours, setSelectedOperatingHours] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && role !== 'owner') {
      toast({ title: "Access Denied", description: "You must be a salon owner to access this page.", variant: "destructive" });
      router.push('/dashboard');
    }
  }, [authLoading, role, router, toast]);

  useEffect(() => {
    if (role === 'owner') {
      setIsLoadingData(true);
      getSalons() // In a real app, this would be getSalonByOwnerId(user.id)
        .then(salons => {
          // This simple logic assumes the owner has at most one salon.
          // For a multi-salon system, this would need to be more sophisticated.
          if (salons.length > 0) {
            const currentSalon = salons[0]; // Assuming the first salon found is the owner's
            setSalonDetails(currentSalon);
            setSalonIdToUpdate(currentSalon.id);
            setSelectedServices(currentSalon.services || []);
            setSelectedOperatingHours(currentSalon.operatingHours || []);
            setSelectedAmenities(currentSalon.amenities || []);
          }
        })
        .catch(err => {
          console.error("Error fetching salon details:", err);
          toast({ title: "Error", description: "Could not fetch salon details.", variant: "destructive" });
        })
        .finally(() => setIsLoadingData(false));
    } else {
        setIsLoadingData(false);
    }
  }, [role, toast, user]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSalonDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (
    value: string,
    selectedArray: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (selectedArray.includes(value)) {
      setter(selectedArray.filter(item => item !== value));
    } else {
      setter([...selectedArray, value]);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const finalSalonData = {
      ...salonDetails,
      name: salonDetails.name || 'My Salon',
      location: salonDetails.location || 'Default Location',
      services: selectedServices,
      operatingHours: selectedOperatingHours,
      amenities: selectedAmenities,
      rating: salonDetails.rating || 0,
      image: salonDetails.image || `https://placehold.co/1200x800.png?text=${encodeURIComponent(salonDetails.name || 'Salon')}`,
      aiHint: salonDetails.aiHint || salonDetails.name?.split(' ')[0]?.toLowerCase() || 'salon',
    };
    
    const validationSchema = salonIdToUpdate ? SalonSchema : SalonSchema.omit({ id: true });
    const validationResult = validationSchema.safeParse(
      salonIdToUpdate ? { ...finalSalonData, id: salonIdToUpdate } : finalSalonData
    );

    if (!validationResult.success) {
      const errorMessages = JSON.stringify(validationResult.error.flatten().fieldErrors);
      toast({ title: "Validation Error", description: errorMessages, variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    let result;
    if (salonIdToUpdate) {
      result = await updateSalon({ ...validationResult.data, id: salonIdToUpdate } as Salon);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...dataToAdd } = validationResult.data as Salon; 
      result = await addSalon(dataToAdd);
    }

    if (result.success && result.salon) {
      toast({ title: salonIdToUpdate ? "Salon Updated" : "Salon Created", description: `Your salon details for "${result.salon.name}" have been saved.` });
      setSalonDetails(result.salon);
      setSalonIdToUpdate(result.salon.id);
      setSelectedServices(result.salon.services || []);
      setSelectedOperatingHours(result.salon.operatingHours || []);
      setSelectedAmenities(result.salon.amenities || []);
    } else {
      toast({ title: "Error", description: result.error || "Could not save salon details.", variant: "destructive" });
    }
    setIsSubmitting(false);
  };
  
  if (authLoading || isLoadingData) {
    return <div className="container mx-auto p-8">Loading salon details...</div>;
  }
  if (role !== 'owner') {
     return <div className="container mx-auto p-8">Access Denied.</div>;
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary flex items-center">
            <Building className="mr-3 h-10 w-10" /> {salonIdToUpdate ? 'Manage Your Salon' : 'Create Your Salon'}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {salonIdToUpdate ? 'Update your salon\'s information that customers will see.' : 'Add your salon to SalonFlow to start getting bookings.'}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </header>

      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle>Salon Information</CardTitle>
          <CardDescription>Fill in the details below. Fields marked with * are recommended.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Salon Name *</Label>
              <Input id="name" name="name" value={salonDetails.name || ''} onChange={handleChange} placeholder="e.g., The Glamour Spot" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location / Address *</Label>
              <Input id="location" name="location" value={salonDetails.location || ''} onChange={handleChange} placeholder="e.g., 123 Beauty Ave, Anytown" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" value={salonDetails.description || ''} onChange={handleChange} placeholder="Tell customers about your salon, its atmosphere, and unique qualities." className="min-h-[100px]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Main Image URL</Label>
              <Input id="image" name="image" value={salonDetails.image || ''} onChange={handleChange} placeholder="https://placehold.co/1200x800.png" />
              <p className="text-xs text-muted-foreground">A captivating image of your salon. Use a service like Placehold.co for placeholders.</p>
            </div>
             <div className="space-y-2">
              <Label htmlFor="aiHint">Image AI Hint (1-2 words for placeholder)</Label>
              <Input id="aiHint" name="aiHint" value={salonDetails.aiHint || ''} onChange={handleChange} placeholder="e.g., modern salon" />
              <p className="text-xs text-muted-foreground">Helps AI find relevant images if a real one isn't available. E.g., "luxury spa", "barber shop".</p>
            </div>

            <div className="space-y-2">
              <Label>Services Offered</Label>
              <ScrollArea className="h-48 w-full rounded-md border p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                  {DEFAULT_SERVICES.map(service => (
                    <div key={service} className="flex items-center space-x-2">
                      <Checkbox
                        id={`service-${service.replace(/\s+/g, '-')}`}
                        checked={selectedServices.includes(service)}
                        onCheckedChange={() => handleCheckboxChange(service, selectedServices, setSelectedServices)}
                      />
                      <Label htmlFor={`service-${service.replace(/\s+/g, '-')}`} className="font-normal text-sm">
                        {service}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            
            <div className="space-y-2">
              <Label>Operating Hours</Label>
               <ScrollArea className="h-48 w-full rounded-md border p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                  {DEFAULT_OPERATING_HOURS.map(hours => (
                    <div key={hours} className="flex items-center space-x-2">
                      <Checkbox
                        id={`hours-${hours.replace(/\s+/g, '-')}`}
                        checked={selectedOperatingHours.includes(hours)}
                        onCheckedChange={() => handleCheckboxChange(hours, selectedOperatingHours, setSelectedOperatingHours)}
                      />
                      <Label htmlFor={`hours-${hours.replace(/\s+/g, '-')}`} className="font-normal text-sm">
                        {hours}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

             <div className="space-y-2">
              <Label>Amenities</Label>
              <ScrollArea className="h-48 w-full rounded-md border p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                  {DEFAULT_AMENITIES.map(amenity => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={`amenity-${amenity.replace(/\s+/g, '-')}`}
                        checked={selectedAmenities.includes(amenity)}
                        onCheckedChange={() => handleCheckboxChange(amenity, selectedAmenities, setSelectedAmenities)}
                      />
                      <Label htmlFor={`amenity-${amenity.replace(/\s+/g, '-')}`} className="font-normal text-sm">
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <Button type="submit" className="w-full text-lg py-6" disabled={isSubmitting}>
              <Save className="mr-2 h-5 w-5" /> {isSubmitting ? 'Saving...' : (salonIdToUpdate ? 'Save Changes' : 'Create Salon')}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}

    