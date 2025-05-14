
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Chrome, User, Briefcase, Users as UsersIconLucide } from "lucide-react"; // Renamed Users to avoid conflict
import Link from "next/link";
import { useAuth, type UserRole, type UserData } from '@/hooks/use-auth';
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password');
  const [role, setRole] = useState<UserRole>('customer');

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Simulate login by creating UserData based on role
    const userData: UserData = {
      firstName: 'Test',
      lastName: role === 'owner' ? 'Owner' : (role === 'staff' ? 'Staff' : 'User'),
      email,
      role: role,
    };
    login(userData); // This will save to localStorage and navigate

    toast({
      title: "Logged In (Simulated)",
      description: `Successfully logged in as ${role}. Redirecting...`,
    });
    // router.push('/dashboard') is handled by login function in useAuth
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
              <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-sm text-primary hover:underline" onClick={() => toast({title: "Feature not implemented", description: "Password recovery is not available in this prototype."})}>
                  Forgot password?
                </Link>
              </div>
              <Input id="password" type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {/* Role selector for simulation purposes */}
            <div className="space-y-2">
              <Label htmlFor="role-login">Simulate login as:</Label>
              <Select value={role || ''} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger id="role-login" className="w-full h-12 text-base" aria-label="Simulate login role">
                  <SelectValue placeholder="Select role to simulate" />
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
                      <UsersIconLucide className="h-4 w-4 text-muted-foreground" /> Salon Staff
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">This role selector is for simulation purposes only.</p>
            </div>
          </div>
          <Button type="submit" className="w-full text-lg py-6">
            Log In
          </Button>
          <Separator className="my-6" />
          <Button variant="outline" className="w-full text-lg py-6" type="button" onClick={() => toast({ title: "Feature not implemented", description: "Google Sign-In is not yet available."})}>
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
