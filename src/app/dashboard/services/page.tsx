
'use client'; // Required for useToast

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
import { useToast } from "@/hooks/use-toast"; // Import useToast

const mockServices = [
  { id: "1", name: "Classic Haircut", duration: "45 min", price: "$50", category: "Hair" },
  { id: "2", name: "Manicure", duration: "30 min", price: "$30", category: "Nails" },
  { id: "3", name: "Deep Tissue Massage", duration: "60 min", price: "$80", category: "Spa" },
  { id: "4", name: "Bridal Makeup", duration: "90 min", price: "$120", category: "Makeup" },
];

export default function ServicesPage() {
  const { toast } = useToast(); // Initialize useToast

  const handleAddService = () => {
    toast({
      title: "Feature In Progress",
      description: "Adding a new service is not yet implemented in this prototype.",
    });
  };

  const handleEditService = (serviceName: string) => {
    toast({
      title: "Feature In Progress",
      description: `Editing functionality for "${serviceName}" is not yet implemented.`,
    });
  };

  const handleDeleteService = (serviceName: string) => {
    toast({
      title: "Action Simulated",
      description: `In a real app, "${serviceName}" would be deleted. This is a prototype.`,
      variant: "destructive",
    });
  };

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
          <Button onClick={handleAddService}> {/* Add onClick handler */}
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
              {mockServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{service.category}</TableCell>
                  <TableCell>{service.duration}</TableCell>
                  <TableCell>{service.price}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" aria-label="Edit Service" onClick={() => handleEditService(service.name)}> {/* Add onClick handler */}
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Delete Service" className="text-destructive hover:text-destructive" onClick={() => handleDeleteService(service.name)}> {/* Add onClick handler */}
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {mockServices.length === 0 && (
            <div className="min-h-[200px] flex flex-col items-center justify-center bg-muted/30 rounded-md mt-4">
              <p className="text-muted-foreground">No services added yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Click &quot;Add New Service&quot; to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
