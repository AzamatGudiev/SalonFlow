
'use server';

import { SalonSchema, type Salon } from '@/lib/schemas';
import { z } from 'zod';

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

// Validate the mock data against the schema (development check)
try {
  z.array(SalonSchema).parse(allMockSalons);
} catch (e) {
  console.error("Mock salon data is invalid:", e);
}


export async function getSalons(query?: string): Promise<Salon[]> {
  // In a real app, this would fetch from a database
  // For now, return a copy of the mock data, optionally filtered
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay

  if (query) {
    const lowerCaseQuery = query.toLowerCase();
    return JSON.parse(JSON.stringify(allMockSalons.filter(salon =>
      salon.name.toLowerCase().includes(lowerCaseQuery) ||
      salon.location.toLowerCase().includes(lowerCaseQuery) ||
      salon.services.some(service => service.toLowerCase().includes(lowerCaseQuery))
    )));
  }
  return JSON.parse(JSON.stringify(allMockSalons)); // Return a copy
}

export async function getSalonById(id: string): Promise<Salon | null> {
  // In a real app, this would fetch from a database
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
  const salon = allMockSalons.find(s => s.id === id);
  return salon ? JSON.parse(JSON.stringify(salon)) : null;
}
