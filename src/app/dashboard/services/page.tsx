
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
import { ServiceSchema, type Service } from '@/lib/schemas'; // Updated import

const initialServicesData: Service[] = [
  { id: "1", name: "Classic Haircut", duration: "45 min", price: "$50", category: "Hair" },
  { id: "2", name: "Manicure", duration: "30 min", price: "$30", category: "Nails" },
  { id: "3", name: "Deep Tissue Massage", duration: "60 min", price: "$80", category: "Spa" },
  { id: "4", name: "Bridal Makeup", duration: "90 min", price: "$120", category: "Makeup" },
];

export default function ServicesPage() {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [currentServiceToEdit, setCurrentServiceToEdit] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  // Form state for Add/Edit Dialog
  const [name, setName] = useState('');
  const [category, setCategoryState] = useState(''); // Renamed to avoid conflict with Service.category
  const [duration, setDurationState] = useState(''); // Renamed
  const [price, setPriceState] = useState(''); // Renamed

  useEffect(() => {
    setServices(initialServicesData);
  }, []);


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

  const handleSaveService = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const formData = {
      id: currentServiceToEdit?.id || String(Date.now()), // Use existing ID or generate new one
      name,
      category, // Uses the state variable 'category'
      duration, // Uses the state variable 'duration'
      price,    // Uses the state variable 'price'
    };

    const validationResult = ServiceSchema.safeParse(formData);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(e => e.message).join(", ");
      toast({ title: "Validation Error", description: errors, variant: "destructive" });
      return;
    }

    const validatedData = validationResult.data;

    if (currentServiceToEdit) { 
      setServices(services.map(s => s.id === currentServiceToEdit.id ? { ...s, ...validatedData } : s));
      toast({ title: "Service Updated", description: `"${validatedData.name}" has been updated.` });
    } else { 
      setServices(prevServices => [...prevServices, validatedData]);
      toast({ title: "Service Added", description: `"${validatedData.name}" has been added.` });
    }
    setIsAddEditDialogOpen(false);
    resetForm();
  };

  const handleOpenDeleteDialog = (service: Service) => {
    setServiceToDelete(service);
  };

  const confirmDeleteService = () => {
    if (serviceToDelete) {
      setServices(services.filter(s => s.id !== serviceToDelete.id));
      toast({ title: "Service Deleted", description: `"${serviceToDelete.name}" has been deleted.`, variant: "destructive" });
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
          <Button onClick={handleOpenAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Service
          </Button>
        </CardHeader>
        <CardContent>
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
                    <Button variant="ghost" size="icon" aria-label="Edit Service" onClick={() => handleOpenEditDialog(service)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Delete Service" className="text-destructive hover:text-destructive" onClick={() => handleOpenDeleteDialog(service)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {services.length === 0 && (
            <div className="min-h-[200px] flex flex-col items-center justify-center bg-muted/30 rounded-md mt-4">
              <p className="text-muted-foreground">No services added yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Click &quot;Add New Service&quot; to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Service Dialog */}
      <Dialog open={isAddEditDialogOpen} onOpenChange={(isOpen) => {
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
                <Input id="service-name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" aria-label="Service Name"/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="service-category" className="text-right">Category</Label>
                <Input id="service-category" value={category} onChange={(e) => setCategoryState(e.target.value)} className="col-span-3" aria-label="Service Category"/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="service-duration" className="text-right">Duration</Label>
                <Input id="service-duration" value={duration} onChange={(e) => setDurationState(e.target.value)} className="col-span-3" placeholder="e.g., 30 min" aria-label="Service Duration"/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="service-price" className="text-right">Price</Label>
                <Input id="service-price" value={price} onChange={(e) => setPriceState(e.target.value)} className="col-span-3" placeholder="e.g., $50" aria-label="Service Price"/>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit">Save Service</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!serviceToDelete} onOpenChange={(open) => !open && setServiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the service &quot;{serviceToDelete?.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setServiceToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteService} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
