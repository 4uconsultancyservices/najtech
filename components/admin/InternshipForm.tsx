'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, Plus, X, BookOpen, Layers, DollarSign, Award, Tag, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toaster';
import Link from 'next/link';

interface MentorOption {
  _id: string;
  title: string;
  userId?: { name: string; email: string };
}

interface CategoryOption {
  _id: string;
  name: string;
  slug: string;
}

interface InternshipFormProps {
  initialData?: any;
  isEditing?: boolean;
  internshipId?: string;
}

export function InternshipForm({ initialData, isEditing = false, internshipId }: InternshipFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mentors, setMentors] = useState<MentorOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  // Form State
  const [title, setTitle] = useState(initialData?.title || '');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [mentorId, setMentorId] = useState(initialData?.mentorId?._id || initialData?.mentorId || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId?._id || initialData?.categoryId || '');
  const [duration, setDuration] = useState<number>(initialData?.duration || 12);
  const [price, setPrice] = useState<number>(initialData?.price || 9999);
  const [discountPrice, setDiscountPrice] = useState<number | undefined>(initialData?.discountPrice || 6999);
  const [currency, setCurrency] = useState(initialData?.currency || 'INR');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>(initialData?.status || 'published');
  const [isFeatured, setIsFeatured] = useState<boolean>(initialData?.isFeatured ?? true);
  const [certificate, setCertificate] = useState<boolean>(initialData?.certificate ?? true);

  // Array inputs
  const [skills, setSkills] = useState<string[]>(initialData?.skills || ['React', 'Node.js', 'MongoDB', 'TypeScript']);
  const [skillInput, setSkillInput] = useState('');

  const [requirements, setRequirements] = useState<string[]>(initialData?.requirements || ['Basic HTML/CSS knowledge', 'JavaScript fundamentals']);
  const [reqInput, setReqInput] = useState('');

  const [outcomes, setOutcomes] = useState<string[]>(initialData?.outcomes || ['Build full-stack applications', 'Deploy to production cloud']);
  const [outcomeInput, setOutcomeInput] = useState('');

  const [tags, setTags] = useState<string[]>(initialData?.tags || ['web', 'react', 'nodejs', 'fullstack']);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    // Fetch Mentors
    fetch('/api/mentors?limit=100')
      .then((res) => res.json())
      .then((data) => setMentors(data.data || []))
      .catch(() => toast.error('Failed to load mentors list'));

    // Fetch Categories
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.data || []))
      .catch(() => toast.error('Failed to load categories list'));
  }, []);

  const addArrayItem = (input: string, setInput: (v: string) => void, list: string[], setList: (v: string[]) => void) => {
    if (!input.trim()) return;
    if (list.includes(input.trim())) return;
    setList([...list, input.trim()]);
    setInput('');
  };

  const removeArrayItem = (itemToRemove: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.filter((item) => item !== itemToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || title.length < 5) {
      toast.error('Title must be at least 5 characters');
      return;
    }
    if (!shortDescription.trim() || shortDescription.length < 20) {
      toast.error('Short description must be at least 20 characters');
      return;
    }
    if (!description.trim() || description.length < 50) {
      toast.error('Full description must be at least 50 characters');
      return;
    }
    if (!mentorId) {
      toast.error('Please select a mentor');
      return;
    }
    if (!categoryId) {
      toast.error('Please select a category');
      return;
    }

    setLoading(true);
    const payload = {
      title,
      shortDescription,
      description,
      mentorId,
      categoryId,
      duration: Number(duration),
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      currency,
      status,
      isFeatured,
      certificate,
      skills,
      requirements,
      outcomes,
      tags,
    };

    try {
      const url = isEditing ? `/api/internships/${internshipId}` : '/api/internships';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(isEditing ? 'Internship updated successfully!' : 'Internship created successfully!');
        router.push('/admin/internships');
        router.refresh();
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/internships">
            <button type="button" className="p-2 rounded-xl border border-border hover:bg-accent transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
          </Link>
          <div>
            <h1 className="font-syne text-2xl font-bold text-foreground">
              {isEditing ? 'Edit Internship Program' : 'Create New Internship'}
            </h1>
            <p className="text-xs text-muted-foreground">Fill in details, mentor assignment, curriculum settings, and pricing.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/internships">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button type="submit" variant="gradient" loading={loading} leftIcon={<Save className="w-4 h-4" />}>
            {isEditing ? 'Save Changes' : 'Create Program'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* General Info Card */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="font-syne font-bold text-lg text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              General Details
            </h2>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">Program Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Full-Stack Web Development Bootcamp"
                className="w-full h-11 px-3.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">Short Summary * (Max 300 chars)</label>
              <textarea
                rows={2}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Brief summary displayed on cards and search results..."
                className="w-full p-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">Full Program Description *</label>
              <textarea
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed curriculum overview, prerequisites, and learning methodology..."
                className="w-full p-3.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
          </div>

          {/* Skills & Learning Outcomes */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
            <h2 className="font-syne font-bold text-lg text-foreground flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Skills & Outcomes
            </h2>

            {/* Skills */}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">Skills Taught</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addArrayItem(skillInput, setSkillInput, skills, setSkills); } }}
                  placeholder="e.g. React, Node.js, Docker..."
                  className="flex-1 h-10 px-3 rounded-xl border border-border bg-background text-sm"
                />
                <Button type="button" size="sm" variant="outline" onClick={() => addArrayItem(skillInput, setSkillInput, skills, setSkills)}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                    {s}
                    <button type="button" onClick={() => removeArrayItem(s, skills, setSkills)} className="hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                  </span>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">Requirements / Prerequisites</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={reqInput}
                  onChange={(e) => setReqInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addArrayItem(reqInput, setReqInput, requirements, setRequirements); } }}
                  placeholder="e.g. Basic HTML/CSS knowledge..."
                  className="flex-1 h-10 px-3 rounded-xl border border-border bg-background text-sm"
                />
                <Button type="button" size="sm" variant="outline" onClick={() => addArrayItem(reqInput, setReqInput, requirements, setRequirements)}>Add</Button>
              </div>
              <div className="space-y-1.5">
                {requirements.map((req) => (
                  <div key={req} className="flex items-center justify-between p-2.5 rounded-lg bg-muted text-xs font-medium text-foreground">
                    <span>• {req}</span>
                    <button type="button" onClick={() => removeArrayItem(req, requirements, setRequirements)} className="text-muted-foreground hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Outcomes */}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">Career Outcomes</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={outcomeInput}
                  onChange={(e) => setOutcomeInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addArrayItem(outcomeInput, setOutcomeInput, outcomes, setOutcomes); } }}
                  placeholder="e.g. Build 3 production apps..."
                  className="flex-1 h-10 px-3 rounded-xl border border-border bg-background text-sm"
                />
                <Button type="button" size="sm" variant="outline" onClick={() => addArrayItem(outcomeInput, setOutcomeInput, outcomes, setOutcomes)}>Add</Button>
              </div>
              <div className="space-y-1.5">
                {outcomes.map((out) => (
                  <div key={out} className="flex items-center justify-between p-2.5 rounded-lg bg-muted text-xs font-medium text-foreground">
                    <span className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {out}</span>
                    <button type="button" onClick={() => removeArrayItem(out, outcomes, setOutcomes)} className="text-muted-foreground hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Settings Sidebar Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status & Options */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="font-syne font-bold text-sm text-foreground uppercase tracking-wider">Publish Settings</h3>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm font-medium text-foreground"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="space-y-3 pt-2 border-t border-border">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-medium text-foreground">Featured Program</span>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-primary border-border focus:ring-primary"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-medium text-foreground">Certificate Included</span>
                <input
                  type="checkbox"
                  checked={certificate}
                  onChange={(e) => setCertificate(e.target.checked)}
                  className="w-4 h-4 rounded text-primary border-border focus:ring-primary"
                />
              </label>
            </div>
          </div>

          {/* Mentor & Category */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="font-syne font-bold text-sm text-foreground uppercase tracking-wider">Assignment & Category</h3>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm font-medium text-foreground"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Lead Mentor *</label>
              <select
                value={mentorId}
                onChange={(e) => setMentorId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm font-medium text-foreground"
                required
              >
                <option value="">Select Mentor</option>
                {mentors.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.userId?.name || 'Mentor'} — {m.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing & Duration */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="font-syne font-bold text-sm text-foreground uppercase tracking-wider">Pricing & Duration</h3>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Duration (Weeks)</label>
              <input
                type="number"
                min={1}
                max={52}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm font-medium text-foreground"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Regular Price (INR ₹)</label>
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm font-medium text-foreground"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Discount Offer Price (INR ₹)</label>
              <input
                type="number"
                min={0}
                value={discountPrice || ''}
                onChange={(e) => setDiscountPrice(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Optional discount price..."
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm font-medium text-foreground"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
