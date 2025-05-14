import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Chrome, User, Briefcase, Users } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-primary">Create Your Account</CardTitle>
        <CardDescription className="text-md text-muted-foreground pt-1">
          Join SalonFlow and simplify your salon experience.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" placeholder="John" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" placeholder="Doe" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" placeholder="you@example.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="••••••••" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">I am a...</Label>
          <Select defaultValue="customer">
            <SelectTrigger id="role" className="w-full h-12 text-base">
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
        <Button type="submit" className="w-full text-lg py-6">
          Create Account
        </Button>
        <Separator className="my-6" />
        <Button variant="outline" className="w-full text-lg py-6">
          <Chrome className="mr-2 h-5 w-5" />
          Sign Up with Google
        </Button>
      </CardContent>
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
