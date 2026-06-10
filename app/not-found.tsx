import Link from 'next/link';
import { Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center px-4">
        <div className="font-syne text-[120px] sm:text-[160px] font-bold leading-none gradient-text mb-6">
          404
        </div>
        <h1 className="font-syne text-2xl font-bold text-foreground mb-3">Page Not Found</h1>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
            Go Home
          </Link>
          <Link href="/internships" className="px-5 py-2.5 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-accent transition-colors">
            Browse Internships
          </Link>
        </div>
      </div>
    </div>
  );
}
