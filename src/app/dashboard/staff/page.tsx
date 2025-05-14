
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
import { StaffSchema, type StaffMember } from '@/lib/schemas';
import { getStaffMembers, addStaffMember, updateStaffMember, deleteStaffMember } from '@/app/actions/staffActions';

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


export default function StaffPage() {
  const { toast } = useToast();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [currentStaffToEdit, setCurrentStaffToEdit] = useState<StaffMember | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);

  // Form state for Add/Edit Dialog
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');


  useEffect(() => {
    async function fetchStaff() {
      setIsLoading(true);
      try {
        const fetchedStaff = await getStaffMembers();
        setStaffList(fetchedStaff.map(staff => ({...staff, initials: generateInitials(staff.name)})));
      } catch (error) {
        toast({ title: "Error fetching staff", description: "Could not load staff members.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchStaff();
  }, [toast]);

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
    setAvatarUrl(staff.avatar || '');
    setIsAddEditDialogOpen(true);
  };

  const handleSaveStaff = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const staffDataInput = {
      name,
      role,
      email,
      avatar: avatarUrl || undefined,
    };
    
    // Client-side validation (optional, as server action will also validate)
    const clientValidation = currentStaffToEdit
      ? StaffSchema.safeParse({ ...staffDataInput, id: currentStaffToEdit.id, initials: generateInitials(name), aiHint: name.split(' ')[0]?.toLowerCase() || 'person' })
      : StaffSchema.omit({id: true, initials: true, aiHint: true}).safeParse(staffDataInput);

    if (!clientValidation.success) {
      const errors = clientValidation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(", ");
      toast({ title: "Validation Error", description: errors, variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    if (currentStaffToEdit) {
      const dataToUpdate: StaffMember = {
        ...currentStaffToEdit,
        ...staffDataInput,
        avatar: staffDataInput.avatar || `https://placehold.co/100x100.png?text=${generateInitials(name)}`,
        initials: generateInitials(name),
        aiHint: name.split(' ')[0]?.toLowerCase() || 'person',
      };
      const result = await updateStaffMember(dataToUpdate);
      if (result.success && result.staffMember) {
        setStaffList(prevStaff => prevStaff.map(s => s.id === result.staffMember!.id ? result.staffMember! : s));
        toast({ title: "Staff Updated", description: `"${result.staffMember.name}" has been updated.` });
      } else {
        toast({ title: "Update Failed", description: result.error || "Could not update staff member.", variant: "destructive" });
      }
    } else {
      const result = await addStaffMember(staffDataInput);
      if (result.success && result.staffMember) {
        setStaffList(prevStaff => [result.staffMember!, ...prevStaff]);
        toast({ title: "Staff Added", description: `"${result.staffMember.name}" has been added.` });
      } else {
        toast({ title: "Add Failed", description: result.error || "Could not add staff member.", variant: "destructive" });
      }
    }
    setIsLoading(false);
    setIsAddEditDialogOpen(false);
    resetForm();
  };

  const handleOpenDeleteDialog = (staff: StaffMember) => {
    setStaffToDelete(staff);
  };

  const confirmDeleteStaff = async () => {
    if (staffToDelete) {
      setIsLoading(true);
      const result = await deleteStaffMember(staffToDelete.id);
      setIsLoading(false);
      if (result.success) {
        setStaffList(staffList.filter(s => s.id !== staffToDelete.id));
        toast({ title: "Staff Deleted", description: `"${staffToDelete.name}" has been removed.`, variant: "default" });
      } else {
        toast({ title: "Delete Failed", description: result.error || "Could not delete staff member.", variant: "destructive" });
      }
      setStaffToDelete(null);
    }
  };
  
  const handleCloseDialog = () => {
    if (isLoading) return;
    setIsAddEditDialogOpen(false);
    resetForm();
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary">Manage Staff</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Add, edit, or manage your salon staff members.
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
          <Button onClick={handleOpenAddDialog} disabled={isLoading}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Staff
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading && staffList.length === 0 ? (
            <p>Loading staff members...</p>
          ) : staffList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {staffList.map((staff) => (
                <Card key={staff.id} className="flex flex-col shadow-lg rounded-lg overflow-hidden">
                  <CardHeader className="flex flex-row items-center gap-4 p-4 bg-muted/30">
                    <Avatar className="h-16 w-16 border-2 border-primary">
                      <AvatarImage src={staff.avatar} alt={staff.name} data-ai-hint={staff.aiHint || 'person'} />
                      <AvatarFallback>{staff.initials || generateInitials(staff.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg text-primary">{staff.name}</CardTitle>
                      <CardDescription className="text-muted-foreground">{staff.role}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow p-4">
                    <p className="text-sm text-muted-foreground break-all">{staff.email}</p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-end gap-2 border-t mt-auto">
                     <Button variant="ghost" size="sm" onClick={() => handleOpenEditDialog(staff)} disabled={isLoading}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleOpenDeleteDialog(staff)} disabled={isLoading}>
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
      <Dialog open={isAddEditDialogOpen} onOpenChange={(isOpen) => {
        if (isLoading) return;
        setIsAddEditDialogOpen(isOpen);
        if (!isOpen) resetForm();
       }}>
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
                <Input id="staff-avatar" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://placehold.co/100x100.png" aria-label="Staff Avatar URL"/>
                <p className="text-xs text-muted-foreground">If not provided, a placeholder will be used based on initials.</p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>{isLoading ? (currentStaffToEdit ? 'Saving...' : 'Adding...') : 'Save Staff Member'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!staffToDelete} onOpenChange={(open) => {if (isLoading) return; !open && setStaffToDelete(null)}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the staff member &quot;{staffToDelete?.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setStaffToDelete(null)} disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteStaff} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground" disabled={isLoading}>
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
