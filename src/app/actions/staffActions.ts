
'use server';

import { StaffSchema, type StaffMember } from '@/lib/schemas';
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

const STAFF_COLLECTION = 'staff';

function generateInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length > 1 && parts[0] && parts[parts.length - 1]) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  if (parts.length > 0 && parts[0] && parts[0].length > 0) {
    return parts[0].substring(0, Math.min(2, parts[0].length)).toUpperCase();
  }
  return '??';
}

export async function getStaffMembers(): Promise<StaffMember[]> {
  if (!db) {
    console.error("Firestore database is not initialized (getStaffMembers).");
    return [];
  }
  try {
    const staffCollectionRef = collection(db, STAFF_COLLECTION);
    const querySnapshot = await getDocs(staffCollectionRef);
    const staffList: StaffMember[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const name = data.name || '';
      const staffMember = StaffSchema.safeParse({ 
        ...data, 
        id: doc.id,
        initials: data.initials || generateInitials(name),
        aiHint: data.aiHint || name.split(' ')[0]?.toLowerCase() || 'person',
        avatar: data.avatar || `https://placehold.co/100x100.png?text=${data.initials || generateInitials(name)}`,
        providedServices: data.providedServices || [], // Ensure providedServices is an array
      });
      if (staffMember.success) {
        staffList.push(staffMember.data);
      } else {
        console.warn("Fetched staff data is invalid:", staffMember.error.flatten().fieldErrors, "Document ID:", doc.id);
      }
    });
    return staffList;
  } catch (error) {
    console.error("Error fetching staff from Firestore:", error);
    return [];
  }
}

// Schema for adding staff, includes providedServices
const AddStaffSchema = StaffSchema.omit({ id: true, initials: true, aiHint: true });
export type AddStaffInput = z.infer<typeof AddStaffSchema>;

export async function addStaffMember(data: AddStaffInput): Promise<{ success: boolean; staffMember?: StaffMember; error?: string }> {
  if (!db) {
    return { success: false, error: "Firestore database is not initialized (addStaffMember)." };
  }
  
  const rawDataForValidation = {
    ...data,
    avatar: data.avatar || `https://placehold.co/100x100.png?text=${generateInitials(data.name)}`,
    providedServices: data.providedServices || [],
  };

  const validationResult = AddStaffSchema.safeParse(rawDataForValidation);
  if (!validationResult.success) {
    const errorMessages = JSON.stringify(validationResult.error.flatten().fieldErrors);
    console.error("Validation errors (addStaffMember):", errorMessages);
    return { success: false, error: errorMessages };
  }

  try {
    const staffCollectionRef = collection(db, STAFF_COLLECTION);
    const dataToSave = {
      ...validationResult.data,
      initials: generateInitials(validationResult.data.name),
      aiHint: validationResult.data.name.split(' ')[0]?.toLowerCase() || 'person',
    };
    
    const docRef = await addDoc(staffCollectionRef, dataToSave);
    const newStaffMember: StaffMember = {
      ...dataToSave,
      id: docRef.id,
    };
    return { success: true, staffMember: newStaffMember };
  } catch (error) {
    console.error("Error adding staff member to Firestore:", error);
    return { success: false, error: "Failed to add staff member to database." };
  }
}

export async function updateStaffMember(data: StaffMember): Promise<{ success: boolean; staffMember?: StaffMember; error?: string }> {
  if (!db) {
    return { success: false, error: "Firestore database is not initialized (updateStaffMember)." };
  }

  const rawDataForValidation = {
    ...data,
    initials: generateInitials(data.name),
    aiHint: data.name.split(' ')[0]?.toLowerCase() || 'person',
    avatar: data.avatar || `https://placehold.co/100x100.png?text=${generateInitials(data.name)}`,
    providedServices: data.providedServices || [],
  };
  
  const validationResult = StaffSchema.safeParse(rawDataForValidation);
  if (!validationResult.success) {
    const errorMessages = JSON.stringify(validationResult.error.flatten().fieldErrors);
    console.error("Validation errors (updateStaffMember):", errorMessages);
    return { success: false, error: errorMessages };
  }

  try {
    const staffDocRef = doc(db, STAFF_COLLECTION, data.id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...dataToUpdate } = validationResult.data; 
    await updateDoc(staffDocRef, dataToUpdate);
    return { success: true, staffMember: validationResult.data };
  } catch (error) {
    console.error("Error updating staff member in Firestore:", error);
    return { success: false, error: "Failed to update staff member in database." };
  }
}

export async function deleteStaffMember(id: string): Promise<{ success: boolean; error?: string }> {
  if (!db) {
    return { success: false, error: "Firestore database is not initialized (deleteStaffMember)." };
  }
  if (!id) {
    return { success: false, error: "Staff Member ID is required for deletion." };
  }

  try {
    const staffDocRef = doc(db, STAFF_COLLECTION, id);
    await deleteDoc(staffDocRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting staff member from Firestore:", error);
    return { success: false, error: "Failed to delete staff member from database." };
  }
}
