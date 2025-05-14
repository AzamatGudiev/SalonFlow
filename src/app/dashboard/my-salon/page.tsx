
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
import { ArrowLeft, Save, Building, Image as ImageIcon, Clock, Users as UsersIcon, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import type { Salon } from '@/lib/schemas';
import { SalonSchema } from '@/lib/schemas'; // For validation
import { addSalon, updateSalon, getSalons } from '@/app/actions/salonActions'; // We'll need a way to get the current salon for the owner

export default function MySalonPage() {
  const { user, role, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [salonDetails, setSalonDetails] = useState<Partial<Salon>>({
    name: '',
    location: '',
    description: '',
    services: [], // Stored as an array of strings
    operatingHours: [], // Stored as an array of strings
    amenities: [], // Stored as an array of strings
    image: '',
    rating: 0, // Default, can be managed elsewhere or by reviews
    aiHint: '',
  });
  const [salonIdToUpdate, setSalonIdToUpdate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Form field states (for better UX with arrays)
  const [servicesString, setServicesString] = useState('');
  const [operatingHoursString, setOperatingHoursString] = useState('');
  const [amenitiesString, setAmenitiesString] = useState('');

  useEffect(() => {
    if (!authLoading && role !== 'owner') {
      toast({ title: "Access Denied", description: "You must be a salon owner to access this page.", variant: "destructive" });
      router.push('/dashboard');
    }
  }, [authLoading, role, router, toast]);

  useEffect(() => {
    // Fetch existing salon details for the owner if any
    // For simplicity, this example assumes one salon per owner and fetches the first one found
    // In a real app, you'd filter by ownerId
    if (role === 'owner') {
      setIsLoadingData(true);
      getSalons() // In a real app, this would be getSalonByOwnerId(user.id)
        .then(salons => {
          if (salons.length > 0) {
            // For now, assume the first salon is the one owned by this user.
            // This needs to be more robust in a real app (e.g., storing ownerId on salon).
            const currentSalon = salons[0]; 
            setSalonDetails(currentSalon);
            setSalonIdToUpdate(currentSalon.id);
            setServicesString(currentSalon.services.join(', '));
            setOperatingHoursString((currentSalon.operatingHours || []).join(', '));
            setAmenitiesString((currentSalon.amenities || []).join(', '));
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const finalSalonData = {
      ...salonDetails,
      name: salonDetails.name || 'My Salon', // Default name if empty
      location: salonDetails.location || 'Default Location',
      services: servicesString.split(',').map(s => s.trim()).filter(s => s),
      operatingHours: operatingHoursString.split(',').map(s => s.trim()).filter(s => s),
      amenities: amenitiesString.split(',').map(s => s.trim()).filter(s => s),
      rating: salonDetails.rating || 0,
      image: salonDetails.image || `https://placehold.co/1200x800.png?text=${encodeURIComponent(salonDetails.name || 'Salon')}`,
      aiHint: salonDetails.aiHint || salonDetails.name?.split(' ')[0]?.toLowerCase() || 'salon',
    };
    
    // Validate using Zod schema (excluding ID for add, including for update)
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
      result = await updateSalon({ ...validationResult.data, id: salonIdToUpdate } as Salon); // Cast because validationResult.data might not have id
    } else {
      // For addSalon, ensure data matches Omit<Salon, 'id'>
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...dataToAdd } = validationResult.data as Salon; 
      result = await addSalon(dataToAdd);
    }

    if (result.success && result.salon) {
      toast({ title: salonIdToUpdate ? "Salon Updated" : "Salon Created", description: `Your salon details for "${result.salon.name}" have been saved.` });
      setSalonDetails(result.salon);
      setSalonIdToUpdate(result.salon.id);
      setServicesString(result.salon.services.join(', '));
      setOperatingHoursString((result.salon.operatingHours || []).join(', '));
      setAmenitiesString((result.salon.amenities || []).join(', '));
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
              <Label htmlFor="aiHint">Image AI Hint (1-2 words)</Label>
              <Input id="aiHint" name="aiHint" value={salonDetails.aiHint || ''} onChange={handleChange} placeholder="e.g., modern salon" />
              <p className="text-xs text-muted-foreground">Helps AI find relevant images if a real one isn't available. E.g., "luxury spa", "barber shop".</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="servicesString">Services Offered (comma-separated)</Label>
              <Textarea 
                id="servicesString" 
                name="servicesString" 
                value={servicesString} 
                onChange={(e) => setServicesString(e.target.value)} 
                placeholder="e.g., Haircut, Manicure, Massage, Facial" 
                className="min-h-[80px]" 
              />
              <p className="text-xs text-muted-foreground">List the main services your salon provides.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="operatingHoursString">Operating Hours (comma-separated)</Label>
              <Textarea 
                id="operatingHoursString" 
                name="operatingHoursString" 
                value={operatingHoursString} 
                onChange={(e) => setOperatingHoursString(e.target.value)} 
                placeholder="e.g., Mon-Fri: 9am-7pm, Sat: 10am-5pm, Sun: Closed" 
                className="min-h-[80px]"
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="amenitiesString">Amenities (comma-separated)</Label>
              <Textarea 
                id="amenitiesString" 
                name="amenitiesString" 
                value={amenitiesString} 
                onChange={(e) => setAmenitiesString(e.target.value)} 
                placeholder="e.g., Free WiFi, Complimentary Drinks, Parking Available" 
                className="min-h-[80px]"
              />
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
