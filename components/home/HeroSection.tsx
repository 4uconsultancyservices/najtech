'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Play, Sparkles, Star, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const floatingShapes = [
  { size: 300, x: '10%', y: '20%', color: 'from-indigo-500/20 to-purple-500/20', delay: 0 },
  { size: 200, x: '80%', y: '10%', color: 'from-cyan-500/20 to-blue-500/20', delay: 1 },
  { size: 250, x: '70%', y: '60%', color: 'from-purple-500/20 to-pink-500/20', delay: 2 },
  { size: 180, x: '20%', y: '70%', color: 'from-emerald-500/20 to-cyan-500/20', delay: 0.5 },
];

const stats = [
  { icon: Users, value: '50,000+', label: 'Students Enrolled' },
  { icon: Star, value: '4.9/5', label: 'Average Rating' },
  { icon: TrendingUp, value: '95%', label: 'Placement Rate' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-16"
    >
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:64px_64px]" />
        {/* Gradient mesh */}
        <motion.div style={{ y }} className="absolute inset-0">
          {floatingShapes.map((shape, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full bg-gradient-to-br ${shape.color} blur-3xl`}
              style={{
                width: shape.size,
                height: shape.size,
                left: shape.x,
                top: shape.y,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, 15, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 8 + i * 2,
                delay: shape.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
          {/* Badge */}
          <motion.div variants={item} className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>India&apos;s Premier Virtual Internship Platform</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div variants={item} className="space-y-4">
            <h1 className="font-syne text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-foreground leading-none">
              Launch Your
              <br />
              <span className="gradient-text">Career Journey</span>
              <br />
              <span className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl">with Expert Mentors</span>
            </h1>
          </motion.div>

          {/* Subtext */}
          <motion.p
            variants={item}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Real-world virtual internships designed by industry leaders. Get mentored, build projects,
            earn certificates, and accelerate your career.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/internships">
              <Button size="lg" variant="gradient" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Explore Internships
              </Button>
            </Link>
            <Button size="lg" variant="outline" leftIcon={<Play className="w-4 h-4" />}>
              Watch How It Works
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={item}
            className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-4"
          >
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-syne font-bold text-xl text-foreground">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Trust badges */}
          <motion.div variants={item} className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <span className="text-sm text-muted-foreground">Trusted by graduates from:</span>
            {['IIT', 'NIT', 'BITS', 'VIT', 'IIIT'].map((uni) => (
              <span
                key={uni}
                className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border"
              >
                {uni}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-border flex items-start justify-center p-2">
          <motion.div
            className="w-1.5 h-1.5 bg-primary rounded-full"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  );
}
