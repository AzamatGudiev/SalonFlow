'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus, Edit, Trash2, Wrench } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { StaffSchema, type StaffMember, type Service } from '@/lib/schemas';
import { getStaffMembers, addStaffMember, updateStaffMember, deleteStaffMember, type AddStaffInput } from '@/app/actions/staffActions';
import { getServices } from '@/app/actions/serviceActions'; // To fetch available services
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [currentStaffToEdit, setCurrentStaffToEdit] = useState<StaffMember | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);

  // Form state for Add/Edit Dialog
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);


  useEffect(() => {
    async function fetchInitialData() {
      setIsLoading(true);
      try {
        const [fetchedStaff, fetchedServices] = await Promise.all([
          getStaffMembers(),
          getServices()
        ]);
        setStaffList(fetchedStaff.map(staff => ({...staff, initials: generateInitials(staff.name), providedServices: staff.providedServices || [] })));
        setAvailableServices(fetchedServices);
      } catch (error) {
        toast({ title: "Error fetching data", description: "Could not load staff or services.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchInitialData();
  }, [toast]);

  const resetForm = () => {
    setName('');
    setRole('');
    setEmail('');
    setAvatarUrl('');
    setSelectedServices([]);
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
    setSelectedServices(staff.providedServices || []);
    setIsAddEditDialogOpen(true);
  };

  const handleServiceSelectionChange = (serviceName: string, checked: boolean) => {
    setSelectedServices(prev =>
      checked ? [...prev, serviceName] : prev.filter(s => s !== serviceName)
    );
  };

  const handleSaveStaff = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    const staffDataInput: AddStaffInput = {
      name,
      role,
      email,
      avatar: avatarUrl || undefined,
      providedServices: selectedServices,
    };
        
    if (currentStaffToEdit) {
      const dataToUpdate: StaffMember = {
        id: currentStaffToEdit.id,
        initials: generateInitials(name), // Regenerate initials in case name changed
        aiHint: name.split(' ')[0]?.toLowerCase() || 'person', // Regenerate hint
        ...staffDataInput,
        avatar: staffDataInput.avatar || `https://placehold.co/100x100.png?text=${generateInitials(name)}`,
      };
      const result = await updateStaffMember(dataToUpdate);
      if (result.success && result.staffMember) {
        setStaffList(prevStaff => prevStaff.map(s => s.id === result.staffMember!.id ? {...result.staffMember, providedServices: result.staffMember!.providedServices || []} : s));
        toast({ title: "Staff Updated", description: `"${result.staffMember.name}" has been updated.` });
      } else {
        toast({ title: "Update Failed", description: result.error || "Could not update staff member.", variant: "destructive" });
      }
    } else {
      const result = await addStaffMember(staffDataInput);
      if (result.success && result.staffMember) {
        setStaffList(prevStaff => [{...result.staffMember!, providedServices: result.staffMember!.providedServices || []}, ...prevStaff]);
        toast({ title: "Staff Added", description: `"${result.staffMember.name}" has been added.` });
      } else {
        toast({ title: "Add Failed", description: result.error || "Could not add staff member.", variant: "destructive" });
      }
    }
    setIsSubmitting(false);
    setIsAddEditDialogOpen(false);
    resetForm();
  };

  const handleOpenDeleteDialog = (staff: StaffMember) => {
    setStaffToDelete(staff);
  };

  const confirmDeleteStaff = async () => {
    if (staffToDelete) {
      setIsSubmitting(true);
      const result = await deleteStaffMember(staffToDelete.id);
      setIsSubmitting(false);
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
    if (isSubmitting) return;
    setIsAddEditDialogOpen(false);
    resetForm();
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary">Manage Staff</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Add, edit, or manage your salon staff members and their services.
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
          <Button onClick={handleOpenAddDialog} disabled={isLoading || isSubmitting}>
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
                  <CardContent className="flex-grow p-4 space-y-2">
                    <p className="text-sm text-muted-foreground break-all">{staff.email}</p>
                    {staff.providedServices && staff.providedServices.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-1">Services:</h4>
                        <div className="flex flex-wrap gap-1">
                          {staff.providedServices.map(service => (
                            <span key={service} className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-full border border-border">
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-end gap-2 border-t mt-auto">
                     <Button variant="ghost" size="sm" onClick={() => handleOpenEditDialog(staff)} disabled={isSubmitting}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleOpenDeleteDialog(staff)} disabled={isSubmitting}>
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
        if (isSubmitting) return;
        setIsAddEditDialogOpen(isOpen);
        if (!isOpen) resetForm();
       }}>
        <DialogContent className="sm:max-w-md">
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
              <div className="space-y-2">
                <Label>Provided Services</Label>
                <ScrollArea className="h-32 w-full rounded-md border p-2">
                  {availableServices.length > 0 ? availableServices.map(service => (
                    <div key={service.id} className="flex items-center space-x-2 mb-1.5">
                      <Checkbox
                        id={`service-${service.id}`}
                        checked={selectedServices.includes(service.name)}
                        onCheckedChange={(checked) => handleServiceSelectionChange(service.name, !!checked)}
                      />
                      <Label htmlFor={`service-${service.id}`} className="text-sm font-normal">
                        {service.name}
                      </Label>
                    </div>
                  )) : <p className="text-xs text-muted-foreground">No services available. Add services first.</p>}
                </ScrollArea>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting || (availableServices.length === 0 && !currentStaffToEdit?.providedServices?.length )}>{isSubmitting ? (currentStaffToEdit ? 'Saving...' : 'Adding...') : 'Save Staff Member'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!staffToDelete} onOpenChange={(open) => {if (isSubmitting) return; !open && setStaffToDelete(null)}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the staff member &quot;{staffToDelete?.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setStaffToDelete(null)} disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteStaff} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground" disabled={isSubmitting}>
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}