
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MapPin, Star, CalendarDays, Tag, Clock, ShieldCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Salon } from '@/lib/schemas'; // Using the Salon type from schemas
import { getSalonById } from '@/app/actions/salonActions';
import { Skeleton } from '@/components/ui/skeleton';


export default function SalonDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const salonId = params.id as string;

  useEffect(() => {
    if (salonId) {
      setIsLoading(true);
      getSalonById(salonId)
        .then(foundSalon => {
          setSalon(foundSalon);
        })
        .catch(error => {
          console.error("Error fetching salon details:", error);
          toast({ title: "Error", description: "Could not fetch salon details.", variant: "destructive" });
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false); // No ID, so not loading
    }
  }, [salonId, toast]);

  const handleBookAppointment = () => {
    if (!salon) return;
    toast({
      title: "Booking Simulated!",
      description: `Your appointment request for ${salon.name} has been noted. (This is a prototype action)`,
      duration: 5000,
    });
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
