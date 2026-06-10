'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: '1',
    name: 'Priya Sharma',
    role: 'Frontend Developer',
    company: 'Google',
    avatar: '',
    content: 'NajTech completely transformed my career trajectory. The mentorship I received was world-class and the projects were real-world applicable. I landed my dream job within 2 months of completing the program.',
    rating: 5,
    program: 'Full-Stack Web Development',
  },
  {
    id: '2',
    name: 'Arjun Mehta',
    role: 'Data Scientist',
    company: 'Microsoft',
    avatar: '',
    content: 'The structured curriculum and weekly assignments kept me on track. My mentor was incredibly knowledgeable and always available for doubt-clearing sessions. Best investment I made in my career.',
    rating: 5,
    program: 'Data Science & ML',
  },
  {
    id: '3',
    name: 'Sneha Patel',
    role: 'UI/UX Designer',
    company: 'Flipkart',
    avatar: '',
    content: 'As someone transitioning from a non-tech background, NajTech made learning design principles accessible and practical. The certificate is recognized by top companies and opened so many doors.',
    rating: 5,
    program: 'UI/UX Design',
  },
  {
    id: '4',
    name: 'Rahul Kumar',
    role: 'Backend Engineer',
    company: 'Razorpay',
    avatar: '',
    content: 'The hands-on project approach at NajTech is unparalleled. I built a complete production-grade app during my internship which became the highlight of my resume and impressed every interviewer.',
    rating: 5,
    program: 'Cloud & DevOps',
  },
  {
    id: '5',
    name: 'Ananya Rao',
    role: 'Product Manager',
    company: 'Swiggy',
    avatar: '',
    content: 'What sets NajTech apart is the quality of mentors. Mine was an actual PM at a top startup who shared real insights and frameworks. The program is worth every rupee and much more.',
    rating: 5,
    program: 'Product Management',
  },
  {
    id: '6',
    name: 'Vikram Singh',
    role: 'Mobile Developer',
    company: 'PhonePe',
    avatar: '',
    content: 'Six months after completing NajTech, I got a 40% salary hike. The skills I learned and the projects in my portfolio spoke for themselves. Cannot recommend this enough to aspiring developers.',
    rating: 5,
    program: 'Mobile App Development',
  },
];

function TestimonialCard({ testimonial, index }: { testimonial: typeof testimonials[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-lg transition-all duration-300 flex flex-col gap-4"
    >
      {/* Quote icon */}
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
        <Quote className="w-5 h-5 text-primary" />
      </div>

      {/* Rating */}
      <div className="flex gap-1">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
        ))}
      </div>

      {/* Content */}
      <p className="text-muted-foreground text-sm leading-relaxed flex-1">&ldquo;{testimonial.content}&rdquo;</p>

      {/* Program tag */}
      <span className="text-xs text-primary font-medium bg-primary/10 px-2.5 py-1 rounded-lg w-fit">
        {testimonial.program}
      </span>

      {/* Author */}
      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
          {testimonial.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <div className="font-semibold text-sm text-foreground">{testimonial.name}</div>
          <div className="text-xs text-muted-foreground">{testimonial.role} @ {testimonial.company}</div>
        </div>
      </div>
    </motion.div>
  );
}

export function TestimonialsSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-14"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-2 block">
            Success Stories
          </span>
          <h2 className="font-syne text-3xl sm:text-4xl font-bold text-foreground mb-4">
            What Our Students Say
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Thousands of professionals have launched their careers through NajTech. Here are some of their stories.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.id} testimonial={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
