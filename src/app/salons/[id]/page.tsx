
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MapPin, Star, CalendarDays, Tag, Clock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Salon {
  id: string;
  name: string;
  location: string;
  rating: number;
  services: string[];
  image: string;
  aiHint: string;
  description?: string;
  operatingHours?: string[]; // e.g., ["Mon-Fri: 9 AM - 7 PM", "Sat: 10 AM - 5 PM"]
  amenities?: string[]; // e.g., ["Wi-Fi", "Parking", "Refreshments"]
}

// Expanded mock data to include details for the detail page
const allMockSalons: Salon[] = [
  { 
    id: '1', 
    name: 'Chic & Sleek Salon', 
    location: '123 Beauty Ave, Glamour City', 
    rating: 4.8, 
    services: ['Haircut & Style', 'Advanced Hair Coloring', 'Keratin Treatment', 'Bridal Hair', 'Manicure', 'Pedicure'], 
    image: 'https://placehold.co/1200x800.png', 
    aiHint: 'modern salon luxury',
    description: 'Chic & Sleek Salon offers a luxurious experience with top-tier stylists specializing in modern cuts, vibrant colors, and transformative treatments. We use premium products to ensure your hair stays healthy and beautiful.',
    operatingHours: ["Mon - Fri: 9:00 AM - 7:00 PM", "Saturday: 10:00 AM - 6:00 PM", "Sunday: Closed"],
    amenities: ["Free Wi-Fi", "Complimentary Refreshments", "Parking Available", "Air Conditioned"]
  },
  { 
    id: '2', 
    name: 'Urban Oasis Spa', 
    location: '456 Serenity Rd, Metroville', 
    rating: 4.5, 
    services: ['Swedish Massage', 'Deep Tissue Massage', 'Rejuvenating Facials', 'Body Wraps', 'Aromatherapy'], 
    image: 'https://placehold.co/1200x800.png', 
    aiHint: 'spa interior tranquil',
    description: 'Escape the hustle and bustle at Urban Oasis Spa. Our certified therapists provide a range of massages, facials, and body treatments designed to relax your mind and revitalize your body.',
    operatingHours: ["Tue - Sat: 10:00 AM - 8:00 PM", "Sunday: 11:00 AM - 5:00 PM", "Monday: Closed"],
    amenities: ["Relaxation Lounge", "Herbal Tea Selection", "Private Treatment Rooms", "Soothing Music"]
  },
  { 
    id: '3', 
    name: 'The Gentleman\'s Cut', 
    location: '789 Dapper St, Suave Town', 
    rating: 4.9, 
    services: ['Classic Men\'s Haircut', 'Modern Fades', 'Hot Towel Shave', 'Beard Trim & Sculpting', 'Scalp Treatments'], 
    image: 'https://placehold.co/1200x800.png', 
    aiHint: 'barber shop classic',
    description: 'Experience traditional barbering with a modern twist at The Gentleman\'s Cut. Our skilled barbers provide precision haircuts, classic shaves, and expert beard care in a relaxed, masculine environment.',
    operatingHours: ["Mon - Sat: 9:00 AM - 7:30 PM", "Sunday: 10:00 AM - 4:00 PM"],
    amenities: ["Leather Barber Chairs", "Sports TV", "Complimentary Whiskey/Beer (21+)", "Classic Grooming Products"]
  },
  { 
    id: '4', 
    name: 'Nail Perfection Studio', 
    location: '101 Polish Pl, Sparkle City', 
    rating: 4.7, 
    services: ['Classic Manicure', 'Gel Manicure (Shellac)', 'Luxury Pedicure', 'Custom Nail Art', 'Acrylic Extensions'], 
    image: 'https://placehold.co/1200x800.png', 
    aiHint: 'nail salon colorful',
    description: 'At Nail Perfection Studio, we believe your nails are a work of art. Our talented technicians offer a wide array of nail services, from classic manicures to intricate nail art, using high-quality, long-lasting products.',
    operatingHours: ["Mon - Sun: 10:00 AM - 8:00 PM"],
    amenities: ["Wide Color Selection", "Comfortable Pedicure Stations", "Sanitized Equipment", "Loyalty Program"]
  },
  { 
    id: '5', 
    name: 'Radiant Beauty Center', 
    location: '202 Glow St, Luminous Town', 
    rating: 4.6, 
    services: ['Signature Facials', 'Body Waxing', 'Eyebrow Shaping', 'Eyelash Extensions', 'Makeup Application', 'Hair Coloring'], 
    image: 'https://placehold.co/1200x800.png', 
    aiHint: 'beauty center bright',
    description: 'Radiant Beauty Center is your one-stop destination for all things beauty. We offer a comprehensive range of services from expert skincare and waxing to stunning makeup and hair transformations.',
    operatingHours: ["Tue - Fri: 9:00 AM - 6:00 PM", "Saturday: 9:00 AM - 5:00 PM", "Sun, Mon: Closed"],
    amenities: ["Consultation Available", "Professional Makeup Station", "Quiet Treatment Rooms", "High-Quality Skincare Products"]
  },
];

export default function SalonDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const salonId = params.id as string;

  useEffect(() => {
    if (salonId) {
      const foundSalon = allMockSalons.find(s => s.id === salonId);
      setSalon(foundSalon || null);
    }
    setIsLoading(false);
  }, [salonId]);

  const handleBookAppointment = () => {
    if (!salon) return;
    // In a real app, this would navigate to a booking flow or open a booking modal.
    // For this prototype, we'll show a toast.
    toast({
      title: "Booking Simulated!",
      description: `Your appointment request for ${salon.name} has been noted. (This is a prototype action)`,
      duration: 5000,
    });
  };

  if (isLoading) {
    return <div className="container mx-auto py-12 px-4 text-center">Loading salon details...</div>;
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
            objectFit="cover"
            data-ai-hint={salon.aiHint}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent flex flex-col justify-end p-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white shadow-md">{salon.name}</h1>
            <div className="flex items-center mt-2">
              <Star className="h-6 w-6 text-yellow-300 fill-yellow-300 mr-1.5" />
              <span className="font-semibold text-xl text-white">{salon.rating}</span>
              <span className="text-sm text-gray-200 ml-2">({Math.floor(Math.random() * 200) + 50} reviews)</span>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-0">
          <div className="md:col-span-2 p-6 md:p-8">
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
                <h2 className="text-2xl font-semibold text-foreground mb-4">Services Offered</h2>
                <div className="flex flex-wrap gap-3">
                  {salon.services.map(service => (
                    <Badge key={service} variant="secondary" className="text-sm px-3 py-1.5 bg-primary/10 text-primary border-primary/30">
                      <Tag className="mr-2 h-4 w-4" /> {service}
                    </Badge>
                  ))}
                </div>
              </section>
             
              {salon.amenities && salon.amenities.length > 0 && (
                <>
                <Separator className="my-8" />
                <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">Amenities</h2>
                    <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-muted-foreground">
                    {salon.amenities.map(amenity => (
                        <li key={amenity} className="flex items-center">
                        <ShieldCheck className="h-5 w-5 mr-2 text-green-500" /> {amenity}
                        </li>
                    ))}
                    </ul>
                </section>
                </>
              )}

            </CardContent>
          </div>

          <aside className="md:col-span-1 bg-secondary/50 p-6 md:p-8 border-l border-border">
            <div className="sticky top-24">
              <h3 className="text-2xl font-semibold text-foreground mb-4">Book Your Visit</h3>
              <Button size="lg" className="w-full text-lg py-3 mb-6" onClick={handleBookAppointment}>
                <CalendarDays className="mr-2 h-5 w-5" /> Request Appointment
              </Button>

              {salon.operatingHours && salon.operatingHours.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-lg font-medium text-foreground mb-2 flex items-center">
                        <Clock className="mr-2 h-5 w-5 text-primary" /> Operating Hours
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                        {salon.operatingHours.map(hours => (
                        <li key={hours}>{hours}</li>
                        ))}
                    </ul>
                </div>
              )}

              <div>
                 <h4 className="text-lg font-medium text-foreground mb-2">Contact Information</h4>
                 <p className="text-sm text-muted-foreground">Phone: (123) 456-7890 (Placeholder)</p>
                 <p className="text-sm text-muted-foreground">Email: info@{salon.name.toLowerCase().replace(/\s+/g, '')}.com (Placeholder)</p>
              </div>
            </div>
          </aside>
        </div>
      </Card>
    </div>
  );
}

    