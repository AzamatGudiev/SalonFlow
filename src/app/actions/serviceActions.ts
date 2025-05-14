
'use server';

import { ServiceSchema, type Service } from '@/lib/schemas';
import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp // Optional: if you want to add timestamps
} from 'firebase/firestore';
import { z } from 'zod';

// Define the Firestore collection name
const SERVICES_COLLECTION = 'services';

export async function getServices(): Promise<Service[]> {
  if (!db) {
    console.error("Firestore database is not initialized (getServices).");
    return [];
  }
  try {
    const servicesCollectionRef = collection(db, SERVICES_COLLECTION);
    const querySnapshot = await getDocs(servicesCollectionRef);
    const services: Service[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const service = ServiceSchema.safeParse({ ...data, id: doc.id });
      if (service.success) {
        services.push(service.data);
      } else {
        console.warn("Fetched service data is invalid (getServices):", service.error.flatten().fieldErrors, "Document ID:", doc.id);
      }
    });
    return services;
  } catch (error) {
    console.error("Error fetching services from Firestore (getServices):", error);
    return []; 
  }
}

export async function addService(data: Omit<Service, 'id'>): Promise<{ success: boolean; service?: Service; error?: string }> {
  if (!db) {
    return { success: false, error: "Firestore database is not initialized (addService)." };
  }
  const validationResult = ServiceSchema.omit({id: true}).safeParse(data);
  if (!validationResult.success) {
    const errorMessages = JSON.stringify(validationResult.error.flatten().fieldErrors);
    console.error("Validation errors (addService):", errorMessages);
    return { success: false, error: "Invalid service data provided. Please check your input." };
  }

  try {
    const servicesCollectionRef = collection(db, SERVICES_COLLECTION);
    const docRef = await addDoc(servicesCollectionRef, validationResult.data);
    const newService: Service = {
      ...validationResult.data,
      id: docRef.id,
    };
    return { success: true, service: newService };
  } catch (error) {
    console.error("Error adding service to Firestore (addService):", error);
    return { success: false, error: "Failed to add service to the database. Please try again." };
  }
}

export async function updateService(data: Service): Promise<{ success: boolean; service?: Service; error?: string }> {
  if (!db) {
    return { success: false, error: "Firestore database is not initialized (updateService)." };
  }
  const validationResult = ServiceSchema.safeParse(data);
  if (!validationResult.success) {
    const errorMessages = JSON.stringify(validationResult.error.flatten().fieldErrors);
    console.error("Validation errors (updateService):", errorMessages);
    return { success: false, error: "Invalid service data provided for update. Please check your input." };
  }

  try {
    const serviceDocRef = doc(db, SERVICES_COLLECTION, data.id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...dataToUpdate } = validationResult.data;
    await updateDoc(serviceDocRef, dataToUpdate);
    return { success: true, service: validationResult.data };
  } catch (error) {
    console.error("Error updating service in Firestore (updateService):", error);
    return { success: false, error: "Failed to update service in the database. Please try again." };
  }
}

export async function deleteService(id: string): Promise<{ success: boolean; error?: string }> {
  if (!db) {
    return { success: false, error: "Firestore database is not initialized (deleteService)." };
  }
  if (!id) {
    return { success: false, error: "Service ID is required for deletion." };
  }

  try {
    const serviceDocRef = doc(db, SERVICES_COLLECTION, id);
    await deleteDoc(serviceDocRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting service from Firestore (deleteService):", error);
    return { success: false, error: "Failed to delete service from the database. Please try again." };
  }
}
