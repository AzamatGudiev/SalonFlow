import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative bg-secondary py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
              Effortless Salon Bookings,
              <span className="block text-primary">Elevated Experiences.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto md:mx-0">
              Discover, book, and manage your salon appointments with SalonFlow. Owners, streamline your operations and delight your clients.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button size="lg" asChild>
                <Link href="/salons">
                  Find Your Salon <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/signup?role=owner">List Your Salon</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-64 md:h-96 lg:h-[500px] rounded-lg overflow-hidden shadow-2xl">
            <Image
              src="https://placehold.co/1200x800.png"
              alt="Modern salon interior"
              layout="fill"
              objectFit="cover"
              className="transform transition-all duration-500 hover:scale-105"
              data-ai-hint="salon interior"
              priority
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
