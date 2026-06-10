'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Briefcase, Link, GitBranch, Globe, Loader2, Users } from 'lucide-react';

interface Mentor {
  _id: string;
  title: string;
  specialization: string[];
  experience: number;
  bio: string;
  avatar?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  rating: number;
  reviewCount: number;
  userId?: { name?: string; email?: string };
}

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/mentors?limit=12')
      .then((r) => r.json())
      .then((d) => setMentors(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-2 block">Meet the Experts</span>
          <h1 className="font-syne text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Learn from <span className="gradient-text">Industry Leaders</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our mentors are experienced professionals from top companies who guide you through real-world challenges.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : mentors.length === 0 ? (
          <div className="text-center py-24">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No mentors available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mentors.map((mentor, i) => (
              <motion.div
                key={mentor._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                whileHover={{ y: -4 }}
              >
                <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 text-center">
                  {/* Avatar */}
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-syne font-bold text-2xl mx-auto mb-4">
                    {mentor.userId?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'M'}
                  </div>

                  {/* Info */}
                  <h3 className="font-syne font-bold text-foreground text-base mb-1">
                    {mentor.userId?.name || 'Mentor'}
                  </h3>
                  <p className="text-primary text-sm font-medium mb-1">{mentor.title}</p>

                  {/* Rating */}
                  <div className="flex items-center justify-center gap-1.5 mb-3">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-medium text-foreground">{mentor.rating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">({mentor.reviewCount})</span>
                  </div>

                  {/* Experience */}
                  <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-4">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{mentor.experience}+ years experience</span>
                  </div>

                  {/* Specializations */}
                  <div className="flex flex-wrap gap-1.5 justify-center mb-4">
                    {mentor.specialization.slice(0, 3).map((spec) => (
                      <span key={spec} className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-xs font-medium">
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">{mentor.bio}</p>

                  {/* Social links */}
                  <div className="flex items-center justify-center gap-2">
                    {mentor.linkedin && (
                      <a href={mentor.linkedin} target="_blank" rel="noreferrer"
                        className="p-1.5 rounded-lg border border-border hover:border-primary/40 hover:text-primary transition-all text-muted-foreground">
                        <Link className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {mentor.github && (
                      <a href={mentor.github} target="_blank" rel="noreferrer"
                        className="p-1.5 rounded-lg border border-border hover:border-primary/40 hover:text-primary transition-all text-muted-foreground">
                        <GitBranch className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {mentor.website && (
                      <a href={mentor.website} target="_blank" rel="noreferrer"
                        className="p-1.5 rounded-lg border border-border hover:border-primary/40 hover:text-primary transition-all text-muted-foreground">
                        <Globe className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
