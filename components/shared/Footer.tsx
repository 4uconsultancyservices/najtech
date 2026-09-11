'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, Phone, MapPin,XIcon } from 'lucide-react';

const footerLinks = {
  platform: [
    { href: '/internships', label: 'Browse Internships' },
    { href: '/mentors', label: 'Our Mentors' },
    { href: '/about', label: 'About Us' },
    { href: '/blog', label: 'Blog' },
  ],
  legal: [
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/terms-conditions', label: 'Terms & Conditions' },
    { href: '/refund-policy', label: 'Refund Policy' },
  ],
  support: [
    { href: '/contact', label: 'Contact Us' },
    { href: '/verify-certificate', label: 'Verify Certificate' },
    { href: '/faq', label: 'FAQ' },
  ],
};

const socials = [
  { icon: XIcon, href: '#', label: 'Twitter' },
  { icon: XIcon, href: '#', label: 'LinkedIn' },
  { icon: XIcon, href: '#', label: 'GitHub' },
  { icon: XIcon, href: '#', label: 'YouTube' },
];

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-syne font-bold text-xl">
                Naj<span className="text-primary">Tech</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-xs">
              Empowering the next generation of professionals through guided virtual internships and expert mentorship.
            </p>
            <div className="flex gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-syne font-semibold text-foreground mb-4">Platform</h3>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-syne font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-syne font-semibold text-foreground mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href="mailto:alauddinkhan.aurangabad@gmail.com" className="hover:text-foreground transition-colors">alauddinkhan.aurangabad@gmail.com</a>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <a href="tel:+918000000000" className="hover:text-foreground transition-colors">+91 80000 00000</a>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Bangalore, Karnataka, India</span>
              </li>
            </ul>
            <div className="mt-6">
              {footerLinks.support.map((link) => (
                <Link key={link.href} href={link.href} className="block text-sm text-muted-foreground hover:text-foreground transition-colors mb-3">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © <span suppressHydrationWarning>{new Date().getFullYear()}</span> NajTech. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Made with</span>
            <span className="text-red-500">♥</span>
            <span className="text-sm text-muted-foreground">in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
