'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock, Star, Users, BookOpen, ArrowRight, Award, ShoppingCart, Check } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store';
import { toast } from '@/components/ui/Toaster';

interface InternshipCardProps {
  internship: {
    _id: string;
    title: string;
    slug: string;
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
    mentor?: { title?: string; avatar?: string };
    category?: { name?: string; color?: string };
  };
  index?: number;
}

export function InternshipCard({ internship, index = 0 }: InternshipCardProps) {
  const { items, addItem } = useCartStore();
  const isInCart = items.some((item) => item.internshipId === internship._id);

  const discount = internship.discountPrice
    ? Math.round(((internship.price - internship.discountPrice) / internship.price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInCart) {
      toast.info('Item is already in your cart!');
      return;
    }
    addItem({
      internshipId: internship._id,
      title: internship.title,
      slug: internship.slug,
      thumbnail: internship.thumbnail,
      price: internship.price,
      discountPrice: internship.discountPrice,
      duration: internship.duration,
    });
    toast.success('Added to cart!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gradient-to-br from-indigo-500/20 to-purple-500/20 overflow-hidden">
          {internship.thumbnail ? (
            <Image
              src={internship.thumbnail}
              alt={internship.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-primary/40" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {internship.category && (
              <span
                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white backdrop-blur-sm"
                style={{ background: internship.category.color || '#6366f1' }}
              >
                {internship.category.name}
              </span>
            )}
            {discount > 0 && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500 text-white">
                {discount}% OFF
              </span>
            )}
          </div>

          {internship.certificate && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
              <Award className="w-3 h-3" />
              Certificate
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-syne font-bold text-foreground text-lg leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {internship.title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
            {internship.shortDescription}
          </p>

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {internship.skills.slice(0, 3).map((skill) => (
              <span key={skill} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
                {skill}
              </span>
            ))}
            {internship.skills.length > 3 && (
              <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs">
                +{internship.skills.length - 3}
              </span>
            )}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{internship.duration}w</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="font-medium text-foreground">{internship.rating.toFixed(1)}</span>
              <span>({internship.reviewCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>{internship.enrollmentCount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Price & CTA */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-syne font-bold text-xl text-foreground">
                {formatCurrency(internship.discountPrice || internship.price)}
              </span>
              {internship.discountPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatCurrency(internship.price)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={isInCart ? 'secondary' : 'ghost'}
                onClick={handleAddToCart}
                title={isInCart ? 'In Cart' : 'Add to Cart'}
                aria-label="Add to cart"
                className="px-2.5"
              >
                {isInCart ? <Check className="w-4 h-4 text-emerald-500" /> : <ShoppingCart className="w-4 h-4 text-muted-foreground hover:text-foreground" />}
              </Button>
              <Link href={`/internships/${internship.slug}`}>
                <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  View
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

