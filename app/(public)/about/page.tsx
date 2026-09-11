import { generateMetadata as genMeta } from '@/lib/seo';
import { Target, Heart, Globe, TrendingUp, Users, Award, BookOpen, Star } from 'lucide-react';
import { DirectorDesk } from '@/components/home/DirectorDesk';

export const metadata = genMeta({
  title: 'About Us',
  description: 'Learn about NajTech — our mission to democratize career opportunities through virtual internships.',
});

const values = [
  { icon: Target, title: 'Mission-Driven', desc: 'Every decision we make is guided by our mission to democratize career development for all students.' },
  { icon: Heart, title: 'Student-First', desc: 'We obsess over student outcomes. Your success is our success.' },
  { icon: Globe, title: 'Inclusive', desc: 'We believe geography should never be a barrier to opportunity.' },
  { icon: TrendingUp, title: 'Excellence', desc: 'We set high standards for our mentors, curriculum, and student experience.' },
];

const stats = [
  { icon: Users, value: '50,000+', label: 'Students Trained' },
  { icon: Award, value: '45,000+', label: 'Certificates Issued' },
  { icon: BookOpen, value: '200+', label: 'Programs Offered' },
  { icon: Star, value: '4.9/5', label: 'Average Rating' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-syne text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Democratizing Career<br />Development for Everyone
          </h1>
          <p className="text-white/80 text-xl leading-relaxed max-w-2xl mx-auto">
            NajTech was founded with a single belief: every ambitious student deserves access to world-class mentorship, regardless of where they live.
          </p>
        </div>
      </div>

      {/* Story */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-primary text-sm font-semibold uppercase tracking-wider">Our Story</span>
              <h2 className="font-syne text-3xl font-bold text-foreground mt-2 mb-5">
                Born from Frustration, Built with Purpose
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  NajTech was founded in 2022 by a team of engineers and educators who experienced first-hand the barriers preventing talented students from Tier-2 and Tier-3 cities from accessing quality internships.
                </p>
                <p>
                  We built a platform that connects students with industry mentors regardless of geography — a virtual internship ecosystem where skill and determination are the only prerequisites.
                </p>
                <p>
                  Today, NajTech hosts over 200 programs across technology, design, business, and more, with 50,000+ students trained and placed at companies across India and globally.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map(({ icon: Icon, value, label }) => (
                <div key={label} className="bg-card border border-border rounded-2xl p-5 text-center hover:border-primary/40 hover:shadow-lg transition-all">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="font-syne font-bold text-2xl text-foreground">{value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Director Desk */}
      <DirectorDesk />

      {/* Values */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Our Values</span>
            <h2 className="font-syne text-3xl font-bold text-foreground mt-2">What Drives Us</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-background border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-lg transition-all">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-syne font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
