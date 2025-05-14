
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Chrome, User, Briefcase, Users, Loader2 } from "lucide-react";
import Link from "next/link";
import type { UserRole, UserProfile } from '@/lib/schemas';
import { auth } from '@/lib/firebase'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setUserProfile } from '@/app/actions/userActions';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firstName || !lastName || !email || !password || !role) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    if (!auth) {
      toast({ title: "Error", description: "Authentication service is not available. Please try again later.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      // Step 1: Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Step 2: Create user profile in Firestore
      const profileData: UserProfile = {
        uid: firebaseUser.uid,
        firstName,
        lastName,
        email: firebaseUser.email || email, // Use email from Firebase Auth if available
        role,
      };
      const profileResult = await setUserProfile(profileData);

      if (!profileResult.success) {
        console.error("Failed to create user profile in Firestore:", profileResult.error);
        toast({
          title: "Signup Partially Failed",
          description: `Account created, but profile setup failed: ${profileResult.error || 'Unknown profile error'}. Please contact support.`,
          variant: "destructive",
          duration: 9000, 
        });
        // setIsSubmitting(false); // Handled by finally
        return; 
      }

      toast({
        title: "Account Created!",
        description: "You've been successfully signed up! Redirecting to dashboard...",
      });
      // router.push('/dashboard'); // Firebase onAuthStateChanged in useAuth will handle setting user state and redirect

    } catch (error: any) {
      console.error("Firebase signup error:", error);
      let errorMessage = "An unknown error occurred during signup.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email address is already in use. Please try another or log in.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "The password is too weak. Please choose a stronger password.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "The email address is not valid.";
      } else if (error.code === 'auth/configuration-not-found') {
        errorMessage = "Firebase authentication is not configured correctly. Please contact support.";
      } else {
        errorMessage = error.message || "Failed to sign up.";
      }
      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-primary">Create Your Account</CardTitle>
        <CardDescription className="text-md text-muted-foreground pt-1">
          Join SalonFlow and simplify your salon experience.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                aria-label="First Name"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                aria-label="Last Name"
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email Address"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="•••••••• (min. 6 characters)"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-label="Password"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">I am a...</Label>
            <Select value={role || ''} onValueChange={(value) => setRole(value as UserRole)} disabled={isSubmitting}>
              <SelectTrigger id="role" className="w-full h-12 text-base" aria-label="Select your role">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" /> Customer
                  </div>
                </SelectItem>
                <SelectItem value="owner">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" /> Salon Owner
                  </div>
                </SelectItem>
                 <SelectItem value="staff">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" /> Salon Staff
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full text-lg py-6" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>
          <Separator className="my-6" />
          <Button variant="outline" className="w-full text-lg py-6" type="button" onClick={() => toast({ title: "Feature not implemented", description: "Google Sign-Up is not yet available.", variant: "default" })} disabled={isSubmitting}>
            <Chrome className="mr-2 h-5 w-5" />
            Sign Up with Google
          </Button>
        </CardContent>
      </form>
      <CardFooter className="flex-col items-center justify-center text-sm">
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            Log In
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
