import { Logo } from '@/components/icons/logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4 sm:p-6 lg:p-8">
       <div className="absolute top-8 left-8">
        <Logo />
      </div>
      {children}
      <footer className="absolute bottom-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} SalonFlow. All rights reserved.
      </footer>
    </div>
  );
}
