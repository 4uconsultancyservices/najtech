import { HeroSection } from '@/components/home/HeroSection';
import { StatsSection } from '@/components/home/StatsSection';
import { FeaturedInternships } from '@/components/home/FeaturedInternships';
import { DirectorDesk } from '@/components/home/DirectorDesk';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { CTASection } from '@/components/home/CTASection';
import { generateMetadata as genMeta } from '@/lib/seo';

export const metadata = genMeta({
  title: undefined,
  description: 'NajTech — India\'s premier virtual internship platform. Get mentored, build projects, earn certificates.',
});

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <FeaturedInternships />
      <DirectorDesk />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
