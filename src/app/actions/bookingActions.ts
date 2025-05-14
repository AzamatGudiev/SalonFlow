
'use server';

import { BookingSchema, type Booking } from '@/lib/schemas';
import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { z } from 'zod';

const BOOKINGS_COLLECTION = 'bookings';

export async function getBookings(filters?: { salonId?: string; customerEmail?: string }): Promise<Booking[]> {
  if (!db) {
    console.error("Firestore database is not initialized (getBookings).");
    return [];
  }
  try {
    let bookingsQuery = query(collection(db, BOOKINGS_COLLECTION));

    if (filters?.salonId) {
      bookingsQuery = query(bookingsQuery, where("salonId", "==", filters.salonId));
    }
    if (filters?.customerEmail) {
      bookingsQuery = query(bookingsQuery, where("customerEmail", "==", filters.customerEmail));
    }
    // Add orderBy date if needed, e.g., orderBy("date", "desc")

    const querySnapshot = await getDocs(bookingsQuery);
    const bookings: Booking[] = [];
    querySnapshot.forEach((document) => {
      const data = document.data();
      const booking = BookingSchema.safeParse({ ...data, id: document.id });
      if (booking.success) {
        bookings.push(booking.data);
      } else {
        console.warn("Fetched booking data is invalid:", booking.error.flatten().fieldErrors, "Document ID:", document.id);
      }
    });
    return bookings;
  } catch (error) {
    console.error("Error fetching bookings from Firestore:", error);
    // In a real app, you might want to throw the error or return an error object
    return [];
  }
}

export async function addBooking(data: Omit<Booking, 'id'>): Promise<{ success: boolean; booking?: Booking; error?: string }> {
  if (!db) {
    return { success: false, error: "Firestore database is not initialized (addBooking)." };
  }
  const validationResult = BookingSchema.omit({id: true}).safeParse(data);
  if (!validationResult.success) {
    const errorMessages = JSON.stringify(validationResult.error.flatten().fieldErrors);
    console.error("Validation errors (addBooking):", errorMessages);
    return { success: false, error: `Invalid data: ${errorMessages}` };
  }

  try {
    const bookingsCollectionRef = collection(db, BOOKINGS_COLLECTION);
    const docRef = await addDoc(bookingsCollectionRef, validationResult.data);
    const newBooking: Booking = {
      ...validationResult.data,
      id: docRef.id,
    };
    return { success: true, booking: newBooking };
  } catch (error) {
    console.error("Error adding booking to Firestore:", error);
    return { success: false, error: "Failed to add booking to the database. Please try again." };
  }
}

export async function updateBooking(data: Booking): Promise<{ success: boolean; booking?: Booking; error?: string }> {
  if (!db) {
    return { success: false, error: "Firestore database is not initialized (updateBooking)." };
  }
  const validationResult = BookingSchema.safeParse(data);
  if (!validationResult.success) {
    const errorMessages = JSON.stringify(validationResult.error.flatten().fieldErrors);
    console.error("Validation errors (updateBooking):", errorMessages);
    return { success: false, error: `Invalid data: ${errorMessages}` };
  }

  try {
    const bookingDocRef = doc(db, BOOKINGS_COLLECTION, data.id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...dataToUpdate } = validationResult.data;
    await updateDoc(bookingDocRef, dataToUpdate);
    return { success: true, booking: validationResult.data };
  } catch (error) {
    console.error("Error updating booking in Firestore:", error);
    return { success: false, error: "Failed to update booking in the database. Please try again." };
  }
}

export async function deleteBooking(id: string): Promise<{ success: boolean; error?: string }> {
  if (!db) {
    return { success: false, error: "Firestore database is not initialized (deleteBooking)." };
  }
   if (!id) {
    return { success: false, error: "Booking ID is required for deletion." };
  }

  try {
    const bookingDocRef = doc(db, BOOKINGS_COLLECTION, id);
    await deleteDoc(bookingDocRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting booking from Firestore:", error);
    return { success: false, error: "Failed to delete booking from the database. Please try again." };
  }
}
