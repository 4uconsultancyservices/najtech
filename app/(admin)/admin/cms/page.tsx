'use client';

import { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import {
  Layout, Plus, Save, Eye, GripVertical, ToggleRight,
  Trash2, Settings, Loader2, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toaster';

interface CMSSection {
  _id?: string;
  type: string;
  title?: string;
  data: Record<string, unknown>;
  order: number;
  isEnabled: boolean;
}

const SECTION_TYPES = [
  { type: 'hero', label: 'Hero Section', icon: '🏠' },
  { type: 'stats', label: 'Statistics', icon: '📊' },
  { type: 'featured_internships', label: 'Featured Internships', icon: '📚' },
  { type: 'categories', label: 'Categories', icon: '🏷️' },
  { type: 'why_choose_us', label: 'Why Choose Us', icon: '✨' },
  { type: 'mentors', label: 'Mentors Showcase', icon: '👥' },
  { type: 'testimonials', label: 'Testimonials', icon: '💬' },
  { type: 'success_stories', label: 'Success Stories', icon: '🏆' },
  { type: 'trusted_companies', label: 'Trusted Companies', icon: '🏢' },
  { type: 'certificate_showcase', label: 'Certificate Showcase', icon: '📜' },
  { type: 'faq', label: 'FAQ', icon: '❓' },
  { type: 'newsletter', label: 'Newsletter', icon: '📧' },
  { type: 'contact', label: 'Contact', icon: '📞' },
];

export default function CMSBuilderPage() {
  const [sections, setSections] = useState<CMSSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [showAddPanel, setShowAddPanel] = useState(false);

  useEffect(() => {
    fetch('/api/cms?key=home')
      .then((r) => r.json())
      .then((d) => {
        if (d.data?.sections) setSections(d.data.sections);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const addSection = (type: string) => {
    const sectionType = SECTION_TYPES.find((s) => s.type === type);
    const newSection: CMSSection = {
      type,
      title: sectionType?.label,
      data: {},
      order: sections.length,
      isEnabled: true,
    };
    setSections([...sections, newSection]);
    setShowAddPanel(false);
    toast.success(`Added ${sectionType?.label} section`);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const toggleSection = (index: number) => {
    setSections(sections.map((s, i) =>
      i === index ? { ...s, isEnabled: !s.isEnabled } : s
    ));
  };

  const updateSectionData = (index: number, field: string, value: string) => {
    setSections(sections.map((s, i) =>
      i === index ? { ...s, data: { ...s.data, [field]: value } } : s
    ));
  };

  const saveCMS = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'home',
          title: 'Home Page',
          sections: sections.map((s, i) => ({ ...s, order: i })),
        }),
      });
      const data = await res.json();
      if (data.success) toast.success('CMS saved successfully!');
      else toast.error(data.error || 'Failed to save');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-syne text-2xl font-bold text-foreground">CMS Page Builder</h1>
          <p className="text-muted-foreground text-sm">Drag and reorder sections to customize the home page</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" leftIcon={<Eye className="w-4 h-4" />} onClick={() => window.open('/', '_blank')}>
            Preview
          </Button>
          <Button variant="gradient" leftIcon={<Save className="w-4 h-4" />} loading={saving} onClick={saveCMS}>
            Save Changes
          </Button>
        </div>
      </div>

      {/* Sections list */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layout className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm text-foreground">Home Page Sections</span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{sections.length}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setShowAddPanel(!showAddPanel)}
          >
            Add Section
          </Button>
        </div>

        {/* Add section panel */}
        {showAddPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 border-b border-border bg-muted/40"
          >
            <p className="text-sm font-medium text-foreground mb-3">Choose a section to add:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {SECTION_TYPES.map((s) => (
                <button
                  key={s.type}
                  onClick={() => addSection(s.type)}
                  className="flex items-center gap-2 p-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all text-sm text-left"
                >
                  <span className="text-xl">{s.icon}</span>
                  <span className="text-foreground font-medium text-xs">{s.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {sections.length === 0 ? (
          <div className="text-center py-16">
            <Layout className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No sections yet</p>
            <p className="text-sm text-muted-foreground mt-1">Add sections to build your home page</p>
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={sections}
            onReorder={setSections}
            className="divide-y divide-border"
          >
            {sections.map((section, index) => {
              const sectionMeta = SECTION_TYPES.find((s) => s.type === section.type);
              const isExpanded = expandedSection === index;

              return (
                <Reorder.Item key={section.type + index} value={section}>
                  <div className={`transition-all ${!section.isEnabled ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors">
                      {/* Drag handle */}
                      <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                        <GripVertical className="w-4 h-4" />
                      </div>

                      {/* Icon */}
                      <span className="text-lg">{sectionMeta?.icon || '📄'}</span>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground">{section.title || sectionMeta?.label}</div>
                        <div className="text-xs text-muted-foreground font-mono">{section.type}</div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleSection(index)}
                          className={`p-1.5 rounded-lg transition-colors ${section.isEnabled ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20' : 'text-muted-foreground hover:bg-accent'}`}
                          title={section.isEnabled ? 'Disable' : 'Enable'}
                        >
                          <ToggleRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setExpandedSection(isExpanded ? null : index)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeSection(index)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setExpandedSection(isExpanded ? null : index)}>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded settings */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="px-4 pb-4 space-y-3 border-t border-border bg-muted/30"
                      >
                        <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-foreground mb-1">Section Title</label>
                            <input
                              value={section.title || ''}
                              onChange={(e) => {
                                setSections(sections.map((s, i) => i === index ? { ...s, title: e.target.value } : s));
                              }}
                              className="w-full h-8 px-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                          {section.type === 'hero' && (
                            <>
                              <div>
                                <label className="block text-xs font-medium text-foreground mb-1">Headline</label>
                                <input
                                  value={(section.data.headline as string) || ''}
                                  onChange={(e) => updateSectionData(index, 'headline', e.target.value)}
                                  placeholder="Your main headline..."
                                  className="w-full h-8 px-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="block text-xs font-medium text-foreground mb-1">Subtext</label>
                                <textarea
                                  value={(section.data.subtext as string) || ''}
                                  onChange={(e) => updateSectionData(index, 'subtext', e.target.value)}
                                  placeholder="Supporting description..."
                                  rows={2}
                                  className="w-full px-2.5 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                />
                              </div>
                            </>
                          )}
                          {section.type === 'newsletter' && (
                            <div>
                              <label className="block text-xs font-medium text-foreground mb-1">CTA Text</label>
                              <input
                                value={(section.data.ctaText as string) || ''}
                                onChange={(e) => updateSectionData(index, 'ctaText', e.target.value)}
                                placeholder="Subscribe Now"
                                className="w-full h-8 px-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                              />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        )}
      </div>
    </div>
  );
}
