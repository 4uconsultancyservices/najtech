'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, BookOpen, ClipboardList, Award, User,
  CreditCard, Bell, GraduationCap, LogOut, ChevronRight,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/my-internships', icon: BookOpen, label: 'My Internships' },
  { href: '/assignments', icon: ClipboardList, label: 'Assignments' },
  { href: '/certificates', icon: Award, label: 'Certificates' },
  { href: '/payments', icon: CreditCard, label: 'Payments' },
  { href: '/profile', icon: User, label: 'Profile' },
];

interface StudentSidebarProps {
  user: { name?: string | null; email?: string | null; image?: string | null; role?: string };
}

export function StudentSidebar({ user }: StudentSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border fixed inset-y-0 left-0 z-40">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-syne font-bold text-foreground">
            Naj<span className="text-primary">Tech</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Portal Switchers for Admins & Mentors */}
        {['admin', 'super_admin'].includes(user.role || '') && (
          <div className="mb-4 pb-3 border-b border-border space-y-1">
            <div className="px-3 mb-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Administrative Access
            </div>
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Go to Admin Panel</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto" />
            </Link>
          </div>
        )}

        {['mentor', 'admin', 'super_admin'].includes(user.role || '') && user.role !== 'admin' && user.role !== 'super_admin' && (
          <div className="mb-4 pb-3 border-b border-border space-y-1">
            <div className="px-3 mb-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Mentor Access
            </div>
            <Link
              href="/mentor/dashboard"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Go to Mentor Portal</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto" />
            </Link>
          </div>
        )}

        <div className="px-3 mb-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Student Workspace
        </div>
        {navItems.map((item) => {
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
              <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
              <span>{item.label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3 px-3 py-2 rounded-xl bg-muted">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-primary/10 text-primary rounded capitalize flex-shrink-0">
                {user.role?.replace('_', ' ') || 'Student'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
