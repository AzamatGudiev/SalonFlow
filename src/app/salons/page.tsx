import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Star } from "lucide-react";
import Image from "next/image";

const mockSalons = [
  { id: '1', name: 'Chic & Sleek Salon', location: '123 Beauty Ave, Glamour City', rating: 4.8, services: ['Haircut', 'Coloring', 'Styling'], image: 'https://placehold.co/600x400.png', aiHint: 'modern salon' },
  { id: '2', name: 'Urban Oasis Spa', location: '456 Serenity Rd, Metroville', rating: 4.5, services: ['Massage', 'Facials', 'Manicure'], image: 'https://placehold.co/600x400.png', aiHint: 'spa interior' },
  { id: '3', name: 'The Gentleman\'s Cut', location: '789 Dapper St, Suave Town', rating: 4.9, services: ['Men\'s Haircut', 'Beard Trim', 'Shave'], image: 'https://placehold.co/600x400.png', aiHint: 'barber shop' },
  { id: '4', name: 'Nail Perfection Studio', location: '101 Polish Pl, Sparkle City', rating: 4.7, services: ['Manicure', 'Pedicure', 'Nail Art'], image: 'https://placehold.co/600x400.png', aiHint: 'nail salon' },
];


export default function SalonsPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Find Your Perfect Salon</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Discover top-rated salons and spas near you. Book your next appointment with ease.
        </p>
      </header>

      <div className="mb-8 max-w-2xl mx-auto">
        <div className="relative">
          <Input
            type="search"
            placeholder="Search by salon name, service, or location..."
            className="pl-10 pr-4 py-3 text-base h-12 rounded-full shadow-sm"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
        {/* Add filter options here later, e.g., by service type, rating, price range */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockSalons.map((salon) => (
          <Card key={salon.id} className="overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col">
            <div className="relative w-full h-56">
              <Image 
                src={salon.image} 
                alt={salon.name} 
                layout="fill" 
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
                    <span key={service} className="text-xs bg-accent/20 text-accent-foreground px-2 py-1 rounded-full">{service}</span>
                  ))}
                </div>
              </div>
            </CardContent>
            <div className="p-6 pt-0">
               <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                View Details & Book
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
