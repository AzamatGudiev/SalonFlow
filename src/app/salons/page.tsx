
'use client';

import { useState, useEffect, type FormEvent, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Star, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import type { Salon } from '@/lib/schemas'; // Using the Salon type from schemas
import { getSalons } from '@/app/actions/salonActions';
import { Skeleton } from "@/components/ui/skeleton";

export default function SalonsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedSalons, setDisplayedSalons] = useState<Salon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, startSearchTransition] = useTransition();

  const fetchAndSetSalons = async (query?: string) => {
    setIsLoading(true);
    try {
      const salons = await getSalons(query);
      setDisplayedSalons(salons);
      if (query && salons.length === 0) {
        toast({
            title: "No Results",
            description: `No salons found matching "${query}". Try a different search.`,
        });
      }
    } catch (error) {
      toast({ title: "Error", description: "Could not fetch salons.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAndSetSalons(); // Initial fetch
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startSearchTransition(() => {
      fetchAndSetSalons(searchQuery);
    });
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
            disabled={isSearching}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
         <Button type="submit" className="sr-only" disabled={isSearching}>
            {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit Search
         </Button>
      </form>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden flex flex-col">
              <Skeleton className="w-full h-56" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="flex-grow">
                <Skeleton className="h-5 w-1/4 mb-3" />
                <Skeleton className="h-4 w-full mb-1.5" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <div className="p-6 pt-0">
                <Skeleton className="h-10 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : displayedSalons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedSalons.map((salon) => (
            <Card key={salon.id} className="overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col">
              <div className="relative w-full h-56">
                <Image 
                  src={salon.image} 
                  alt={salon.name} 
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                      <span key={service} className="text-xs bg-primary/10 text-primary/80 px-2 py-1 rounded-full border border-primary/20">{service}</span>
                    ))}
                    {salon.services.length > 3 && <span className="text-xs bg-primary/10 text-primary/80 px-2 py-1 rounded-full border border-primary/20">...</span>}
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
            <p className="text-xl font-semibold text-muted-foreground">No salons found.</p>
            {searchQuery && <p className="text-sm text-muted-foreground mt-2">Try adjusting your search terms for &quot;{searchQuery}&quot; or clear the search.</p>}
            <Button variant="link" onClick={() => { setSearchQuery(''); fetchAndSetSalons(); }} className="mt-4">Clear Search</Button>
        </div>
      )}
    </div>
  );
}
