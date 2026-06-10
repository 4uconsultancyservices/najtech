import Link from 'next/link';
import { ShieldX } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center px-4">
        <div className="w-20 h-20 rounded-2xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="font-syne text-3xl font-bold text-foreground mb-3">Access Denied</h1>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          You don&apos;t have permission to access this page. Please contact your administrator.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
            Go Home
          </Link>
          <Link href="/dashboard" className="px-5 py-2.5 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-accent transition-colors">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
