
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Chrome, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from '@/hooks/use-auth'; // useAuth will handle redirect via onAuthStateChanged
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { auth } from '@/lib/firebase'; // Import Firebase auth instance
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { isLoading: authIsLoading } = useAuth(); // Only need isLoading to disable form during auth check
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('test@example.com'); // Default for easier testing
  const [password, setPassword] = useState('password');   // Default for easier testing
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!auth) {
      toast({ title: "Error", description: "Authentication service is not available. Please try again later.", variant: "destructive" });
      return;
    }
    if (!email || !password) {
      toast({ title: "Error", description: "Please enter both email and password.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Firebase onAuthStateChanged in useAuth will handle setting user state and redirecting
      toast({
        title: "Login Successful!",
        description: "Redirecting to your dashboard...",
      });
      // No need to manually redirect here, onAuthStateChanged in useAuth does it.
      // router.push('/dashboard'); // This will be handled by useAuth
    } catch (error: any) {
      console.error("Firebase login error:", error);
      let errorMessage = "An unknown error occurred during login.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "The email address is not valid.";
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = "This user account has been disabled.";
      }
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-primary">Welcome Back!</CardTitle>
        <CardDescription className="text-md text-muted-foreground pt-1">
          Log in to manage your appointments or your salon.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting || authIsLoading}/>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-sm text-primary hover:underline" onClick={() => toast({title: "Feature not implemented", description: "Password recovery is not available in this prototype."})}>
                  Forgot password?
                </Link>
              </div>
              <Input id="password" type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isSubmitting || authIsLoading}/>
            </div>
          </div>
          <Button type="submit" className="w-full text-lg py-6" disabled={isSubmitting || authIsLoading}>
            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {isSubmitting ? 'Logging In...' : 'Log In'}
          </Button>
          <Separator className="my-6" />
          <Button variant="outline" className="w-full text-lg py-6" type="button" onClick={() => toast({ title: "Feature not implemented", description: "Google Sign-In is not yet available."})} disabled={isSubmitting || authIsLoading}>
            <Chrome className="mr-2 h-5 w-5" />
            Continue with Google
          </Button>
        </CardContent>
      </form>
      <CardFooter className="flex-col items-center justify-center text-sm">
        <p className="text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-medium text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
