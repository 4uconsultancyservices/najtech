'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, GraduationCap, ChevronDown, ShoppingCart, Bell, User } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useCartStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

const navLinks = [
  { href: '/internships', label: 'Internships' },
  { href: '/mentors', label: 'Mentors' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: session } = useSession();
  const itemCount = useCartStore((s) => s.itemCount);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-background/80 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-border'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/40 transition-shadow">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-syne font-bold text-lg text-foreground">
              Naj<span className="text-primary">Tech</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive(link.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {session?.user ? (
              <>
                <Link href="/cart" className="relative p-2 rounded-lg hover:bg-accent transition-all">
                  <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                  {itemCount() > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {itemCount()}
                    </span>
                  )}
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-all"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{session.user.name?.split(' ')[0]}</span>
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-border">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-foreground truncate">{session.user.name}</p>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                              {session.user.role?.replace('_', ' ') || 'Student'}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{session.user.email}</p>
                        </div>
                        <div className="py-1">
                          <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors">Student Dashboard</Link>
                          {['mentor', 'admin', 'super_admin'].includes(session.user.role as string) && (
                            <Link href="/mentor/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-500 font-medium hover:bg-accent transition-colors">Mentor Portal</Link>
                          )}
                          {['admin', 'super_admin'].includes(session.user.role as string) && (
                            <Link href="/admin/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-primary font-medium hover:bg-accent transition-colors">Admin Panel</Link>
                          )}
                          <Link href="/my-internships" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors">My Internships</Link>
                          <Link href="/certificates" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors">Certificates</Link>
                          <div className="border-t border-border mt-1">
                            <button onClick={() => signOut()} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors font-medium">
                              Sign Out
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" variant="gradient">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-accent transition-all"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive(link.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-border space-y-2">
                {session ? (
                  <>
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                      <Button className="w-full" variant="outline" size="sm">Dashboard</Button>
                    </Link>
                    <Button className="w-full" variant="ghost" size="sm" onClick={() => signOut()}>Sign Out</Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <Button className="w-full" variant="outline" size="sm">Sign In</Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsOpen(false)}>
                      <Button className="w-full" variant="gradient" size="sm">Get Started</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
