import { HeroSection } from '@/components/sections/hero-section';
import { FeaturesSection } from '@/components/sections/features-section';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <CallToActionSection />
    </>
  );
}

function CallToActionSection() {
  return (
    <section className="py-16 md:py-24 bg-secondary">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
          Ready to Transform Your Salon Experience?
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
          Join SalonFlow today and discover a new era of convenience and efficiency in salon management and booking.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/auth/signup">Get Started Now</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/salons">Explore Salons</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
