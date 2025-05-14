
'use server';

import { ServiceSchema, type Service } from '@/lib/schemas';
import { z } from 'zod';

// Simulate a database or data store
let servicesStore: Service[] = [
  { id: "1", name: "Classic Haircut", duration: "45 min", price: "$50", category: "Hair" },
  { id: "2", name: "Manicure", duration: "30 min", price: "$30", category: "Nails" },
  { id: "3", name: "Deep Tissue Massage", duration: "60 min", price: "$80", category: "Spa" },
  { id: "4", name: "Bridal Makeup", duration: "90 min", price: "$120", category: "Makeup" },
];

export async function getServices(): Promise<Service[]> {
  // In a real app, this would fetch from a database
  return JSON.parse(JSON.stringify(servicesStore)); // Return a copy to avoid direct mutation
}

export async function addService(data: Omit<Service, 'id'>): Promise<{ success: boolean; service?: Service; error?: string }> {
  const validationResult = ServiceSchema.omit({id: true}).safeParse(data);
  if (!validationResult.success) {
    return { success: false, error: validationResult.error.flatten().fieldErrors.toString() };
  }

  const newService: Service = {
    ...validationResult.data,
    id: String(Date.now()), // Simulate ID generation
  };
  servicesStore.push(newService);
  return { success: true, service: newService };
}

export async function updateService(data: Service): Promise<{ success: boolean; service?: Service; error?: string }> {
  const validationResult = ServiceSchema.safeParse(data);
  if (!validationResult.success) {
    return { success: false, error: validationResult.error.flatten().fieldErrors.toString() };
  }

  const index = servicesStore.findIndex(s => s.id === data.id);
  if (index === -1) {
    return { success: false, error: "Service not found" };
  }
  servicesStore[index] = validationResult.data;
  return { success: true, service: validationResult.data };
}

export async function deleteService(id: string): Promise<{ success: boolean; error?: string }> {
  const initialLength = servicesStore.length;
  servicesStore = servicesStore.filter(s => s.id !== id);
  if (servicesStore.length === initialLength) {
    return { success: false, error: "Service not found or already deleted" };
  }
  return { success: true };
}
