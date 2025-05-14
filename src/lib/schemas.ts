
import { z } from 'zod';

// UserRole type for consistency
export const UserRoleEnum = z.enum(['customer', 'owner', 'staff']);
export type UserRole = z.infer<typeof UserRoleEnum>;

// User Schema
export const UserSchema = z.object({
  id: z.string().min(1, "ID is required."),
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email("Invalid email address."),
  role: UserRoleEnum,
  password: z.string().min(8, "Password must be at least 8 characters.").optional(), // Optional for now, will be hashed in backend
});
export type User = z.infer<typeof UserSchema>;

// Service Schema
export const ServiceSchema = z.object({
  id: z.string().min(1, "ID is required."),
  name: z.string().min(1, "Service name is required"),
  duration: z.string().min(1, "Duration is required (e.g., '45 min')"),
  price: z.string().min(1, "Price is required (e.g., '$50')"),
  category: z.string().min(1, "Category is required"),
});
export type Service = z.infer<typeof ServiceSchema>;

// Staff Schema
export const StaffSchema = z.object({
  id: z.string().min(1, "ID is required."),
  name: z.string().min(2, "Name must be at least 2 characters long."),
  role: z.string().min(2, "Role must be at least 2 characters long."),
  email: z.string().email("Invalid email address."),
  avatar: z.string().url("Invalid URL for avatar.").optional().or(z.literal('')),
  initials: z.string().min(1).max(2, "Initials should be 1 or 2 characters.").optional(),
  aiHint: z.string().optional(),
  providedServices: z.array(z.string()).optional().default([]), // Array of service names
});
export type StaffMember = z.infer<typeof StaffSchema>;


// Booking Schema
export const BookingSchema = z.object({
  id: z.string().min(1, "ID is required."),
  customerName: z.string().min(2, "Customer name must be at least 2 characters long."),
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
  name: z.string(),
  location: z.string(),
  rating: z.number(),
  services: z.array(z.string()),
  image: z.string().url(),
  aiHint: z.string(),
  description: z.string().optional(),
  operatingHours: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
});
export type Salon = z.infer<typeof SalonSchema>;
