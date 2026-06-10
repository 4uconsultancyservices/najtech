'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { InternshipCard } from '@/components/internships/InternshipCard';
import { Button } from '@/components/ui/Button';

export function FeaturedInternships() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [internships, setInternships] = useState<[]>([]);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   fetch('/api/internships?featured=true&limit=6')
  //     .then((r) => r.json())
  //     .then((d) => setInternships(d.data || []))
  //     .catch(() => {})
  //     .finally(() => setLoading(false));
  // }, []);

  return (
    <section ref={ref} className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12"
        >
          <div>
            <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-2 block">
              Featured Programs
            </span>
            <h2 className="font-syne text-3xl sm:text-4xl font-bold text-foreground">
              Top Internship Programs
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl">
              Handpicked programs by industry experts to fast-track your career growth.
            </p>
          </div>
          <Link href="/internships">
            <Button variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View All
            </Button>
          </Link>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : internships.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {internships.map((internship: { _id: string }, i) => (
              <InternshipCard key={internship._id} internship={internship as never} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p>No featured internships available yet. Check back soon!</p>
          </div>
        )}
      </div>
    </section>
  );
}
