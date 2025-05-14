
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Chrome, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from '@/hooks/use-auth';
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'; // Added sendPasswordResetEmail
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { isLoading: authIsLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState(''); // Default empty for real usage
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

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
      toast({
        title: "Login Successful!",
        description: "Redirecting to your dashboard...",
      });
      // onAuthStateChanged in useAuth will handle redirect
    } catch (error: any) { // Added missing opening brace
      console.error("Firebase login error:", error);
      let errorMessage = "An unknown error occurred during login.";
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential': // More generic for invalid email/password combo
            errorMessage = "Invalid email or password. Please try again.";
            break;
          case 'auth/invalid-email':
            errorMessage = "The email address is not valid.";
            break;
          case 'auth/user-disabled':
            errorMessage = "This user account has been disabled.";
            break;
          case 'auth/too-many-requests':
            errorMessage = "Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.";
            break;
          default:
            errorMessage = error.message || "Failed to log in.";
        }
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

  const handlePasswordReset = async () => {
    if (!auth) {
      toast({ title: "Error", description: "Authentication service is not available.", variant: "destructive" });
      return;
    }
    if (!email) {
      toast({ title: "Email Required", description: "Please enter your email address in the field above to reset your password.", variant: "default" });
      return;
    }
    setIsSendingReset(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Password Reset Email Sent",
        description: "If an account exists for this email, a password reset link has been sent. Please check your inbox (and spam folder).",
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      let errorMessage = "Could not send password reset email.";
      if (error.code === 'auth/invalid-email') {
        errorMessage = "The email address is not valid.";
      } else if (error.code === 'auth/user-not-found') {
        // Firebase doesn't explicitly tell if user not found for security, but for UX we can be generic
         errorMessage = "If an account exists for this email, a password reset link has been sent.";
      }
      toast({
        title: "Password Reset Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSendingReset(false);
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
              <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting || authIsLoading || isSendingReset}/>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-primary hover:underline p-0 h-auto"
                  onClick={handlePasswordReset}
                  disabled={isSendingReset || authIsLoading}
                >
                  {isSendingReset ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
                  Forgot password?
                </Button>
              </div>
              <Input id="password" type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isSubmitting || authIsLoading || isSendingReset}/>
            </div>
          </div>
          <Button type="submit" className="w-full text-lg py-6" disabled={isSubmitting || authIsLoading || isSendingReset}>
            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {isSubmitting ? 'Logging In...' : 'Log In'}
          </Button>
          <Separator className="my-6" />
          <Button variant="outline" className="w-full text-lg py-6" type="button" onClick={() => toast({ title: "Feature not implemented", description: "Google Sign-In is not yet available."})} disabled={isSubmitting || authIsLoading || isSendingReset}>
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
