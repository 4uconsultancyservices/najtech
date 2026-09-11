'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, ShoppingCart,
  Award, FileText, Palette, Search, Image, Bell, Tag, Shield,
  BarChart3, UserCheck, LogOut, Settings, ChevronRight,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    ],
  },
  {
    label: 'Users',
    items: [
      { href: '/admin/users', icon: Users, label: 'User Directory' },
      { href: '/admin/mentors', icon: UserCheck, label: 'Mentors' },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/internships', icon: BookOpen, label: 'Internships' },
      { href: '/admin/blogs', icon: FileText, label: 'Blogs' },
      { href: '/admin/cms', icon: Settings, label: 'CMS Builder' },
      { href: '/admin/media', icon: Image, label: 'Media Library' },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
      { href: '/admin/coupons', icon: Tag, label: 'Coupons' },
    ],
  },
  {
    label: 'Certificates',
    items: [
      { href: '/admin/certificates', icon: Award, label: 'Certificates' },
    ],
  },
  {
    label: 'Platform',
    items: [
      { href: '/admin/theme', icon: Palette, label: 'Theme Builder' },
      { href: '/admin/seo', icon: Search, label: 'SEO Management' },
      { href: '/admin/notifications', icon: Bell, label: 'Notifications' },
      { href: '/admin/audit-logs', icon: Shield, label: 'Audit Logs', superAdminOnly: true },
    ],
  },
];

interface AdminSidebarProps {
  user: { name?: string | null; email?: string | null; role?: string };
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const isSuperAdmin = user.role === 'super_admin';

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-card border-r border-border fixed inset-y-0 left-0 z-40">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <Link href="/" className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-syne font-bold text-foreground">
            Naj<span className="text-primary">Tech</span>
          </span>
        </Link>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
            isSuperAdmin ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20' : 'bg-primary/10 text-primary'
          }`}>
            {isSuperAdmin ? 'Super Admin Panel' : 'Admin Panel'}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Quick Switch
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent border border-dashed border-border transition-all"
          >
            <GraduationCap className="w-4 h-4 text-indigo-500" />
            <span>Student Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5 ml-auto text-muted-foreground" />
          </Link>
        </div>

        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="px-3 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                if (item.superAdminOnly && !isSuperAdmin) return null;
                const active = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                      active
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                    {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3 px-3 py-2 rounded-xl bg-muted">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            {user.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
            <p className="text-[10px] text-primary font-bold capitalize">{user.role?.replace('_', ' ')}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all font-medium"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
