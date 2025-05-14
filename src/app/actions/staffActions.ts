
'use server';

import { StaffSchema, type StaffMember } from '@/lib/schemas';
import { z } from 'zod';

// Simulate a database or data store
let staffStore: StaffMember[] = [
  { id: "1", name: "Alice Wonderland", role: "Stylist", email: "alice@example.com", avatar: "https://placehold.co/100x100.png", initials: "AW", aiHint: "woman portrait" },
  { id: "2", name: "Bob The Builder", role: "Barber", email: "bob@example.com", avatar: "https://placehold.co/100x100.png", initials: "BB", aiHint: "man portrait" },
  { id: "3", name: "Carol Danvers", role: "Manicurist", email: "carol@example.com", avatar: "https://placehold.co/100x100.png", initials: "CD", aiHint: "woman smiling" },
];

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
  return JSON.parse(JSON.stringify(staffStore)); // Return a copy
}

export async function addStaffMember(data: Omit<StaffMember, 'id' | 'initials' | 'aiHint'> & { avatar?: string }): Promise<{ success: boolean; staffMember?: StaffMember; error?: string }> {
  const rawData = {
    ...data,
    initials: generateInitials(data.name),
    aiHint: data.name.split(' ')[0]?.toLowerCase() || 'person',
    avatar: data.avatar || `https://placehold.co/100x100.png?text=${generateInitials(data.name)}`,
  };
  
  const validationResult = StaffSchema.omit({id: true}).safeParse(rawData);
  if (!validationResult.success) {
    console.error("Validation errors:", validationResult.error.flatten().fieldErrors);
    return { success: false, error: JSON.stringify(validationResult.error.flatten().fieldErrors) };
  }

  const newStaffMember: StaffMember = {
    ...validationResult.data,
    id: String(Date.now() + Math.random()), // Simulate ID generation
  };
  staffStore.push(newStaffMember);
  return { success: true, staffMember: newStaffMember };
}

export async function updateStaffMember(data: StaffMember): Promise<{ success: boolean; staffMember?: StaffMember; error?: string }> {
   const rawData = {
    ...data,
    initials: generateInitials(data.name),
    aiHint: data.name.split(' ')[0]?.toLowerCase() || 'person',
    avatar: data.avatar || `https://placehold.co/100x100.png?text=${generateInitials(data.name)}`,
  };

  const validationResult = StaffSchema.safeParse(rawData);
  if (!validationResult.success) {
    console.error("Validation errors:", validationResult.error.flatten().fieldErrors);
    return { success: false, error: JSON.stringify(validationResult.error.flatten().fieldErrors) };
  }

  const index = staffStore.findIndex(s => s.id === data.id);
  if (index === -1) {
    return { success: false, error: "Staff member not found" };
  }
  staffStore[index] = validationResult.data;
  return { success: true, staffMember: validationResult.data };
}

export async function deleteStaffMember(id: string): Promise<{ success: boolean; error?: string }> {
  const initialLength = staffStore.length;
  staffStore = staffStore.filter(s => s.id !== id);
  if (staffStore.length === initialLength) {
    return { success: false, error: "Staff member not found or already deleted" };
  }
  return { success: true };
}
