'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Palette, Save, Loader2, RefreshCw } from 'lucide-react';
import { themeSchema, type ThemeInput } from '@/lib/validations';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toaster';

const FONT_OPTIONS = [
  'Plus Jakarta Sans', 'Inter', 'Poppins', 'DM Sans', 'Nunito',
  'Outfit', 'Syne', 'Space Grotesk',
];

const PRESET_THEMES = [
  { name: 'IndigoVault', primary: '#6366f1', secondary: '#8b5cf6', accent: '#06b6d4' },
  { name: 'Emerald', primary: '#10b981', secondary: '#059669', accent: '#6366f1' },
  { name: 'Sunset', primary: '#f97316', secondary: '#ef4444', accent: '#a855f7' },
  { name: 'Ocean', primary: '#0ea5e9', secondary: '#0284c7', accent: '#10b981' },
  { name: 'Rose', primary: '#f43f5e', secondary: '#e11d48', accent: '#f97316' },
  { name: 'Violet', primary: '#7c3aed', secondary: '#6d28d9', accent: '#ec4899' },
];

export default function ThemeBuilderPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ThemeInput>({ resolver: zodResolver(themeSchema) });

  const watchedValues = watch();

  useEffect(() => {
    fetch('/api/admin/theme')
      .then((r) => r.json())
      .then((d) => { if (d.data) reset(d.data); })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [reset]);

  const onSubmit = async (data: ThemeInput) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/theme', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Theme saved successfully!');
      } else {
        toast.error(result.error || 'Failed to save theme');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset: typeof PRESET_THEMES[0]) => {
    setValue('primaryColor', preset.primary);
    setValue('secondaryColor', preset.secondary);
    setValue('accentColor', preset.accent);
    toast.info(`Applied "${preset.name}" theme preset`);
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-syne text-2xl font-bold text-foreground">Theme Builder</h1>
        <p className="text-muted-foreground text-sm">Customize your platform's look and feel globally</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Site Identity */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="font-syne font-semibold text-foreground">Site Identity</h2>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Site Name</label>
            <input
              {...register('siteName')}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
            {errors.siteName && <p className="text-red-500 text-xs mt-1">{errors.siteName.message}</p>}
          </div>
        </div>

        {/* Color Presets */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-syne font-semibold text-foreground mb-4">Color Presets</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {PRESET_THEMES.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-accent transition-all"
              >
                <div className="flex gap-1">
                  <div className="w-4 h-8 rounded-l-full" style={{ background: preset.primary }} />
                  <div className="w-4 h-8" style={{ background: preset.secondary }} />
                  <div className="w-4 h-8 rounded-r-full" style={{ background: preset.accent }} />
                </div>
                <span className="text-xs text-muted-foreground font-medium">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-syne font-semibold text-foreground mb-4">Brand Colors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: 'primaryColor' as const, label: 'Primary Color' },
              { name: 'secondaryColor' as const, label: 'Secondary Color' },
              { name: 'accentColor' as const, label: 'Accent Color' },
            ].map(({ name, label }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={watchedValues[name] || '#6366f1'}
                    onChange={(e) => setValue(name, e.target.value)}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer p-0.5 bg-transparent"
                  />
                  <input
                    {...register(name)}
                    className="flex-1 h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono"
                  />
                </div>
                {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]?.message}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Typography & Layout */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-syne font-semibold text-foreground mb-4">Typography & Layout</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Font Family</label>
              <select {...register('fontFamily')} className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Font Size</label>
              <select {...register('fontSize')} className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="sm">Small</option>
                <option value="md">Medium (Default)</option>
                <option value="lg">Large</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Border Radius</label>
              <select {...register('borderRadius')} className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="none">None</option>
                <option value="sm">Small</option>
                <option value="md">Medium (Default)</option>
                <option value="lg">Large</option>
                <option value="full">Full</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" {...register('darkMode')} className="w-4 h-4 rounded border-border" />
              <span className="text-sm font-medium text-foreground">Enable Dark Mode by Default</span>
            </label>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-syne font-semibold text-foreground mb-4">Preview</h2>
          <div className="p-6 rounded-xl border border-border bg-background space-y-4">
            <div style={{ fontFamily: watchedValues.fontFamily }}>
              <h3 className="text-2xl font-bold mb-2" style={{ color: watchedValues.primaryColor }}>
                {watchedValues.siteName || 'NajTech'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">Premium virtual internship platform</p>
              <div className="flex gap-3">
                <button
                  className="px-4 py-2 text-sm font-semibold text-white rounded-lg"
                  style={{ background: watchedValues.primaryColor, borderRadius: { none: 0, sm: 4, md: 8, lg: 12, full: 999 }[watchedValues.borderRadius || 'md'] }}
                >
                  Get Started
                </button>
                <button
                  className="px-4 py-2 text-sm font-semibold rounded-lg border-2"
                  style={{ borderColor: watchedValues.primaryColor, color: watchedValues.primaryColor, borderRadius: { none: 0, sm: 4, md: 8, lg: 12, full: 999 }[watchedValues.borderRadius || 'md'] }}
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" variant="gradient" loading={loading} leftIcon={<Save className="w-4 h-4" />}>
            Save Theme
          </Button>
          <Button type="button" variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={() => reset()}>
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}
