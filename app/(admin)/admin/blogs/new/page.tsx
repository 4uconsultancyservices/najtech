'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, ArrowLeft, Eye, Tag, X } from 'lucide-react';
import Link from 'next/link';
import { blogSchema, type BlogInput } from '@/lib/validations';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toaster';

export default function NewBlogPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<BlogInput>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      status: 'draft',
      isFeatured: false,
      tags: [],
    },
  });

  const status = watch('status');

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (tag && !tags.includes(tag)) {
      const newTags = [...tags, tag];
      setTags(newTags);
      setValue('tags', newTags);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    const newTags = tags.filter((t) => t !== tag);
    setTags(newTags);
    setValue('tags', newTags);
  };

  const onSubmit = async (data: BlogInput) => {
    setSaving(true);
    try {
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, tags }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Blog post created!');
        router.push('/admin/blogs');
      } else {
        toast.error(result.error || 'Failed to create blog');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/blogs">
          <button className="p-2 rounded-lg border border-border hover:bg-accent transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
        </Link>
        <div>
          <h1 className="font-syne text-2xl font-bold text-foreground">Write New Post</h1>
          <p className="text-muted-foreground text-sm">Create and publish a blog article</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Title *</label>
                <input
                  {...register('title')}
                  placeholder="Write a compelling headline..."
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-background text-foreground text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground placeholder:font-normal"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Excerpt *</label>
                <textarea
                  {...register('excerpt')}
                  rows={2}
                  placeholder="Brief description shown in listings (150-200 chars)..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
                />
                {errors.excerpt && <p className="text-red-500 text-xs mt-1">{errors.excerpt.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Content *</label>
                <textarea
                  {...register('content')}
                  rows={18}
                  placeholder="Write your blog content here... (Markdown supported)"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none font-mono leading-relaxed"
                />
                {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm text-foreground">Tags</h3>
              </div>
              <div className="flex gap-2 mb-3">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add tag and press Enter"
                  className="flex-1 h-9 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <Button type="button" size="sm" variant="outline" onClick={addTag}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium">
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Publish settings */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-syne font-semibold text-foreground mb-4">Publish Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Status</label>
                  <select
                    {...register('status')}
                    className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Featured Image URL</label>
                  <input
                    {...register('thumbnail')}
                    placeholder="https://..."
                    className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('isFeatured')} className="w-4 h-4 rounded border-border" />
                  <span className="text-sm text-foreground">Featured Post</span>
                </label>
              </div>

              <div className="flex gap-2 mt-5">
                <Button type="submit" variant="gradient" className="flex-1" loading={saving} leftIcon={<Save className="w-4 h-4" />}>
                  {status === 'published' ? 'Publish' : 'Save Draft'}
                </Button>
              </div>
            </div>

            {/* SEO preview */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-syne font-semibold text-foreground mb-3">SEO Meta</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Meta Title (optional)</label>
                  <input
                    placeholder="Defaults to post title"
                    className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Meta Description (optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Defaults to excerpt"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
