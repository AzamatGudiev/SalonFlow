
'use server';

import { SalonSchema, type Salon } from '@/lib/schemas';
import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  getDoc,
  updateDoc, 
  deleteDoc,
  query,
  where,
  Timestamp // For potential future use with timestamps
} from 'firebase/firestore';
import { z } from 'zod';

const SALONS_COLLECTION = 'salons';

export async function getSalons(searchQuery?: string): Promise<Salon[]> {
  if (!db) {
    console.error("Firestore database is not initialized (getSalons).");
    return [];
  }
  try {
    const salonsCollectionRef = collection(db, SALONS_COLLECTION);
    let q = query(salonsCollectionRef); // Base query

    // Basic search: if a searchQuery is provided, try to filter by name.
    // For more complex search, you'd need more sophisticated querying or a search service.
    // Firestore native search capabilities are limited for partial string matches.
    // This example will fetch all and filter client-side if not using specific query.
    // Or, we can implement a very basic "startsWith" if desired.
    // For now, let's assume searchQuery might be used for exact name or we filter client-side later.

    const querySnapshot = await getDocs(q);
    const salons: Salon[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const salon = SalonSchema.safeParse({ ...data, id: doc.id });
      if (salon.success) {
        // If there's a search query, apply client-side filtering as a fallback for complex matches
        if (searchQuery) {
          const lowerQuery = searchQuery.toLowerCase();
          if (
            salon.data.name.toLowerCase().includes(lowerQuery) ||
            salon.data.location.toLowerCase().includes(lowerQuery) ||
            salon.data.services.some(s => s.toLowerCase().includes(lowerQuery))
          ) {
            salons.push(salon.data);
          }
        } else {
          salons.push(salon.data);
        }
      } else {
        console.warn("Fetched salon data is invalid:", salon.error.flatten().fieldErrors, "Document ID:", doc.id);
      }
    });
    return salons;
  } catch (error) {
    console.error("Error fetching salons from Firestore:", error);
    return [];
  }
}

export async function getSalonById(id: string): Promise<Salon | null> {
  if (!db) {
    console.error("Firestore database is not initialized (getSalonById).");
    return null;
  }
  if (!id) {
    console.error("Salon ID is required (getSalonById).");
    return null;
  }
  try {
    const salonDocRef = doc(db, SALONS_COLLECTION, id);
    const docSnap = await getDoc(salonDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const salon = SalonSchema.safeParse({ ...data, id: docSnap.id });
      if (salon.success) {
        return salon.data;
      } else {
        console.warn("Fetched salon data is invalid:", salon.error.flatten().fieldErrors, "Document ID:", docSnap.id);
        return null;
      }
    } else {
      console.log("No such salon document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching salon by ID from Firestore:", error);
    return null;
  }
}

export async function addSalon(data: Omit<Salon, 'id'>): Promise<{ success: boolean; salon?: Salon; error?: string }> {
  if (!db) {
    return { success: false, error: "Firestore database is not initialized (addSalon)." };
  }
  
  // Ensure default values for optional fields if not provided, matching schema expectations
  const dataWithDefaults = {
    ...data,
    description: data.description || '',
    operatingHours: data.operatingHours || [],
    amenities: data.amenities || [],
    rating: data.rating || 0, // Default rating
    aiHint: data.aiHint || data.name.split(' ')[0]?.toLowerCase() || 'salon', // Default aiHint
    image: data.image || `https://placehold.co/1200x800.png?text=${encodeURIComponent(data.name)}`,
  };
  
  const validationResult = SalonSchema.omit({id: true}).safeParse(dataWithDefaults);
  if (!validationResult.success) {
    const errorMessages = JSON.stringify(validationResult.error.flatten().fieldErrors);
    console.error("Validation errors (addSalon):", errorMessages);
    return { success: false, error: errorMessages };
  }

  try {
    const salonsCollectionRef = collection(db, SALONS_COLLECTION);
    const docRef = await addDoc(salonsCollectionRef, validationResult.data);
    const newSalon: Salon = {
      ...validationResult.data,
      id: docRef.id,
    };
    return { success: true, salon: newSalon };
  } catch (error) {
    console.error("Error adding salon to Firestore:", error);
    return { success: false, error: "Failed to add salon to database." };
  }
}

export async function updateSalon(data: Salon): Promise<{ success: boolean; salon?: Salon; error?: string }> {
  if (!db) {
    return { success: false, error: "Firestore database is not initialized (updateSalon)." };
  }
  const validationResult = SalonSchema.safeParse(data);
  if (!validationResult.success) {
    const errorMessages = JSON.stringify(validationResult.error.flatten().fieldErrors);
    console.error("Validation errors (updateSalon):", errorMessages);
    return { success: false, error: errorMessages };
  }

  try {
    const salonDocRef = doc(db, SALONS_COLLECTION, data.id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...dataToUpdate } = validationResult.data;
    await updateDoc(salonDocRef, dataToUpdate);
    return { success: true, salon: validationResult.data };
  } catch (error) {
    console.error("Error updating salon in Firestore:", error);
    return { success: false, error: "Failed to update salon in database." };
  }
}

export async function deleteSalon(id: string): Promise<{ success: boolean; error?: string }> {
  if (!db) {
    return { success: false, error: "Firestore database is not initialized (deleteSalon)." };
  }
   if (!id) {
    return { success: false, error: "Salon ID is required for deletion." };
  }

  try {
    const salonDocRef = doc(db, SALONS_COLLECTION, id);
    await deleteDoc(salonDocRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting salon from Firestore:", error);
    return { success: false, error: "Failed to delete salon from database." };
  }
}
