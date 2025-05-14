
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusCircle, Edit, Trash2, Info, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ServiceSchema, type Service, type Salon } from '@/lib/schemas';
import { getServices, addService, updateService, deleteService } from '@/app/actions/serviceActions';
import { getSalonById } from '@/app/actions/salonActions'; 
import { useAuth } from "@/hooks/use-auth"; 

const OWNER_SALON_ID_KEY_PREFIX = 'owner_salon_id_';

export default function ServicesPage() {
  const { toast } = useToast();
  const { user, role } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [currentServiceToEdit, setCurrentServiceToEdit] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [duration, setDurationState] = useState('');
  const [price, setPriceState] = useState('');
  
  const [salonServiceCategories, setSalonServiceCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [ownerSalonId, setOwnerSalonId] = useState<string | null>(null);

  const getOwnerSalonIdKey = () => user ? `${OWNER_SALON_ID_KEY_PREFIX}${user.firebaseUid}` : null;

  useEffect(() => {
    async function fetchPageData() {
      setIsLoading(true);
      setIsLoadingCategories(true);
      
      let currentOwnerSalonId: string | null = null;
      if (role === 'owner' && user) {
        const key = getOwnerSalonIdKey();
        currentOwnerSalonId = key ? localStorage.getItem(key) : null;
        setOwnerSalonId(currentOwnerSalonId);
      }

      try {
        const fetchedServices = await getServices();
        setServices(fetchedServices);

        if (role === 'owner' && currentOwnerSalonId) {
          const salon = await getSalonById(currentOwnerSalonId);
          if (salon && salon.services) {
            setSalonServiceCategories(salon.services);
          } else {
            setSalonServiceCategories([]);
            if (!salon) {
                toast({ title: "Salon Not Found", description: "Your salon details could not be found. Please set up your salon in 'My Salon'.", variant: "destructive", duration: 7000 });
            } else {
                toast({ title: "Salon Categories Not Found", description: "Please set up your service categories in 'My Salon' first.", variant: "default", duration: 7000 });
            }
          }
        } else if (role === 'owner' && !currentOwnerSalonId) {
          setSalonServiceCategories([]);
          toast({ title: "No Salon Configured", description: "Please create your salon in 'My Salon' to define service categories.", variant: "default", duration: 7000 });
        }
      } catch (error) {
        console.error("Error fetching page data (ServicesPage):", error);
        toast({ title: "Error fetching data", description: "Could not load services or salon categories. Please try again.", variant: "destructive" });
      } finally {
        setIsLoading(false);
        setIsLoadingCategories(false);
      }
    }
    if (user || !role) { // Only fetch if user is loaded or role is not yet determined (to avoid fetching if not owner)
        fetchPageData();
    } else if (!user && !isLoading) { // If user is definitely not logged in and auth loading is done
        setIsLoading(false);
        setIsLoadingCategories(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast, role, user]);

  const resetForm = () => {
    setName(''); setSelectedCategory(''); setDurationState(''); setPriceState('');
    setCurrentServiceToEdit(null);
  };

  const handleOpenAddDialog = () => {
    if (role === 'owner' && (!ownerSalonId || salonServiceCategories.length === 0)) {
      toast({ title: "Setup Required", description: "Please ensure your salon is set up and has service categories defined in 'My Salon' before adding specific services.", variant: "destructive" });
      return;
    }
    resetForm();
    setIsAddEditDialogOpen(true);
  };

  const handleOpenEditDialog = (service: Service) => {
    setCurrentServiceToEdit(service);
    setName(service.name); setSelectedCategory(service.category);
    setDurationState(service.duration); setPriceState(service.price);
    setIsAddEditDialogOpen(true);
  };

  const handleSaveService = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    const formData = { name, category: selectedCategory, duration, price };

    let result;
    if (currentServiceToEdit) {
      const dataToUpdate = { ...formData, id: currentServiceToEdit.id };
      const validationResult = ServiceSchema.safeParse(dataToUpdate);
      if (!validationResult.success) {
        const errors = JSON.stringify(validationResult.error.flatten().fieldErrors);
        toast({ title: "Validation Error", description: `Invalid data: ${errors}`, variant: "destructive" });
        setIsSubmitting(false); return;
      }
      result = await updateService(validationResult.data);
    } else {
      const validationResult = ServiceSchema.omit({id: true}).safeParse(formData);
      if (!validationResult.success) {
         const errors = JSON.stringify(validationResult.error.flatten().fieldErrors);
        toast({ title: "Validation Error", description: `Invalid data: ${errors}`, variant: "destructive" });
        setIsSubmitting(false); return;
      }
      result = await addService(validationResult.data);
    }
    
    if (result.success && result.service) {
      toast({ title: currentServiceToEdit ? "Service Updated" : "Service Added", description: `"${result.service.name}" has been saved.` });
      if (currentServiceToEdit) {
        setServices(prevServices => prevServices.map(s => s.id === result.service!.id ? result.service! : s));
      } else {
        setServices(prevServices => [result.service!, ...prevServices]);
      }
      setIsAddEditDialogOpen(false);
      resetForm();
    } else {
      toast({ title: currentServiceToEdit ? "Update Failed" : "Add Failed", description: result.error || "An unexpected error occurred.", variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const handleOpenDeleteDialog = (service: Service) => { setServiceToDelete(service); };

  const confirmDeleteService = async () => {
    if (serviceToDelete) {
      setIsSubmitting(true);
      const result = await deleteService(serviceToDelete.id);
      if (result.success) {
        setServices(services.filter(s => s.id !== serviceToDelete.id));
        toast({ title: "Service Deleted", description: `"${serviceToDelete.name}" has been deleted.`});
      } else {
        toast({ title: "Delete Failed", description: result.error || "Could not delete service.", variant: "destructive" });
      }
      setIsSubmitting(false);
      setServiceToDelete(null);
    }
  };

  const handleCloseDialog = () => { if(!isSubmitting) { setIsAddEditDialogOpen(false); resetForm(); } }

  if (isLoading && !user && role !== 'owner' && role !== 'staff') { // Initial loading or user not an owner/staff
    return <div className="container mx-auto p-6">Loading or access denied...</div>;
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary">Manage Specific Services</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Add, edit, or remove your salon&apos;s specific service offerings.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard"> <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard </Link>
        </Button>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Specific Salon Services</CardTitle>
            <CardDescription>List of all specific services offered, categorized by your salon&apos;s service types.</CardDescription>
          </div>
          {(role === 'owner' || role === 'staff') && (
            <Button onClick={handleOpenAddDialog} disabled={isLoading || isLoadingCategories || isSubmitting || (role ==='owner' && (!ownerSalonId || salonServiceCategories.length === 0))}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Service
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading && services.length === 0 && <p>Loading services...</p>}
          {!isLoading && services.length > 0 && (
            <Table>
              <TableCaption>A list of your salon&apos;s specific services.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead><TableHead>Category</TableHead>
                  <TableHead>Duration</TableHead><TableHead>Price</TableHead>
                  {(role === 'owner' || role === 'staff') && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{service.category}</TableCell>
                    <TableCell>{service.duration}</TableCell>
                    <TableCell>{service.price}</TableCell>
                    {(role === 'owner' || role === 'staff') && (
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" aria-label="Edit Service" onClick={() => handleOpenEditDialog(service)} disabled={isSubmitting}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Delete Service" className="text-destructive hover:text-destructive" onClick={() => handleOpenDeleteDialog(service)} disabled={isSubmitting}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!isLoading && services.length === 0 && (
            <div className="min-h-[200px] flex flex-col items-center justify-center bg-muted/30 rounded-md mt-4 text-center">
              <Info className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold text-muted-foreground">No specific services added yet.</p>
              {role === 'owner' && !ownerSalonId && !isLoadingCategories && (
                <p className="text-sm text-muted-foreground mt-2">Ensure your salon is set up in 'My Salon'.</p>
              )}
              {role === 'owner' && ownerSalonId && salonServiceCategories.length === 0 && !isLoadingCategories && (
                <p className="text-sm text-muted-foreground mt-2">
                  Define service categories in <Link href="/dashboard/my-salon" className="text-primary underline">My Salon</Link> first.
                </p>
              )}
              {(role === 'owner' || role === 'staff') && salonServiceCategories.length > 0 && (
                 <p className="text-sm text-muted-foreground mt-2">Click &quot;Add New Service&quot; to get started.</p>
               )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddEditDialogOpen} onOpenChange={(isOpen) => { if (isSubmitting) return; setIsAddEditDialogOpen(isOpen); if (!isOpen) resetForm(); }}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveService}>
            <DialogHeader>
              <DialogTitle>{currentServiceToEdit ? 'Edit Service' : 'Add New Service'}</DialogTitle>
              <DialogDescription>
                {currentServiceToEdit ? 'Update the details of this specific service.' : 'Fill in the details for the new specific service.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="service-name">Specific Service Name</Label>
                <Input id="service-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Deluxe Wash & Cut" aria-label="Specific Service Name" required/>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="service-category-select">Service Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={isLoadingCategories || salonServiceCategories.length === 0}>
                  <SelectTrigger id="service-category-select" aria-label="Service Category">
                    <SelectValue placeholder={ isLoadingCategories ? "Loading categories..." : salonServiceCategories.length === 0 ? "No categories defined in My Salon" : "Select a category" } />
                  </SelectTrigger>
                  <SelectContent>
                    {salonServiceCategories.map((category) => ( <SelectItem key={category} value={category}> {category} </SelectItem> ))}
                  </SelectContent>
                </Select>
                {role==='owner' && salonServiceCategories.length === 0 && !isLoadingCategories && (
                     <p className="text-xs text-muted-foreground"> Define service categories in <Link href="/dashboard/my-salon" className="text-primary underline">My Salon</Link> first. </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="service-duration">Duration</Label>
                <Input id="service-duration" value={duration} onChange={(e) => setDurationState(e.target.value)} placeholder="e.g., 1 hour, 45 mins" aria-label="Service Duration" required/>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="service-price">Price</Label>
                <Input id="service-price" value={price} onChange={(e) => setPriceState(e.target.value)} placeholder="e.g., $75, £50" aria-label="Service Price" required/>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting || isLoadingCategories || salonServiceCategories.length === 0 || !selectedCategory}>
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
                {isSubmitting ? (currentServiceToEdit ? 'Saving...' : 'Adding...') : 'Save Service'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!serviceToDelete} onOpenChange={(open) => { if (isSubmitting) return; !open && setServiceToDelete(null)}}>
        <AlertDialogContent>
          <AlertDialogHeader> <AlertDialogTitle>Are you sure?</AlertDialogTitle> <AlertDialogDescription> This action cannot be undone. This will permanently delete the service &quot;{serviceToDelete?.name}&quot;. </AlertDialogDescription> </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setServiceToDelete(null)} disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteService} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
