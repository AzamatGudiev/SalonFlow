import { FeatureCard } from '@/components/shared/feature-card';
import { CalendarDays, ListChecks, Lightbulb, MailCheck } from 'lucide-react';

const features = [
  {
    icon: CalendarDays,
    title: 'Appointment Scheduling',
    description: 'Easily find and book available time slots that fit your schedule. View staff availability and choose your preferred stylist.',
  },
  {
    icon: ListChecks,
    title: 'Service & Schedule Management',
    description: 'Salon owners can define service offerings, set prices, and manage staff schedules with our intuitive dashboard.',
  },
  {
    icon: Lightbulb,
    title: 'Smart Service Recommendation',
    description: 'Get personalized service suggestions based on your booking history and preferences, powered by AI.',
  },
  {
    icon: MailCheck,
    title: 'Automated Reminders',
    description: 'Receive timely email reminders for your upcoming appointments, ensuring you never miss a session.',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Why Choose <span className="text-primary">SalonFlow</span>?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            We provide a seamless experience for both clients and salon owners, making beauty and wellness accessible to everyone.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
