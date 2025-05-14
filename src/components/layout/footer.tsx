export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {currentYear} SalonFlow. All rights reserved.</p>
        <p className="mt-1">Your Beauty, Our Priority.</p>
      </div>
    </footer>
  );
}
