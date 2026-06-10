import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Syne } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { AuthProvider } from '@/components/shared/AuthProvider';
import { Toaster } from '@/components/ui/Toaster';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'NajTech — Virtual Internship Platform',
    template: '%s | NajTech',
  },
  description:
    'NajTech connects ambitious students with industry mentors through immersive virtual internship programs.',
  keywords: ['virtual internship', 'online learning', 'mentorship', 'EdTech'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://internvault.com'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${jakarta.variable} ${syne.variable}`}>
      <head>
        <meta name="theme-color" content="#6366f1" />
      </head>
      <body className="font-jakarta antialiased">
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
