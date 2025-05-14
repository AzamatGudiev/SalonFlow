
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusCircle, Edit, Trash2 } from "lucide-react";
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
import { ServiceSchema, type Service } from '@/lib/schemas';
import { getServices, addService, updateService, deleteService } from '@/app/actions/serviceActions';

export default function ServicesPage() {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [currentServiceToEdit, setCurrentServiceToEdit] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  // Form state for Add/Edit Dialog
  const [name, setName] = useState('');
  const [category, setCategoryState] = useState('');
  const [duration, setDurationState] = useState('');
  const [price, setPriceState] = useState('');

  useEffect(() => {
    async function fetchServices() {
      setIsLoading(true);
      try {
        const fetchedServices = await getServices();
        setServices(fetchedServices);
      } catch (error) {
        toast({ title: "Error fetching services", description: "Could not load services.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchServices();
  }, [toast]);

  const resetForm = () => {
    setName('');
    setCategoryState('');
    setDurationState('');
    setPriceState('');
    setCurrentServiceToEdit(null);
  };

  const handleOpenAddDialog = () => {
    resetForm();
    setIsAddEditDialogOpen(true);
  };

  const handleOpenEditDialog = (service: Service) => {
    setCurrentServiceToEdit(service);
    setName(service.name);
    setCategoryState(service.category);
    setDurationState(service.duration);
    setPriceState(service.price);
    setIsAddEditDialogOpen(true);
  };

  const handleSaveService = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const formData = {
      name,
      category,
      duration,
      price,
    };

    // Client-side validation before calling server action
    const clientValidation = currentServiceToEdit 
      ? ServiceSchema.safeParse({ ...formData, id: currentServiceToEdit.id })
      : ServiceSchema.omit({id: true}).safeParse(formData);

    if (!clientValidation.success) {
      const errors = clientValidation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(", ");
      toast({ title: "Validation Error", description: errors, variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    if (currentServiceToEdit) {
      const result = await updateService({ ...clientValidation.data, id: currentServiceToEdit.id });
      if (result.success && result.service) {
        setServices(prevServices => prevServices.map(s => s.id === result.service!.id ? result.service! : s));
        toast({ title: "Service Updated", description: `"${result.service.name}" has been updated.` });
      } else {
        toast({ title: "Update Failed", description: result.error || "Could not update service.", variant: "destructive" });
      }
    } else {
      const result = await addService(clientValidation.data);
      if (result.success && result.service) {
        setServices(prevServices => [result.service!, ...prevServices]);
        toast({ title: "Service Added", description: `"${result.service.name}" has been added.` });
      } else {
        toast({ title: "Add Failed", description: result.error || "Could not add service.", variant: "destructive" });
      }
    }
    setIsLoading(false);
    setIsAddEditDialogOpen(false);
    resetForm();
  };

  const handleOpenDeleteDialog = (service: Service) => {
    setServiceToDelete(service);
  };

  const confirmDeleteService = async () => {
    if (serviceToDelete) {
      setIsLoading(true);
      const result = await deleteService(serviceToDelete.id);
      setIsLoading(false);
      if (result.success) {
        setServices(services.filter(s => s.id !== serviceToDelete.id));
        toast({ title: "Service Deleted", description: `"${serviceToDelete.name}" has been deleted.`, variant: "default" });
      } else {
        toast({ title: "Delete Failed", description: result.error || "Could not delete service.", variant: "destructive" });
      }
      setServiceToDelete(null);
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
          <h1 className="text-4xl font-bold tracking-tight text-primary">Manage Services</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Add, edit, or remove your salon&apos;s service offerings.
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
            <CardTitle>Salon Services</CardTitle>
            <CardDescription>List of all services offered by your salon.</CardDescription>
          </div>
          <Button onClick={handleOpenAddDialog} disabled={isLoading}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Service
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading && services.length === 0 ? (
            <p>Loading services...</p>
          ) : services.length > 0 ? (
            <Table>
              <TableCaption>A list of your salon services.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{service.category}</TableCell>
                    <TableCell>{service.duration}</TableCell>
                    <TableCell>{service.price}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" aria-label="Edit Service" onClick={() => handleOpenEditDialog(service)} disabled={isLoading}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="Delete Service" className="text-destructive hover:text-destructive" onClick={() => handleOpenDeleteDialog(service)} disabled={isLoading}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="min-h-[200px] flex flex-col items-center justify-center bg-muted/30 rounded-md mt-4">
              <p className="text-muted-foreground">No services added yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Click &quot;Add New Service&quot; to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddEditDialogOpen} onOpenChange={(isOpen) => {
        if (isLoading) return;
        setIsAddEditDialogOpen(isOpen);
        if (!isOpen) resetForm();
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSaveService}>
            <DialogHeader>
              <DialogTitle>{currentServiceToEdit ? 'Edit Service' : 'Add New Service'}</DialogTitle>
              <DialogDescription>
                {currentServiceToEdit ? 'Update the details of this service.' : 'Fill in the details for the new service.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="service-name" className="text-right">Name</Label>
                <Input id="service-name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" aria-label="Service Name" required/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="service-category" className="text-right">Category</Label>
                <Input id="service-category" value={category} onChange={(e) => setCategoryState(e.target.value)} className="col-span-3" aria-label="Service Category" required/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="service-duration" className="text-right">Duration</Label>
                <Input id="service-duration" value={duration} onChange={(e) => setDurationState(e.target.value)} className="col-span-3" placeholder="e.g., 30 min" aria-label="Service Duration" required/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="service-price" className="text-right">Price</Label>
                <Input id="service-price" value={price} onChange={(e) => setPriceState(e.target.value)} className="col-span-3" placeholder="e.g., $50" aria-label="Service Price" required/>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>{isLoading ? (currentServiceToEdit ? 'Saving...' : 'Adding...') : 'Save Service'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!serviceToDelete} onOpenChange={(open) => { if (isLoading) return; !open && setServiceToDelete(null)}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the service &quot;{serviceToDelete?.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setServiceToDelete(null)} disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteService} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground" disabled={isLoading}>
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
