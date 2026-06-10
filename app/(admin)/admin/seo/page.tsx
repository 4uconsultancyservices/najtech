'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Search, Save, Globe, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toaster';

interface SEOPage {
  _id?: string;
  path: string;
  title?: string;
  description?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

const DEFAULT_PAGES = [
  { path: '/', label: 'Home Page' },
  { path: '/internships', label: 'Internships Listing' },
  { path: '/mentors', label: 'Mentors Page' },
  { path: '/blog', label: 'Blog Listing' },
  { path: '/about', label: 'About Us' },
  { path: '/contact', label: 'Contact' },
];

export default function SEOManagementPage() {
  const [pages, setPages] = useState<SEOPage[]>([]);
  const [selectedPath, setSelectedPath] = useState('/');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);

  const { register, handleSubmit, reset, setValue, watch } = useForm<SEOPage>();

  useEffect(() => {
    // Fetch existing SEO pages
    fetch('/api/seo')
      .then((r) => r.json())
      .then((d) => setPages(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Load SEO data for selected path
    const page = pages.find((p) => p.path === selectedPath);
    if (page) {
      reset(page);
      setKeywords(page.keywords || []);
    } else {
      reset({ path: selectedPath });
      setKeywords([]);
    }
  }, [selectedPath, pages, reset]);

  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (kw: string) => {
    setKeywords(keywords.filter((k) => k !== kw));
  };

  const onSubmit = async (data: SEOPage) => {
    setSaving(true);
    try {
      const payload = { ...data, keywords, path: selectedPath };
      const res = await fetch('/api/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('SEO settings saved!');
        setPages((prev) => {
          const idx = prev.findIndex((p) => p.path === selectedPath);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = payload;
            return updated;
          }
          return [...prev, payload];
        });
      } else {
        toast.error(result.error || 'Failed to save');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const titleValue = watch('title') || '';
  const descValue = watch('description') || '';

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-syne text-2xl font-bold text-foreground">SEO Management</h1>
        <p className="text-muted-foreground text-sm">Optimize meta tags, Open Graph, and structured data for each page</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Page selector */}
        <div className="bg-card border border-border rounded-2xl p-4 h-fit">
          <h3 className="font-semibold text-sm text-foreground mb-3">Pages</h3>
          <div className="space-y-1">
            {DEFAULT_PAGES.map((p) => {
              const hasSEO = pages.some((sp) => sp.path === p.path);
              return (
                <button
                  key={p.path}
                  onClick={() => setSelectedPath(p.path)}
                  className={`w-full text-left flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${
                    selectedPath === p.path
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <div>
                    <div className="font-medium">{p.label}</div>
                    <div className="text-xs opacity-70 font-mono">{p.path}</div>
                  </div>
                  {hasSEO && (
                    <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" title="SEO configured" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* SEO form */}
        <div className="lg:col-span-2 space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic SEO */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Search className="w-4 h-4 text-primary" />
                <h3 className="font-syne font-semibold text-foreground">Basic SEO</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Meta Title</label>
                <input
                  {...register('title')}
                  placeholder="Page title (50-60 chars recommended)"
                  maxLength={70}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-muted-foreground">Appears in browser tab and search results</p>
                  <span className={`text-xs ${titleValue.length > 60 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                    {titleValue.length}/60
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Meta Description</label>
                <textarea
                  {...register('description')}
                  placeholder="Page description (150-160 chars recommended)"
                  maxLength={200}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-muted-foreground">Shown in search engine results</p>
                  <span className={`text-xs ${descValue.length > 160 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                    {descValue.length}/160
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Keywords</label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    placeholder="Add keyword and press Enter"
                    className="flex-1 h-9 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                  <Button type="button" size="sm" variant="outline" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={addKeyword}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {keywords.map((kw) => (
                    <span key={kw} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium">
                      {kw}
                      <button type="button" onClick={() => removeKeyword(kw)} className="hover:text-red-500 transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Canonical URL</label>
                <input
                  {...register('canonicalUrl')}
                  placeholder="https://internvault.com/page"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('noIndex')} className="w-4 h-4 rounded border-border" />
                <span className="text-sm text-foreground">No Index (prevent search engines from indexing)</span>
              </label>
            </div>

            {/* Open Graph */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Globe className="w-4 h-4 text-primary" />
                <h3 className="font-syne font-semibold text-foreground">Open Graph (Social Media)</h3>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">OG Title</label>
                <input
                  {...register('ogTitle')}
                  placeholder="Leave blank to use meta title"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">OG Description</label>
                <textarea
                  {...register('ogDescription')}
                  placeholder="Leave blank to use meta description"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">OG Image URL</label>
                <input
                  {...register('ogImage')}
                  placeholder="https://..."
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
            </div>

            {/* Search preview */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-syne font-semibold text-foreground mb-3">Search Preview</h3>
              <div className="p-4 bg-background rounded-xl border border-border/50">
                <div className="text-xs text-muted-foreground mb-1">internvault.com{selectedPath}</div>
                <div className="text-blue-600 dark:text-blue-400 text-lg font-medium leading-snug mb-1">
                  {titleValue || 'Page Title — NajTech'}
                </div>
                <div className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {descValue || 'Page description will appear here in search engine results...'}
                </div>
              </div>
            </div>

            <Button type="submit" variant="gradient" loading={saving} leftIcon={<Save className="w-4 h-4" />}>
              Save SEO Settings
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
