'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Quote, Mail, Award, CheckCircle2, Sparkles, Building2, Copy, Check, ShieldCheck, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toaster';

export function DirectorDesk() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText('alauddinkhan.aurangabad@gmail.com');
    setCopied(true);
    toast.success('Director email copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <section ref={ref} className="py-20 sm:py-28 bg-card/40 border-y border-border relative overflow-hidden">
      {/* Background radial ambient lights */}
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Title Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Leadership & Vision</span>
          </div>
          <h2 className="font-syne text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
            From the <span className="gradient-text">Director's Desk</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg mt-3 leading-relaxed">
            Pioneering accessible, industry-grade experiential education and career guidance for every aspiring innovator.
          </p>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Director Portrait Card Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Decorative Ambient Border Glow */}
              <div className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 opacity-25 blur-xl group-hover:opacity-40 transition-opacity" />

              <div className="relative rounded-3xl overflow-hidden border border-border bg-card shadow-2xl group">
                {/* Director Photo Box */}
                <div className="aspect-[4/5] relative w-full bg-slate-900 overflow-hidden">
                  <Image
                    src="/images/director.jpeg"
                    alt="Alauddin Khan - Founder & Managing Director"
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 40vw, 33vw"
                  />
                  {/* Subtle Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                </div>

                {/* Top Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Founder</span>
                </div>

                {/* Floating Bottom Info Card */}
                <div className="absolute bottom-4 left-4 right-4 p-4.5 rounded-2xl bg-card/90 backdrop-blur-md border border-border/80 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-syne text-xl font-bold text-foreground leading-snug">Alauddin Khan</h3>
                      <p className="text-xs text-primary font-semibold mt-0.5">Founder & Managing Director</p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-indigo-500" />
                        <span>Aurangabad, MS, India</span>
                      </p>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Message & Core Commitments Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Quote Block */}
            <div className="relative pl-6 border-l-4 border-primary bg-primary/5 rounded-r-2xl p-5 border-y border-r border-primary/10">
              <Quote className="w-8 h-8 text-primary/30 mb-2" />
              <p className="font-syne text-lg sm:text-xl font-semibold text-foreground leading-snug">
                "Our singular mission is to bridge the gap between academic theory and high-impact industry engineering — empowering every student to build real software and accelerate their career."
              </p>
            </div>

            {/* Paragraph Text */}
            <div className="space-y-4 text-muted-foreground leading-relaxed text-sm sm:text-base">
              <p>
                Welcome to NajTech. Standard classroom curricula often leave a critical gap between academic grades and practical engineering execution. We created NajTech to serve as a launchpad for ambitious students across the nation.
              </p>
              <p>
                Through structured virtual internships, hands-on production codebases, and direct mentorship from industry veterans, we help our candidates gain verified experience, solve complex engineering challenges, and present resume-ready portfolios to top hiring organizations.
              </p>
            </div>

            {/* Commitments Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
              {[
                '100% Industry-Aligned Curriculum',
                'One-on-One Expert Mentorship',
                'Live Production Project Execution',
                'Verified Career Certification & References',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5 text-sm text-foreground font-medium bg-card/60 border border-border p-3 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Direct Communication & Action Footer */}
            <div className="pt-5 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">
                  Direct Office Communication
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="mailto:alauddinkhan.aurangabad@gmail.com"
                    className="text-sm font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="underline underline-offset-4 decoration-primary/40 hover:decoration-primary">
                      alauddinkhan.aurangabad@gmail.com
                    </span>
                  </a>

                  <button
                    onClick={handleCopyEmail}
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    title="Copy Email Address"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link href="/about">
                  <Button variant="outline" size="sm" rightIcon={<Award className="w-4 h-4" />}>
                    About Director's Desk
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

