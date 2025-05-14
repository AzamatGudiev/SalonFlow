
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string; // URL to avatar image
  initials: string;
  aiHint?: string;
}

const initialStaffData: StaffMember[] = [
  { id: "1", name: "Alice Wonderland", role: "Stylist", email: "alice@example.com", avatar: "https://placehold.co/100x100.png", initials: "AW", aiHint: "woman portrait" },
  { id: "2", name: "Bob The Builder", role: "Barber", email: "bob@example.com", avatar: "https://placehold.co/100x100.png", initials: "BB", aiHint: "man portrait" },
  { id: "3", name: "Carol Danvers", role: "Manicurist", email: "carol@example.com", avatar: "https://placehold.co/100x100.png", initials: "CD", aiHint: "woman smiling" },
];

function generateInitials(name: string): string {
  if (!name) return '??';
  const parts = name.split(' ');
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}


export default function StaffPage() {
  const { toast } = useToast();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [currentStaffToEdit, setCurrentStaffToEdit] = useState<StaffMember | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);

  // Form state for Add/Edit Dialog
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');


  useEffect(() => {
    // Load initial data on component mount (client-side only)
    setStaffList(initialStaffData);
  }, []);

  const resetForm = () => {
    setName('');
    setRole('');
    setEmail('');
    setAvatarUrl('');
    setCurrentStaffToEdit(null);
  };

  const handleOpenAddDialog = () => {
    resetForm();
    setIsAddEditDialogOpen(true);
  };

  const handleOpenEditDialog = (staff: StaffMember) => {
    setCurrentStaffToEdit(staff);
    setName(staff.name);
    setRole(staff.role);
    setEmail(staff.email);
    setAvatarUrl(staff.avatar);
    setIsAddEditDialogOpen(true);
  };

  const handleSaveStaff = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name || !role || !email) {
      toast({ title: "Error", description: "Name, Role, and Email are required.", variant: "destructive" });
      return;
    }

    const staffData = { 
        name, 
        role, 
        email, 
        avatar: avatarUrl || `https://placehold.co/100x100.png?text=${generateInitials(name)}`, // Default placeholder if no URL
        initials: generateInitials(name),
        aiHint: name.split(' ')[0] // Simple AI hint
    };

    if (currentStaffToEdit) { // Editing existing staff
      setStaffList(staffList.map(s => s.id === currentStaffToEdit.id ? { ...currentStaffToEdit, ...staffData } : s));
      toast({ title: "Staff Updated", description: `"${name}" has been updated.` });
    } else { // Adding new staff
      const newStaff: StaffMember = {
        id: String(Date.now()), // simple unique ID for prototype
        ...staffData,
      };
      setStaffList(prevStaffList => [...prevStaffList, newStaff]);
      toast({ title: "Staff Added", description: `"${name}" has been added.` });
    }
    setIsAddEditDialogOpen(false);
    resetForm();
  };

  const handleOpenDeleteDialog = (staff: StaffMember) => {
    setStaffToDelete(staff);
  };

  const confirmDeleteStaff = () => {
    if (staffToDelete) {
      setStaffList(staffList.filter(s => s.id !== staffToDelete.id));
      toast({ title: "Staff Deleted", description: `"${staffToDelete.name}" has been removed.`, variant: "destructive" });
      setStaffToDelete(null);
    }
  };
  
  const handleCloseDialog = () => {
    setIsAddEditDialogOpen(false);
    resetForm();
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary">Manage Staff</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Add, edit, or manage your salon staff members and their schedules.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Salon Staff</CardTitle>
            <CardDescription>List of all staff members.</CardDescription>
          </div>
          <Button onClick={handleOpenAddDialog}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Staff
          </Button>
        </CardHeader>
        <CardContent>
          {staffList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {staffList.map((staff) => (
                <Card key={staff.id} className="flex flex-col shadow-lg rounded-lg overflow-hidden">
                  <CardHeader className="flex flex-row items-center gap-4 p-4 bg-muted/30">
                    <Avatar className="h-16 w-16 border-2 border-primary">
                      <AvatarImage src={staff.avatar} alt={staff.name} data-ai-hint={staff.aiHint || 'person'} />
                      <AvatarFallback>{staff.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg text-primary">{staff.name}</CardTitle>
                      <CardDescription className="text-muted-foreground">{staff.role}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow p-4">
                    <p className="text-sm text-muted-foreground break-all">{staff.email}</p>
                    {/* Placeholder for more staff details like schedule, services etc. */}
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-end gap-2 border-t mt-auto">
                     <Button variant="ghost" size="sm" onClick={() => handleOpenEditDialog(staff)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleOpenDeleteDialog(staff)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
             <div className="min-h-[200px] flex flex-col items-center justify-center bg-muted/30 rounded-md p-4">
              <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-semibold">No staff members added yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Click &quot;Add New Staff&quot; to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Staff Dialog */}
      <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSaveStaff}>
            <DialogHeader>
              <DialogTitle>{currentStaffToEdit ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
              <DialogDescription>
                {currentStaffToEdit ? 'Update the details of this staff member.' : 'Fill in the details for the new staff member.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="staff-name">Name</Label>
                <Input id="staff-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., John Doe" required aria-label="Staff Name"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-role">Role</Label>
                <Input id="staff-role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g., Stylist, Barber" required aria-label="Staff Role"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-email">Email</Label>
                <Input id="staff-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g., john.doe@example.com" required aria-label="Staff Email"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-avatar">Avatar URL (Optional)</Label>
                <Input id="staff-avatar" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://example.com/avatar.png" aria-label="Staff Avatar URL"/>
                <p className="text-xs text-muted-foreground">If not provided, a placeholder will be used.</p>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              </DialogClose>
              <Button type="submit">Save Staff Member</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!staffToDelete} onOpenChange={(open) => !open && setStaffToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the staff member &quot;{staffToDelete?.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setStaffToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteStaff} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    