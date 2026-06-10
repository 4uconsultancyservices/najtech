import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-600 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="relative z-10 text-white text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-syne text-4xl font-bold mb-4">NajTech</h2>
          <p className="text-white/80 text-lg leading-relaxed">
            India&apos;s premier virtual internship platform. Build real skills, get mentored by industry experts, and launch your dream career.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-6 text-center">
            {[
              { value: '50K+', label: 'Students' },
              { value: '200+', label: 'Programs' },
              { value: '4.9★', label: 'Rating' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="font-syne text-2xl font-bold text-white">{value}</div>
                <div className="text-white/60 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Floating circles */}
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
      </div>

      {/* Right panel - auth forms */}
      <div className="flex-1 flex flex-col">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-syne font-bold text-lg text-foreground">
              Intern<span className="text-primary">NajTech</span>
            </span>
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
