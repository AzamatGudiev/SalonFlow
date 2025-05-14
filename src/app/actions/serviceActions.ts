
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
    console.error("Firestore database is not initialized.");
    return [];
  }
  try {
    const servicesCollectionRef = collection(db, SERVICES_COLLECTION);
    const querySnapshot = await getDocs(servicesCollectionRef);
    const services: Service[] = [];
    querySnapshot.forEach((doc) => {
      // Important: Ensure data matches the Service schema, including the id
      const data = doc.data();
      const service = ServiceSchema.safeParse({ ...data, id: doc.id });
      if (service.success) {
        services.push(service.data);
      } else {
        console.warn("Fetched service data is invalid:", service.error.flatten().fieldErrors, "Document ID:", doc.id);
      }
    });
    return services;
  } catch (error) {
    console.error("Error fetching services from Firestore:", error);
    // Consider how to handle this error in the UI, e.g., throw an error to be caught by an error boundary
    return []; // Or throw error;
  }
}

export async function addService(data: Omit<Service, 'id'>): Promise<{ success: boolean; service?: Service; error?: string }> {
  if (!db) {
    return { success: false, error: "Firestore database is not initialized." };
  }
  const validationResult = ServiceSchema.omit({id: true}).safeParse(data);
  if (!validationResult.success) {
    const errorMessages = JSON.stringify(validationResult.error.flatten().fieldErrors);
    console.error("Validation errors (addService):", errorMessages);
    return { success: false, error: errorMessages };
  }

  try {
    const servicesCollectionRef = collection(db, SERVICES_COLLECTION);
    // Optionally add created/updated timestamps
    // const dataWithTimestamp = { ...validationResult.data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
    const docRef = await addDoc(servicesCollectionRef, validationResult.data);
    
    // Construct the service object to return, including the Firestore-generated ID
    const newService: Service = {
      ...validationResult.data,
      id: docRef.id,
    };
    return { success: true, service: newService };
  } catch (error) {
    console.error("Error adding service to Firestore:", error);
    return { success: false, error: "Failed to add service to database." };
  }
}

export async function updateService(data: Service): Promise<{ success: boolean; service?: Service; error?: string }> {
  if (!db) {
    return { success: false, error: "Firestore database is not initialized." };
  }
  const validationResult = ServiceSchema.safeParse(data);
  if (!validationResult.success) {
    const errorMessages = JSON.stringify(validationResult.error.flatten().fieldErrors);
    console.error("Validation errors (updateService):", errorMessages);
    return { success: false, error: errorMessages };
  }

  try {
    const serviceDocRef = doc(db, SERVICES_COLLECTION, data.id);
    // Ensure you don't try to update the 'id' field itself if it's part of the data object
    const { id, ...dataToUpdate } = validationResult.data;
    // Optionally add an updated timestamp
    // const dataWithTimestamp = { ...dataToUpdate, updatedAt: serverTimestamp() };
    await updateDoc(serviceDocRef, dataToUpdate);
    return { success: true, service: validationResult.data };
  } catch (error) {
    console.error("Error updating service in Firestore:", error);
    return { success: false, error: "Failed to update service in database." };
  }
}

export async function deleteService(id: string): Promise<{ success: boolean; error?: string }> {
  if (!db) {
    return { success: false, error: "Firestore database is not initialized." };
  }
  if (!id) {
    return { success: false, error: "Service ID is required for deletion." };
  }

  try {
    const serviceDocRef = doc(db, SERVICES_COLLECTION, id);
    await deleteDoc(serviceDocRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting service from Firestore:", error);
    return { success: false, error: "Failed to delete service from database." };
  }
}
