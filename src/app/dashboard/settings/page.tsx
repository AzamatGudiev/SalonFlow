
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Info, Clock, ScissorsIcon, Users, Palette } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Simulate saving settings
    toast({
      title: "Settings Saved",
      description: "Your salon settings have been updated successfully.",
    });
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary">Salon Settings</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Configure your salon&apos;s details, appearance, and operational settings.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </header>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 mb-6">
            <TabsTrigger value="general"><Info className="mr-1 h-4 w-4 sm:mr-2" /> General</TabsTrigger>
            <TabsTrigger value="hours"><Clock className="mr-1 h-4 w-4 sm:mr-2" /> Operating Hours</TabsTrigger>
            <TabsTrigger value="services_staff"><ScissorsIcon className="mr-1 h-4 w-4 sm:mr-2" /> Services & Staff</TabsTrigger>
            {/* <TabsTrigger value="theme"><Palette className="mr-1 h-4 w-4 sm:mr-2" /> Theme</TabsTrigger> Could be added later */}
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>Basic details about your salon.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="salonName">Salon Name</Label>
                  <Input id="salonName" defaultValue="My Awesome Salon" placeholder="Enter your salon name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salonAddress">Salon Address</Label>
                  <Input id="salonAddress" defaultValue="123 Main Street, Anytown, USA" placeholder="Enter salon address" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salonPhone">Phone Number</Label>
                  <Input id="salonPhone" type="tel" defaultValue="(123) 456-7890" placeholder="Enter contact phone" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salonDescription">Salon Description</Label>
                  <Textarea id="salonDescription" defaultValue="The best salon in town for all your beauty needs." placeholder="Describe your salon" className="min-h-[100px]" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hours">
            <Card>
              <CardHeader>
                <CardTitle>Operating Hours</CardTitle>
                <CardDescription>Set your salon&apos;s weekly schedule.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <div key={day} className="grid grid-cols-3 gap-4 items-center">
                    <Label htmlFor={`${day.toLowerCase()}Open`} className="col-span-1">{day}</Label>
                    <Input id={`${day.toLowerCase()}Open`} type="time" defaultValue={day === 'Sunday' || day === 'Saturday' ? "10:00" : "09:00"} className="col-span-1" />
                    <Input id={`${day.toLowerCase()}Close`} type="time" defaultValue={day === 'Sunday' ? "16:00" : (day === 'Saturday' ? "18:00" : "19:00")} className="col-span-1" />
                  </div>
                ))}
                <p className="text-xs text-muted-foreground pt-2">Leave times blank if closed on a specific day.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="services_staff">
            <Card>
              <CardHeader>
                <CardTitle>Services & Staff Quick Links</CardTitle>
                <CardDescription>Quick access to manage your services and staff members.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <p className="text-muted-foreground">
                  Manage your offered services and staff profiles through their dedicated sections.
                </p>
                <div className="flex gap-4">
                  <Button asChild variant="outline">
                    <Link href="/dashboard/services">
                      <ScissorsIcon className="mr-2 h-4 w-4" /> Manage Services
                    </Link>
                  </Button>
                   <Button asChild variant="outline">
                    <Link href="/dashboard/staff">
                      <Users className="mr-2 h-4 w-4" /> Manage Staff
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
        
        <div className="mt-8 flex justify-end">
          <Button type="submit" size="lg">
            <Save className="mr-2 h-4 w-4" /> Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
