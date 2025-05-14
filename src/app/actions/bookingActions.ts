
'use server';

import { BookingSchema, type Booking } from '@/lib/schemas';
import { z } from 'zod';

// Simulate a database or data store
let bookingsStore: Booking[] = [
  { id: "1", customerName: "John Doe", service: "Classic Haircut", date: "2024-08-15", time: "10:00", staff: "Alice Wonderland", notes: "Prefers minimal chat." },
  { id: "2", customerName: "Jane Smith", service: "Manicure", date: "2024-08-16", time: "14:30", staff: "Carol Danvers" },
  { id: "3", customerName: "Mike Johnson", service: "Deep Tissue Massage", date: "2024-08-18", time: "11:00", notes: "Focus on shoulder area." },
];

export async function getBookings(): Promise<Booking[]> {
  // In a real app, this would fetch from a database
  return JSON.parse(JSON.stringify(bookingsStore)); // Return a copy
}

export async function addBooking(data: Omit<Booking, 'id'>): Promise<{ success: boolean; booking?: Booking; error?: string }> {
  const validationResult = BookingSchema.omit({id: true}).safeParse(data);
  if (!validationResult.success) {
    console.error("Validation errors (addBooking):", validationResult.error.flatten().fieldErrors);
    return { success: false, error: JSON.stringify(validationResult.error.flatten().fieldErrors) };
  }

  const newBooking: Booking = {
    ...validationResult.data,
    id: String(Date.now() + Math.random()), // Simulate ID generation
  };
  bookingsStore.push(newBooking);
  return { success: true, booking: newBooking };
}

export async function updateBooking(data: Booking): Promise<{ success: boolean; booking?: Booking; error?: string }> {
  const validationResult = BookingSchema.safeParse(data);
  if (!validationResult.success) {
    console.error("Validation errors (updateBooking):", validationResult.error.flatten().fieldErrors);
    return { success: false, error: JSON.stringify(validationResult.error.flatten().fieldErrors) };
  }

  const index = bookingsStore.findIndex(b => b.id === data.id);
  if (index === -1) {
    return { success: false, error: "Booking not found" };
  }
  bookingsStore[index] = validationResult.data;
  return { success: true, booking: validationResult.data };
}

export async function deleteBooking(id: string): Promise<{ success: boolean; error?: string }> {
  const initialLength = bookingsStore.length;
  bookingsStore = bookingsStore.filter(b => b.id !== id);
  if (bookingsStore.length === initialLength) {
    return { success: false, error: "Booking not found or already deleted" };
  }
  return { success: true };
}
