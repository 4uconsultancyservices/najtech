'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Users, BookOpen, Award, Star, Building2, Clock } from 'lucide-react';

const stats = [
  { icon: Users, value: 50000, suffix: '+', label: 'Students Enrolled', color: 'from-indigo-500 to-purple-600' },
  { icon: BookOpen, value: 200, suffix: '+', label: 'Internship Programs', color: 'from-purple-500 to-pink-600' },
  { icon: Award, value: 45000, suffix: '+', label: 'Certificates Issued', color: 'from-cyan-500 to-blue-600' },
  { icon: Star, value: 4.9, suffix: '/5', label: 'Average Rating', color: 'from-amber-500 to-orange-600', decimal: true },
  { icon: Building2, value: 500, suffix: '+', label: 'Partner Companies', color: 'from-emerald-500 to-teal-600' },
  { icon: Clock, value: 95, suffix: '%', label: 'Completion Rate', color: 'from-rose-500 to-red-600' },
];

function AnimatedCounter({ end, suffix, decimal, isInView }: { end: number; suffix: string; decimal?: boolean; isInView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = end / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(decimal ? parseFloat(current.toFixed(1)) : Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [end, isInView, decimal]);

  return (
    <span>
      {decimal ? count.toFixed(1) : count.toLocaleString('en-IN')}{suffix}
    </span>
  );
}

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-20 bg-card border-y border-border relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-syne text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Trusted by Thousands Across India
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join a growing community of ambitious professionals building their careers with NajTech.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group text-center"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="font-syne text-2xl font-bold text-foreground mb-1">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} decimal={stat.decimal} isInView={isInView} />
              </div>
              <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
