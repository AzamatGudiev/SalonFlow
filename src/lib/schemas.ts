
import { z } from 'zod';

// UserRole type for consistency
export const UserRoleEnum = z.enum(['customer', 'owner', 'staff']);
export type UserRole = z.infer<typeof UserRoleEnum>;

// UserProfile Schema (for Firestore 'users' collection)
// This stores additional user information not directly in Firebase Auth.
export const UserProfileSchema = z.object({
  uid: z.string().min(1, "UID is required."), // Firebase Auth User ID
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email("Invalid email address."), // Should match Firebase Auth email
  role: UserRoleEnum,
});
export type UserProfile = z.infer<typeof UserProfileSchema>;


// Service Schema
export const ServiceSchema = z.object({
  id: z.string().min(1, "ID is required."),
  name: z.string().min(1, "Service name is required"),
  duration: z.string().min(1, "Duration is required (e.g., '45 min')"),
  price: z.string().min(1, "Price is required (e.g., '$50')"),
  category: z.string().min(1, "Category is required"), // This is a category name defined by the salon
});
export type Service = z.infer<typeof ServiceSchema>;

// Staff Schema
export const StaffSchema = z.object({
  id: z.string().min(1, "ID is required."),
  salonId: z.string().min(1, "Salon ID is required for staff."),
  name: z.string().min(2, "Name must be at least 2 characters long."),
  role: z.string().min(2, "Role must be at least 2 characters long."), // Staff member's role in salon, e.g., "Stylist"
  email: z.string().email("Invalid email address."),
  avatar: z.string().url("Invalid URL for avatar.").optional().or(z.literal('')),
  initials: z.string().min(1).max(2, "Initials should be 1 or 2 characters.").optional(),
  aiHint: z.string().optional(),
  providedServices: z.array(z.string()).optional().default([]), // Array of specific service names
});
export type StaffMember = z.infer<typeof StaffSchema>;


// Booking Schema
export const BookingSchema = z.object({
  id: z.string().min(1, "ID is required."),
  salonId: z.string().min(1, "Salon ID for the booking is required."),
  customerName: z.string().min(2, "Customer name must be at least 2 characters long."),
  customerEmail: z.string().email("Invalid customer email address.").optional(), // Email of the customer who booked
  service: z.string().min(1, "Service selection is required."), // This will be service name
  date: z.string().min(1, "Date is required."),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)."),
  staff: z.string().optional(), // This will be staff member's name
  notes: z.string().max(500, "Notes cannot exceed 500 characters.").optional(),
});
export type Booking = z.infer<typeof BookingSchema>;

// Salon Schema (for salonActions.ts)
export const SalonSchema = z.object({
  id: z.string(),
  ownerUid: z.string().optional(), // Firebase Auth UID of the owner
  name: z.string().min(1, "Salon name is required."),
  location: z.string().min(1, "Salon location is required."),
  rating: z.number().min(0).max(5).optional().default(0),
  services: z.array(z.string()).min(1, "At least one service category is required."), // These are service categories
  image: z.string().url("Invalid image URL.").optional().or(z.literal('')),
  aiHint: z.string().optional(),
  description: z.string().optional(),
  operatingHours: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
});
export type Salon = z.infer<typeof SalonSchema>;
