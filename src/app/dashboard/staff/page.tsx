
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusCircle, UserPlus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const mockStaff = [
  { id: "1", name: "Alice Wonderland", role: "Stylist", email: "alice@example.com", avatar: "https://placehold.co/100x100.png", initials: "AW", aiHint: "woman portrait" },
  { id: "2", name: "Bob The Builder", role: "Barber", email: "bob@example.com", avatar: "https://placehold.co/100x100.png", initials: "BB", aiHint: "man portrait" },
  { id: "3", name: "Carol Danvers", role: "Manicurist", email: "carol@example.com", avatar: "https://placehold.co/100x100.png", initials: "CD", aiHint: "woman smiling" },
];

export default function StaffPage() {
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
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Staff
          </Button>
        </CardHeader>
        <CardContent>
          {mockStaff.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockStaff.map((staff) => (
                <Card key={staff.id} className="flex flex-col">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={staff.avatar} alt={staff.name} data-ai-hint={staff.aiHint} />
                      <AvatarFallback>{staff.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{staff.name}</CardTitle>
                      <CardDescription>{staff.role}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">{staff.email}</p>
                    {/* Placeholder for more staff details like schedule, services etc. */}
                  </CardContent>
                  <div className="p-4 pt-0 flex justify-end gap-2 border-t mt-4">
                     <Button variant="ghost" size="sm">
                        <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
             <div className="min-h-[200px] flex flex-col items-center justify-center bg-muted/30 rounded-md">
              <p className="text-muted-foreground">No staff members added yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Click &quot;Add New Staff&quot; to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
