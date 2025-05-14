
import { z } from 'zod';

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
  avatar: z.string().url("Invalid URL for avatar.").optional().or(z.literal('')), // Optional, can be empty string
  initials: z.string().min(1).max(2, "Initials should be 1 or 2 characters.").optional(), // Will be auto-generated if not provided
  aiHint: z.string().optional(),
});
export type StaffMember = z.infer<typeof StaffSchema>;


// Booking Schema
export const BookingSchema = z.object({
  id: z.string().min(1, "ID is required."),
  customerName: z.string().min(2, "Customer name must be at least 2 characters long."),
  service: z.string().min(1, "Service selection is required."),
  date: z.string().min(1, "Date is required."), // Should be ISO date string e.g. "2024-12-31"
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)."), // HH:MM format
  staff: z.string().optional(),
  notes: z.string().max(500, "Notes cannot exceed 500 characters.").optional(),
});
export type Booking = z.infer<typeof BookingSchema>;


// Placeholder for User Schema (related to authentication)
// export const UserSchema = z.object({...});
// export type User = z.infer<typeof UserSchema>;
