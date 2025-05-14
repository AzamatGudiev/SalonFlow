import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Users, Scissors, DollarSign, CalendarDays, Settings } from "lucide-react";
import Link from "next/link";

const overviewStats = [
  { title: "Today's Bookings", value: "12", icon: CalendarDays, change: "+5%", changeType: "positive" as const },
  { title: "Pending Appointments", value: "8", icon: Activity, change: "-2%", changeType: "negative" as const },
  { title: "Total Revenue (Month)", value: "$4,520", icon: DollarSign, change: "+15%", changeType: "positive" as const },
  { title: "New Customers (Month)", value: "23", icon: Users, change: "+8%", changeType: "positive" as const },
];

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Owner Dashboard</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Manage your salon, view reports, and grow your business.
        </p>
      </header>

      {/* Overview Stats */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-foreground mb-6">Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {overviewStats.map((stat) => (
            <Card key={stat.title} className="transform transition-all duration-300 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <p className={`text-xs ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'} mt-1`}>
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-foreground mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-primary"><CalendarDays className="h-6 w-6" /> View Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">See all upcoming and past appointments.</p>
              <Button asChild className="w-full"><Link href="/dashboard/bookings">Manage Bookings</Link></Button>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-primary"><Scissors className="h-6 w-6" /> Manage Services</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Add, edit, or remove salon services.</p>
              <Button asChild className="w-full"><Link href="/dashboard/services">Edit Services</Link></Button>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-primary"><Users className="h-6 w-6" /> Manage Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Update staff profiles and schedules.</p>
              <Button asChild className="w-full"><Link href="/dashboard/staff">Update Staff</Link></Button>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Placeholder for Revenue Reports and other sections */}
      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-6">Revenue Reports</h2>
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Trend</CardTitle>
            <CardDescription>Visual representation of your salon's financial performance.</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center bg-muted/50 rounded-md">
            <p className="text-muted-foreground">Chart data will be displayed here.</p>
          </CardContent>
        </Card>
      </section>

      <div className="mt-12 text-center">
         <Button variant="outline" size="lg" asChild>
            <Link href="/dashboard/settings" className="inline-flex items-center gap-2">
                <Settings className="h-5 w-5" /> Salon Settings
            </Link>
        </Button>
      </div>
    </div>
  );
}
