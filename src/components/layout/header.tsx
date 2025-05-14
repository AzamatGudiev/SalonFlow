
'use client';

import Link from 'next/link';
import { Logo } from '@/components/icons/logo';
import { Button } from '@/components/ui/button';
import { Menu, LogOut, UserCircle as UserIcon, Settings, LayoutDashboard } from 'lucide-react'; // Renamed UserCircle to UserIcon
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from '@/components/ui/separator';

const navItemsBase = [
  { href: '/salons', label: 'Salons' },
  // Other base items if any
];

export function Header() {
  const { isLoggedIn, user, role, logout, isLoading } = useAuth();

  const navItems = isLoggedIn 
    ? [...navItemsBase, { href: '/dashboard', label: 'Dashboard' }] 
    : navItemsBase;

  const getInitials = (firstName?: string, lastName?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    return 'U'; // Default fallback
  }

  if (isLoading) { // Prevent flash of unauthenticated content on client by ensuring consistent initial render
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <div className="h-8 w-20 bg-muted rounded-md animate-pulse"></div>
        </div>
      </header>
    );
  }


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ))}
          {isLoggedIn && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <Avatar className="h-9 w-9">
                    {/* <AvatarImage src="https://placehold.co/40x40.png" alt={user.firstName} data-ai-hint="user avatar" /> */}
                    <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                     <p className="text-xs leading-none text-muted-foreground capitalize pt-1">Role: {role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuItem asChild>
                  <Link href="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile"><UserIcon className="mr-2 h-4 w-4" /> Profile</Link>
                </DropdownMenuItem>
                {(role === 'owner' || role === 'staff') && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings"><Settings className="mr-2 h-4 w-4" /> Salon Settings</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </nav>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-1 p-4">
                <div className="mb-5">
                  <SheetClose asChild><Logo /></SheetClose>
                </div>
                {navItems.map((item) => (
                  <SheetClose asChild key={item.label}>
                    <Link
                      href={item.href}
                      className="text-base font-medium text-foreground hover:text-primary transition-colors py-2.5 block rounded-md hover:bg-muted px-2"
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
                <Separator className="my-3"/>
                {isLoggedIn && user ? (
                  <>
                    <SheetClose asChild>
                      <Link href="/dashboard/profile" className="flex items-center text-base font-medium text-foreground hover:text-primary transition-colors py-2.5 rounded-md hover:bg-muted px-2">
                        <UserIcon className="mr-2 h-5 w-5" /> Profile
                      </Link>
                    </SheetClose>
                    {(role === 'owner' || role === 'staff') && (
                      <SheetClose asChild>
                        <Link href="/dashboard/settings" className="flex items-center text-base font-medium text-foreground hover:text-primary transition-colors py-2.5 rounded-md hover:bg-muted px-2">
                         <Settings className="mr-2 h-5 w-5" /> Salon Settings
                        </Link>
                      </SheetClose>
                    )}
                     <SheetClose asChild>
                        <Button variant="ghost" onClick={logout} className="w-full justify-start text-base font-medium py-2.5 px-2 text-destructive hover:text-destructive hover:bg-destructive/10">
                        <LogOut className="mr-2 h-5 w-5" /> Log out
                        </Button>
                    </SheetClose>
                  </>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Button variant="outline" asChild className="w-full mt-3 py-2.5 text-base">
                        <Link href="/auth/login">Login</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild className="w-full mt-2 py-2.5 text-base">
                        <Link href="/auth/signup">Sign Up</Link>
                      </Button>
                    </SheetClose>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
