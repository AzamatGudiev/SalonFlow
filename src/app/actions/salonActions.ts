
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
  // where // We might add 'where' for getSalonByOwnerUid if needed later
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
    let q = query(salonsCollectionRef);

    // Example: if you wanted to filter by ownerUid directly in Firestore (more efficient)
    // if (ownerUid) {
    //   q = query(q, where("ownerUid", "==", ownerUid));
    // }

    const querySnapshot = await getDocs(q);
    const salons: Salon[] = [];
    querySnapshot.forEach((document) => {
      const data = document.data();
      const salon = SalonSchema.safeParse({ ...data, id: document.id });
      if (salon.success) {
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
        console.warn("Fetched salon data is invalid:", salon.error.flatten().fieldErrors, "Document ID:", document.id);
      }
    });
    return salons;
  } catch (error: any) {
    console.error("Error fetching salons from Firestore:", error);
    // Return empty array on error to prevent app crash
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
  } catch (error: any) {
    console.error("Error fetching salon by ID from Firestore:", error);
    return null;
  }
}

// Type for addSalon input to ensure ownerUid is present and id is not.
export type AddSalonInput = Omit<Salon, 'id'>;

export async function addSalon(data: AddSalonInput): Promise<{ success: boolean; salon?: Salon; error?: string }> {
  if (!db) {
    return { success: false, error: "Firestore database is not initialized (addSalon)." };
  }
  if (!data.ownerUid) {
      return { success: false, error: "Owner UID is required to add a salon." };
  }
  
  // Ensure default values for optional fields if not provided by the form
  const dataWithDefaults = {
    ...data,
    description: data.description || '',
    operatingHours: data.operatingHours || [],
    amenities: data.amenities || [],
    rating: data.rating || parseFloat(((Math.random() * 1.5) + 3.5).toFixed(1)),
    aiHint: data.aiHint || data.name.split(' ')[0]?.toLowerCase() || 'salon',
    image: data.image || `https://placehold.co/1200x800.png?text=${encodeURIComponent(data.name)}`,
  };
  
  const validationResult = SalonSchema.omit({id: true}).safeParse(dataWithDefaults);
  if (!validationResult.success) {
    const errorMessages = JSON.stringify(validationResult.error.flatten().fieldErrors);
    console.error("Validation errors (addSalon):", errorMessages);
    return { success: false, error: `Invalid data: ${errorMessages}` };
  }

  try {
    const salonsCollectionRef = collection(db, SALONS_COLLECTION);
    const docRef = await addDoc(salonsCollectionRef, validationResult.data);
    const newSalon: Salon = {
      ...validationResult.data,
      id: docRef.id,
    };
    return { success: true, salon: newSalon };
  } catch (error: any) {
    console.error("Error adding salon to Firestore:", error);
    return { success: false, error: error.message || "Failed to add salon to the database. Please try again." };
  }
}

export async function updateSalon(data: Salon): Promise<{ success: boolean; salon?: Salon; error?: string }> {
  if (!db) {
    return { success: false, error: "Firestore database is not initialized (updateSalon)." };
  }
  if (!data.ownerUid) {
      return { success: false, error: "Owner UID is missing in salon data for update." };
  }

   const dataWithDefaults = {
    ...data,
    description: data.description || '',
    operatingHours: data.operatingHours || [],
    amenities: data.amenities || [],
    aiHint: data.aiHint || data.name.split(' ')[0]?.toLowerCase() || 'salon',
    image: data.image || `https://placehold.co/1200x800.png?text=${encodeURIComponent(data.name)}`,
  };

  const validationResult = SalonSchema.safeParse(dataWithDefaults);
  if (!validationResult.success) {
    const errorMessages = JSON.stringify(validationResult.error.flatten().fieldErrors);
    console.error("Validation errors (updateSalon):", errorMessages);
    return { success: false, error: `Invalid data: ${errorMessages}` };
  }

  try {
    const salonDocRef = doc(db, SALONS_COLLECTION, data.id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...dataToUpdate } = validationResult.data; 
    await updateDoc(salonDocRef, dataToUpdate);
    return { success: true, salon: validationResult.data };
  } catch (error: any) {
    console.error("Error updating salon in Firestore:", error);
    return { success: false, error: error.message || "Failed to update salon in the database. Please try again." };
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
  } catch (error: any) {
    console.error("Error deleting salon from Firestore:", error);
    return { success: false, error: error.message || "Failed to delete salon from the database. Please try again." };
  }
}
