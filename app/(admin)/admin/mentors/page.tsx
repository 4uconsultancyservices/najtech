'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck, Plus, Search, Loader2, Star, Briefcase,
  Edit, Trash2, X, Save, XIcon, Globe, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toaster';

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
  isActive: boolean;
  userId?: { name?: string; email?: string; avatar?: string };
}

interface MentorFormData {
  userId: string;
  title: string;
  specialization: string;
  experience: number;
  bio: string;
  linkedin: string;
  github: string;
  website: string;
  isActive: boolean;
}

const defaultForm: MentorFormData = {
  userId: '',
  title: '',
  specialization: '',
  experience: 1,
  bio: '',
  linkedin: '',
  github: '',
  website: '',
  isActive: true,
};

export default function AdminMentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<MentorFormData>(defaultForm);
  const [total, setTotal] = useState(0);

  const fetchMentors = () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '20' });
    if (search) params.set('search', search);
    fetch(`/api/mentors?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setMentors(d.data || []);
        setTotal(d.pagination?.total || d.data?.length || 0);
      })
      .catch(() => toast.error('Failed to load mentors'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMentors(); }, [search]);

  const openCreate = () => {
    setForm(defaultForm);
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (mentor: Mentor) => {
    setForm({
      userId: (mentor.userId as { _id?: string } & typeof mentor.userId)?._id || '',
      title: mentor.title,
      specialization: mentor.specialization.join(', '),
      experience: mentor.experience,
      bio: mentor.bio,
      linkedin: mentor.linkedin || '',
      github: mentor.github || '',
      website: mentor.website || '',
      isActive: mentor.isActive,
    });
    setEditId(mentor._id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.bio || !form.userId) {
      toast.error('User ID, title and bio are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        specialization: form.specialization
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const url = editId ? `/api/mentors/${editId}` : '/api/mentors';
      const method = editId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(editId ? 'Mentor updated!' : 'Mentor created!');
        setShowForm(false);
        setEditId(null);
        setForm(defaultForm);
        fetchMentors();
      } else {
        toast.error(data.error || 'Failed to save mentor');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const deleteMentor = async (id: string) => {
    if (!confirm('Delete this mentor profile?')) return;
    const res = await fetch(`/api/mentors/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      toast.success('Mentor deleted');
      fetchMentors();
    } else {
      toast.error('Failed to delete mentor');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    const res = await fetch(`/api/mentors/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    });
    const data = await res.json();
    if (data.success) {
      fetchMentors();
    } else {
      toast.error('Failed to update status');
    }
  };

  const updateForm = (field: keyof MentorFormData, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-syne text-2xl font-bold text-foreground">Mentors</h1>
          <p className="text-muted-foreground text-sm">{total} mentor profiles</p>
        </div>
        <Button variant="gradient" leftIcon={<Plus className="w-4 h-4" />} onClick={openCreate}>
          Add Mentor
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search mentors by name or skill..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 h-10 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
        />
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-syne font-bold text-xl text-foreground">
                    {editId ? 'Edit Mentor' : 'Add New Mentor'}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {editId ? 'Update mentor profile details' : 'Create a new mentor profile'}
                  </p>
                </div>
                <button
                  onClick={() => { setShowForm(false); setEditId(null); }}
                  className="p-2 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* User ID */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    User ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.userId}
                    onChange={(e) => updateForm('userId', e.target.value)}
                    placeholder="MongoDB ObjectId of the user account"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    The user must have the &apos;mentor&apos; role assigned first
                  </p>
                </div>

                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Professional Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) => updateForm('title', e.target.value)}
                    placeholder="e.g. Senior Full-Stack Engineer at Google"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                {/* Specializations */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Specializations
                  </label>
                  <input
                    value={form.specialization}
                    onChange={(e) => updateForm('specialization', e.target.value)}
                    placeholder="React, Node.js, MongoDB, TypeScript (comma-separated)"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={form.experience}
                    onChange={(e) => updateForm('experience', parseInt(e.target.value) || 0)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
                  <div className="flex items-center gap-3 h-10">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => updateForm('isActive', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                    </label>
                    <span className="text-sm text-foreground">
                      {form.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Bio */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Bio <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => updateForm('bio', e.target.value)}
                    rows={3}
                    placeholder="Professional background, expertise, and mentoring approach..."
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>

                {/* Social Links */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    LinkedIn URL
                  </label>
                  <div className="relative">
                    <XIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      value={form.linkedin}
                      onChange={(e) => updateForm('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    GitHub URL
                  </label>
                  <div className="relative">
                    <XIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      value={form.github}
                      onChange={(e) => updateForm('github', e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Personal Website
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      value={form.website}
                      onChange={(e) => updateForm('website', e.target.value)}
                      placeholder="https://yourwebsite.com"
                      className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-5 border-t border-border">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setShowForm(false); setEditId(null); }}
                >
                  Cancel
                </Button>
                <Button
                  variant="gradient"
                  className="flex-1"
                  loading={saving}
                  leftIcon={<Save className="w-4 h-4" />}
                  onClick={handleSave}
                >
                  {editId ? 'Update Mentor' : 'Create Mentor'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mentors Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : mentors.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="font-syne text-lg font-semibold text-foreground mb-1">No mentors yet</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Add your first mentor to start building the team
          </p>
          <Button variant="gradient" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={openCreate}>
            Add First Mentor
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {mentors.map((mentor, i) => (
            <motion.div
              key={mentor._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
            >
              <div className={`bg-card border rounded-2xl p-5 transition-all duration-200 ${mentor.isActive ? 'border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5' : 'border-border opacity-60'}`}>
                {/* Top row */}
                <div className="flex items-start gap-3 mb-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-syne font-bold text-base flex-shrink-0">
                    {mentor.userId?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'M'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-syne font-bold text-foreground text-sm truncate">
                        {mentor.userId?.name || 'Unnamed Mentor'}
                      </h3>
                      <span className={`flex-shrink-0 w-2 h-2 rounded-full ${mentor.isActive ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                    </div>
                    <p className="text-primary text-xs font-medium truncate">{mentor.title}</p>
                    <p className="text-muted-foreground text-xs truncate">{mentor.userId?.email}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEdit(mentor)}
                      className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-blue-500"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleActive(mentor._id, mentor.isActive)}
                      className={`p-1.5 rounded-lg transition-colors ${mentor.isActive ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20' : 'text-muted-foreground hover:bg-accent'}`}
                      title={mentor.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {mentor.isActive
                        ? <ToggleRight className="w-3.5 h-3.5" />
                        : <ToggleLeft className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => deleteMentor(mentor._id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-muted-foreground hover:text-red-500"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="font-medium text-foreground">{mentor.rating.toFixed(1)}</span>
                    <span>({mentor.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{mentor.experience}+ yrs</span>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                  {mentor.bio}
                </p>

                {/* Specializations */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {mentor.specialization.slice(0, 4).map((spec) => (
                    <span
                      key={spec}
                      className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                  {mentor.specialization.length > 4 && (
                    <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[11px]">
                      +{mentor.specialization.length - 4}
                    </span>
                  )}
                </div>

                {/* Social links */}
                <div className="flex items-center gap-2 pt-3 border-t border-border">
                  {mentor.linkedin && (
                    <a
                      href={mentor.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg border border-border hover:border-primary/40 hover:text-primary transition-all text-muted-foreground"
                    >
                      <XIcon className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {mentor.github && (
                    <a
                      href={mentor.github}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg border border-border hover:border-primary/40 hover:text-primary transition-all text-muted-foreground"
                    >
                      <XIcon className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {mentor.website && (
                    <a
                      href={mentor.website}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg border border-border hover:border-primary/40 hover:text-primary transition-all text-muted-foreground"
                    >
                      <Globe className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {!mentor.linkedin && !mentor.github && !mentor.website && (
                    <span className="text-xs text-muted-foreground">No social links added</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}