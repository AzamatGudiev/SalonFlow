
'use client';

import { useState, useEffect, type FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link"; // Added Link import
import { useRouter } from "next/navigation"; // Added useRouter import
import { useToast } from "@/hooks/use-toast";

interface Salon {
  id: string;
  name: string;
  location: string;
  rating: number;
  services: string[];
  image: string;
  aiHint: string;
}

const allMockSalons: Salon[] = [
  { id: '1', name: 'Chic & Sleek Salon', location: '123 Beauty Ave, Glamour City', rating: 4.8, services: ['Haircut', 'Coloring', 'Styling', 'Manicure'], image: 'https://placehold.co/600x400.png', aiHint: 'modern salon' },
  { id: '2', name: 'Urban Oasis Spa', location: '456 Serenity Rd, Metroville', rating: 4.5, services: ['Massage', 'Facials', 'Manicure', 'Pedicure'], image: 'https://placehold.co/600x400.png', aiHint: 'spa interior' },
  { id: '3', name: 'The Gentleman\'s Cut', location: '789 Dapper St, Suave Town', rating: 4.9, services: ['Men\'s Haircut', 'Beard Trim', 'Shave', 'Hot Towel'], image: 'https://placehold.co/600x400.png', aiHint: 'barber shop' },
  { id: '4', name: 'Nail Perfection Studio', location: '101 Polish Pl, Sparkle City', rating: 4.7, services: ['Manicure', 'Pedicure', 'Nail Art', 'Gel Nails'], image: 'https://placehold.co/600x400.png', aiHint: 'nail salon' },
  { id: '5', name: 'Radiant Beauty Center', location: '202 Glow St, Luminous Town', rating: 4.6, services: ['Facials', 'Waxing', 'Lash Extensions', 'Coloring'], image: 'https://placehold.co/600x400.png', aiHint: 'beauty center' },
];


export default function SalonsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSalons, setFilteredSalons] = useState<Salon[]>(allMockSalons);

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredSalons(allMockSalons);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const results = allMockSalons.filter(salon => 
        salon.name.toLowerCase().includes(lowerCaseQuery) ||
        salon.location.toLowerCase().includes(lowerCaseQuery) ||
        salon.services.some(service => service.toLowerCase().includes(lowerCaseQuery))
      );
      setFilteredSalons(results);
    }
  }, [searchQuery]);
  
  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Search query state update already triggers useEffect for filtering
    if (filteredSalons.length === 0 && searchQuery !== '') {
        toast({
            title: "No Results",
            description: `No salons found matching "${searchQuery}". Try a different search.`,
        });
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Find Your Perfect Salon</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Discover top-rated salons and spas near you. Book your next appointment with ease.
        </p>
      </header>

      <form className="mb-8 max-w-2xl mx-auto" onSubmit={handleSearchSubmit}>
        <div className="relative">
          <Input
            type="search"
            name="search"
            placeholder="Search by salon name, service, or location..."
            className="pl-10 pr-4 py-3 text-base h-12 rounded-full shadow-sm"
            aria-label="Search salons"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
         <Button type="submit" className="sr-only">Submit Search</Button>
      </form>

      {filteredSalons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSalons.map((salon) => (
            <Card key={salon.id} className="overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col">
              <div className="relative w-full h-56">
                <Image 
                  src={salon.image} 
                  alt={salon.name} 
                  fill // Use fill instead of layout="fill"
                  objectFit="cover"
                  data-ai-hint={salon.aiHint}
                />
              </div>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground">{salon.name}</CardTitle>
                <CardDescription className="flex items-center text-sm text-muted-foreground pt-1">
                  <MapPin className="h-4 w-4 mr-1.5" /> {salon.location}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex items-center mb-3">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1.5" />
                  <span className="font-medium text-foreground">{salon.rating}</span>
                  <span className="text-muted-foreground ml-1">({Math.floor(Math.random() * 100) + 50} reviews)</span>
                </div>
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-foreground mb-1.5">Popular Services:</h4>
                  <div className="flex flex-wrap gap-2">
                    {salon.services.slice(0, 3).map(service => (
                      <span key={service} className="text-xs bg-accent/20 text-primary px-2 py-1 rounded-full">{service}</span>
                    ))}
                    {salon.services.length > 3 && <span className="text-xs bg-accent/20 text-primary px-2 py-1 rounded-full">...</span>}
                  </div>
                </div>
              </CardContent>
              <div className="p-6 pt-0">
                 <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                    <Link href={`/salons/${salon.id}`}>View Details & Book</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl font-semibold text-muted-foreground">No salons found matching your search.</p>
            <p className="text-sm text-muted-foreground mt-2">Try adjusting your search terms or browse all salons.</p>
             <Button variant="link" onClick={() => setSearchQuery('')} className="mt-4">Clear Search</Button>
        </div>
      )}
    </div>
  );
}

    