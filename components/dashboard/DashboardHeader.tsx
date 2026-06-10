'use client';

import { Menu, Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

interface DashboardHeaderProps {
  user: { name?: string | null; email?: string | null; role?: string };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="lg:hidden p-2 rounded-lg hover:bg-accent">
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-syne text-lg font-semibold text-foreground">
              Welcome back, {user.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-xs text-muted-foreground capitalize">{user.role} Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button className="relative p-2 rounded-lg hover:bg-accent transition-all">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
}
