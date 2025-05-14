
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, UserCircle } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth, UserData } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { toast } = useToast();
  const { user, isLoading, login, isLoggedIn } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/auth/login');
    } else if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
    }
  }, [user, isLoading, isLoggedIn, router]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (user) {
      const updatedUser: UserData = { ...user, firstName, lastName, email };
      // In a real app, this would be an API call. Here, we update localStorage via login function.
      login(updatedUser); // login function in useAuth updates localStorage and state, then navigates to dashboard
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved.",
      });
    }
  };

  if (isLoading || !isLoggedIn) {
    return <div className="container mx-auto py-12 px-4">Loading profile or redirecting...</div>;
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary">My Profile</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Manage your personal information.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </header>

      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserCircle className="h-6 w-6 text-primary"/>Personal Details</CardTitle>
          <CardDescription>Update your name and email address. Your role is: <span className="font-semibold text-primary">{user?.role}</span></CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Your first name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Your last name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" disabled value="unchangedPassword" />
               <p className="text-xs text-muted-foreground">Password cannot be changed in this prototype version.</p>
            </div>
             <Button type="submit" className="w-full text-lg py-6">
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
