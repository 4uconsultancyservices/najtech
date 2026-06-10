'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Clock, Star, Users, Award, CheckCircle, BookOpen, ChevronDown,
  ChevronUp, Play, FileText, Link as LinkIcon, ShoppingCart, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/components/ui/Toaster';

interface InternshipDetailProps {
  internship: {
    _id: string;
    title: string;
    slug: string;
    description: string;
    shortDescription: string;
    thumbnail?: string;
    price: number;
    discountPrice?: number;
    duration: number;
    rating: number;
    reviewCount: number;
    enrollmentCount: number;
    certificate: boolean;
    skills: string[];
    requirements: string[];
    outcomes: string[];
    curriculum: Array<{
      week: number;
      title: string;
      description: string;
      topics: string[];
      resources?: Array<{ title: string; type: string; duration?: number }>;
    }>;
    faqs: Array<{ question: string; answer: string }>;
    mentor?: {
      title?: string;
      bio?: string;
      avatar?: string;
      specialization?: string[];
      experience?: number;
      rating?: number;
    };
    category?: { name?: string; color?: string };
  };
}

export function InternshipDetail({ internship }: InternshipDetailProps) {
  const [openCurriculum, setOpenCurriculum] = useState<number | null>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = () => {
    addItem({
      internshipId: internship._id,
      title: internship.title,
      price: internship.price,
      discountPrice: internship.discountPrice,
      thumbnail: internship.thumbnail,
    });
    toast.success('Added to cart!');
  };

  const resourceIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="w-3.5 h-3.5 text-red-500" />;
      case 'pdf': return <FileText className="w-3.5 h-3.5 text-blue-500" />;
      default: return <LinkIcon className="w-3.5 h-3.5 text-green-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Hero banner */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-600 py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('/grid.svg')]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            {internship.category && (
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white mb-4">
                {internship.category.name}
              </span>
            )}
            <h1 className="font-syne text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              {internship.title}
            </h1>
            <p className="text-white/80 text-lg mb-6 leading-relaxed">{internship.shortDescription}</p>
            <div className="flex flex-wrap gap-6 text-white/90 text-sm">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-semibold">{internship.rating.toFixed(1)}</span>
                <span>({internship.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{internship.enrollmentCount.toLocaleString('en-IN')} enrolled</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{internship.duration} weeks</span>
              </div>
              {internship.certificate && (
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Certificate of Completion</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* What you'll learn */}
            <section>
              <h2 className="font-syne text-2xl font-bold text-foreground mb-5">What You&apos;ll Learn</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {internship.outcomes.map((outcome, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{outcome}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Skills */}
            <section>
              <h2 className="font-syne text-2xl font-bold text-foreground mb-5">Skills You&apos;ll Gain</h2>
              <div className="flex flex-wrap gap-2">
                {internship.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            {/* Curriculum */}
            <section>
              <h2 className="font-syne text-2xl font-bold text-foreground mb-5">Curriculum</h2>
              <div className="space-y-3">
                {internship.curriculum.map((week, i) => (
                  <div key={i} className="border border-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenCurriculum(openCurriculum === i ? null : i)}
                      className="w-full flex items-center justify-between p-4 bg-card hover:bg-accent transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                          W{week.week}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{week.title}</div>
                          <div className="text-xs text-muted-foreground">{week.topics.length} topics</div>
                        </div>
                      </div>
                      {openCurriculum === i ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </button>
                    {openCurriculum === i && (
                      <div className="p-4 bg-card/50 border-t border-border">
                        <p className="text-sm text-muted-foreground mb-3">{week.description}</p>
                        <ul className="space-y-1.5 mb-3">
                          {week.topics.map((topic, j) => (
                            <li key={j} className="flex items-center gap-2 text-sm text-foreground">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                              {topic}
                            </li>
                          ))}
                        </ul>
                        {week.resources && week.resources.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                            {week.resources.map((r, j) => (
                              <div key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                                {resourceIcon(r.type)}
                                <span>{r.title}</span>
                                {r.duration && <span className="ml-auto text-xs">{r.duration} min</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Requirements */}
            {internship.requirements.length > 0 && (
              <section>
                <h2 className="font-syne text-2xl font-bold text-foreground mb-5">Requirements</h2>
                <ul className="space-y-2">
                  {internship.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* FAQ */}
            {internship.faqs.length > 0 && (
              <section>
                <h2 className="font-syne text-2xl font-bold text-foreground mb-5">FAQs</h2>
                <div className="space-y-3">
                  {internship.faqs.map((faq, i) => (
                    <div key={i} className="border border-border rounded-xl overflow-hidden">
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-accent transition-colors"
                      >
                        <span className="font-medium text-foreground text-sm">{faq.question}</span>
                        {openFaq === i ? <ChevronUp className="w-4 h-4 flex-shrink-0 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 flex-shrink-0 text-muted-foreground" />}
                      </button>
                      {openFaq === i && (
                        <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Pricing card */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
                {internship.thumbnail && (
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-5">
                    <Image src={internship.thumbnail} alt={internship.title} fill className="object-cover" />
                  </div>
                )}

                <div className="mb-5">
                  <div className="flex items-baseline gap-3">
                    <span className="font-syne text-3xl font-bold text-foreground">
                      {formatCurrency(internship.discountPrice || internship.price)}
                    </span>
                    {internship.discountPrice && (
                      <span className="text-muted-foreground line-through text-lg">
                        {formatCurrency(internship.price)}
                      </span>
                    )}
                  </div>
                  {internship.discountPrice && (
                    <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                      {Math.round(((internship.price - internship.discountPrice) / internship.price) * 100)}% off — Limited time
                    </span>
                  )}
                </div>

                <div className="space-y-3 mb-5">
                  <Button className="w-full" size="lg" variant="gradient" leftIcon={<Zap className="w-4 h-4" />}>
                    Enroll Now
                  </Button>
                  <Button className="w-full" size="lg" variant="outline" leftIcon={<ShoppingCart className="w-4 h-4" />} onClick={handleAddToCart}>
                    Add to Cart
                  </Button>
                </div>

                <div className="space-y-2.5 text-sm">
                  {[
                    { icon: Clock, text: `${internship.duration} weeks duration` },
                    { icon: BookOpen, text: `${internship.curriculum.length} weeks curriculum` },
                    { icon: Award, text: 'Certificate of completion' },
                    { icon: Users, text: 'Mentorship included' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2.5 text-muted-foreground">
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mentor card */}
              {internship.mentor && (
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-semibold text-foreground mb-4">Your Mentor</h3>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      M
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-foreground">{internship.mentor.title}</div>
                      {internship.mentor.experience && (
                        <div className="text-xs text-muted-foreground">{internship.mentor.experience}+ years experience</div>
                      )}
                      {internship.mentor.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-xs font-medium">{internship.mentor.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {internship.mentor.bio && (
                    <p className="text-xs text-muted-foreground mt-3 leading-relaxed line-clamp-3">
                      {internship.mentor.bio}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
