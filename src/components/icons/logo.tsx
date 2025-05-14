import { Scissors } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-xl md:text-2xl font-bold text-primary hover:opacity-80 transition-opacity" aria-label="SalonFlow Home">
      <Scissors className="h-6 w-6 md:h-7 md:w-7" />
      <span>SalonFlow</span>
    </Link>
  );
}
