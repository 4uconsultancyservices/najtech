'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Clock, Award, CheckCircle2, Circle, Play, FileText, Download,
  ExternalLink, Code2, Send, ChevronDown, ChevronUp, Loader2, Sparkles,
  ArrowLeft, ArrowRight, User, ShieldCheck, AlertCircle, Check, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toaster';
import { formatDate } from '@/lib/utils';

interface Resource {
  _id?: string;
  title: string;
  type: 'video' | 'pdf' | 'link' | 'assignment';
  url: string;
  duration?: number;
  isPreview?: boolean;
}

interface CurriculumWeek {
  _id?: string;
  week: number;
  title: string;
  description: string;
  topics: string[];
  resources: Resource[];
}

interface Internship {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail?: string;
  duration: number;
  skills: string[];
  outcomes: string[];
  curriculum: CurriculumWeek[];
  mentorId?: { name?: string; title?: string; company?: string; avatar?: string };
  categoryId?: { name?: string; color?: string };
  certificate?: boolean;
}

interface Enrollment {
  _id: string;
  progress: number;
  completedLessons: string[];
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  startDate: string;
  certificateId?: { _id?: string; certificateNumber?: string; issueDate?: string };
  internshipId: Internship;
}

interface AssignmentSubmission {
  _id: string;
  weekNumber: number;
  title: string;
  status: 'pending' | 'submitted' | 'reviewed' | 'resubmit';
  submittedAt?: string;
  mentorFeedback?: string;
  mentorRating?: number;
  files?: Array<{ filename: string; url: string }>;
}

export default function InternshipLearningPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [assignments, setAssignments] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'curriculum' | 'assignments' | 'resources' | 'certificate'>('curriculum');
  const [openWeeks, setOpenWeeks] = useState<Record<number, boolean>>({ 1: true });
  const [selectedResource, setSelectedResource] = useState<{ week: number; resource: Resource } | null>(null);
  const [updatingLesson, setUpdatingLesson] = useState<string | null>(null);

  // Assignment Modal
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [submitWeek, setSubmitWeek] = useState(1);
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [submitNotes, setSubmitNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchEnrollmentData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/enrollments/${resolvedParams.id}`);
      const data = await res.json();
      if (data.success && data.data?.enrollment) {
        setEnrollment(data.data.enrollment);
        setAssignments(data.data.assignments || []);

        // Default selected resource to first video in week 1
        const curr = data.data.enrollment.internshipId?.curriculum || [];
        if (curr.length > 0 && curr[0].resources?.length > 0) {
          setSelectedResource({ week: 1, resource: curr[0].resources[0] });
        }
      } else {
        toast.error(data.error || 'Failed to load enrollment');
      }
    } catch {
      toast.error('Error fetching learning portal data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollmentData();
  }, [resolvedParams.id]);

  const toggleWeek = (week: number) => {
    setOpenWeeks((prev) => ({ ...prev, [week]: !prev[week] }));
  };

  const handleToggleLessonComplete = async (lessonKey: string, currentCompleted: boolean) => {
    if (!enrollment) return;
    setUpdatingLesson(lessonKey);
    try {
      const res = await fetch(`/api/enrollments/${enrollment._id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: lessonKey,
          completed: !currentCompleted,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEnrollment((prev) =>
          prev
            ? {
                ...prev,
                progress: data.data.progress,
                completedLessons: data.data.completedLessons,
                status: data.data.status,
              }
            : null
        );
        toast.success(!currentCompleted ? 'Lesson marked as complete!' : 'Progress updated');
      }
    } catch {
      toast.error('Failed to update lesson progress');
    } finally {
      setUpdatingLesson(null);
    }
  };

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollment) return;

    if (!githubUrl.trim() && !demoUrl.trim()) {
      toast.error('Please provide a GitHub Repository URL or Live Demo URL');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/assignments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentId: enrollment._id,
          internshipId: enrollment.internshipId._id,
          weekNumber: submitWeek,
          title: `Week ${submitWeek} Practical Deliverable`,
          githubUrl: githubUrl.trim(),
          demoUrl: demoUrl.trim(),
          notes: submitNotes.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Week ${submitWeek} Assignment submitted for mentor review!`);
        setAssignmentModalOpen(false);
        setGithubUrl('');
        setDemoUrl('');
        setSubmitNotes('');
        fetchEnrollmentData();
      } else {
        toast.error(data.error || 'Failed to submit assignment');
      }
    } catch {
      toast.error('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm font-medium">Loading Internship Workspace...</p>
        </div>
      </div>
    );
  }

  if (!enrollment || !enrollment.internshipId) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="max-w-md mx-auto text-center py-20 bg-card border border-border rounded-3xl p-8 space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="font-syne text-2xl font-bold text-foreground">Program Not Found</h2>
          <p className="text-muted-foreground text-sm">
            You are not enrolled in this program or the enrollment ID is invalid.
          </p>
          <Link href="/my-internships">
            <Button variant="gradient" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Back to My Internships
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const internship = enrollment.internshipId;
  const curriculum = internship.curriculum || [];
  const progress = enrollment.progress || 0;
  const completedLessons = enrollment.completedLessons || [];

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/my-internships"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Internships
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary capitalize">
              {enrollment.status} Program
            </span>
          </div>
        </div>

        {/* Top Header Banner */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                {internship.categoryId && (
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold text-white"
                    style={{ background: internship.categoryId.color || '#6366f1' }}
                  >
                    {internship.categoryId.name}
                  </span>
                )}
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {internship.duration} Weeks Program
                </span>
              </div>

              <h1 className="font-syne text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                {internship.title}
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                {internship.shortDescription || internship.description}
              </p>

              {/* Mentor Card */}
              {internship.mentorId && (
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden relative">
                    {internship.mentorId.avatar ? (
                      <Image src={internship.mentorId.avatar} alt={internship.mentorId.name || 'Mentor'} fill className="object-cover" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">{internship.mentorId.name || 'Industry Mentor'}</div>
                    <div className="text-[11px] text-muted-foreground">{internship.mentorId.title} {internship.mentorId.company ? `at ${internship.mentorId.company}` : ''}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Progress Card Box */}
            <div className="bg-background/80 backdrop-blur-md border border-border p-5 rounded-2xl space-y-3 min-w-[260px] shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground">Overall Completion</span>
                <span className="font-syne font-bold text-lg text-primary">{progress}%</span>
              </div>

              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-full"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                <span>{completedLessons.length} Lessons Completed</span>
                {progress >= 100 ? (
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                  </span>
                ) : (
                  <span>{100 - progress}% Remaining</span>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 border-t border-border pt-4 relative z-10">
            {[
              { id: 'curriculum', label: 'Curriculum & Modules', icon: BookOpen },
              { id: 'assignments', label: 'Assignments & Projects', icon: FileText, badge: assignments.length },
              { id: 'resources', label: 'Starter Assets & Code', icon: Download },
              { id: 'certificate', label: 'Verified Certificate', icon: Award, highlight: progress >= 100 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-background hover:bg-accent text-muted-foreground hover:text-foreground border border-border'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-primary-foreground/20 text-[10px] font-bold">
                      {tab.badge}
                    </span>
                  )}
                  {tab.highlight && (
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: CURRICULUM & MODULES */}
        {activeTab === 'curriculum' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Resource Viewer / Video Player */}
            <div className="lg:col-span-7 space-y-4">
              {selectedResource ? (
                <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-lg space-y-4">
                  <div className="aspect-video relative bg-slate-950 flex items-center justify-center">
                    {selectedResource.resource.type === 'video' ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
                        <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary backdrop-blur-md">
                          <Play className="w-8 h-8 fill-primary ml-1" />
                        </div>
                        <h3 className="font-syne text-lg font-bold">{selectedResource.resource.title}</h3>
                        <p className="text-xs text-white/70">Week {selectedResource.week} Video Tutorial</p>
                        <a
                          href={selectedResource.resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1.5 mt-2"
                        >
                          Watch Video Stream <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
                        <FileText className="w-12 h-12 text-primary" />
                        <h3 className="font-syne text-lg font-bold">{selectedResource.resource.title}</h3>
                        <p className="text-xs text-white/70">Reading & Guide Material</p>
                        <a
                          href={selectedResource.resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1.5"
                        >
                          Open Resource <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-3 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                          Week {selectedResource.week} Lesson
                        </span>
                        <h3 className="font-syne text-xl font-bold text-foreground">
                          {selectedResource.resource.title}
                        </h3>
                      </div>

                      {(() => {
                        const lessonKey = `w${selectedResource.week}_${selectedResource.resource.title}`;
                        const isDone = completedLessons.includes(lessonKey);
                        return (
                          <Button
                            size="sm"
                            variant={isDone ? 'secondary' : 'gradient'}
                            loading={updatingLesson === lessonKey}
                            onClick={() => handleToggleLessonComplete(lessonKey, isDone)}
                            leftIcon={isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Check className="w-4 h-4" />}
                          >
                            {isDone ? 'Completed' : 'Mark Completed'}
                          </Button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-3xl p-12 text-center space-y-3">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
                  <h3 className="font-syne text-lg font-bold text-foreground">Select a Lesson to Start</h3>
                  <p className="text-xs text-muted-foreground">Click on any module from the curriculum menu on the right.</p>
                </div>
              )}
            </div>

            {/* Right Column: Weekly Curriculum Accordion */}
            <div className="lg:col-span-5 space-y-4">
              <h2 className="font-syne text-lg font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-4.5 h-4.5 text-primary" />
                Curriculum Modules
              </h2>

              <div className="space-y-3">
                {curriculum.map((weekData) => {
                  const weekNum = weekData.week;
                  const isOpen = !!openWeeks[weekNum];
                  const resources = weekData.resources || [];
                  const topics = weekData.topics || [];

                  return (
                    <div
                      key={weekNum}
                      className="bg-card border border-border rounded-2xl overflow-hidden transition-all shadow-sm"
                    >
                      {/* Week Header */}
                      <button
                        onClick={() => toggleWeek(weekNum)}
                        className="w-full p-4.5 flex items-center justify-between text-left hover:bg-accent/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary font-syne font-bold text-xs flex items-center justify-center flex-shrink-0">
                            W{weekNum}
                          </div>
                          <div>
                            <h3 className="font-syne font-bold text-sm text-foreground">
                              Week {weekNum}: {weekData.title}
                            </h3>
                            <p className="text-[11px] text-muted-foreground">{resources.length || topics.length} Lessons & Activities</p>
                          </div>
                        </div>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </button>

                      {/* Week Content */}
                      {isOpen && (
                        <div className="px-4.5 pb-4.5 pt-1 space-y-2 border-t border-border/60">
                          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                            {weekData.description}
                          </p>

                          {resources.map((res, idx) => {
                            const lessonKey = `w${weekNum}_${res.title}`;
                            const isDone = completedLessons.includes(lessonKey);
                            const isSelected = selectedResource?.resource.title === res.title;

                            return (
                              <div
                                key={idx}
                                onClick={() => setSelectedResource({ week: weekNum, resource: res })}
                                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                  isSelected
                                    ? 'bg-primary/10 border-primary shadow-sm'
                                    : 'bg-background border-border hover:border-primary/30'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  {isDone ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                  )}
                                  <span className="text-xs font-semibold text-foreground line-clamp-1">{res.title}</span>
                                </div>

                                <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                  {res.type}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ASSIGNMENTS & PROJECT DELIVERABLES */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-syne text-xl font-bold text-foreground">Project Deliverables & Assignments</h2>
                <p className="text-xs text-muted-foreground">Submit your weekly practical code repositories and live demos for mentor evaluation.</p>
              </div>
              <Button
                variant="gradient"
                size="sm"
                onClick={() => setAssignmentModalOpen(true)}
                leftIcon={<Send className="w-4 h-4" />}
              >
                Submit New Deliverable
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {Array.from({ length: internship.duration || 4 }).map((_, idx) => {
                const weekNum = idx + 1;
                const existing = assignments.find((a) => a.weekNumber === weekNum);

                return (
                  <div key={weekNum} className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-primary/10 text-primary">
                        Week {weekNum} Deliverable
                      </span>
                      {existing ? (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                          existing.status === 'reviewed'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}>
                          {existing.status}
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          Pending Submission
                        </span>
                      )}
                    </div>

                    <h3 className="font-syne font-bold text-base text-foreground">
                      Week {weekNum}: Production Project Milestone
                    </h3>

                    {existing ? (
                      <div className="space-y-3 text-xs">
                        <div className="text-muted-foreground">
                          Submitted on {formatDate(existing.submittedAt || new Date(), { month: 'short', day: 'numeric' })}
                        </div>

                        {existing.files && existing.files.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            {existing.files.map((file, fIdx) => (
                              <a
                                key={fIdx}
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-primary hover:underline font-mono text-[11px] truncate"
                              >
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{file.filename}: {file.url}</span>
                              </a>
                            ))}
                          </div>
                        )}

                        {existing.mentorFeedback && (
                          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1">
                            <span className="font-bold text-emerald-600 text-[11px]">Mentor Review & Feedback:</span>
                            <p className="text-foreground italic">{existing.mentorFeedback}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground leading-relaxed">
                        Complete your weekly coding tasks and submit your GitHub repository link along with live demo URL.
                      </div>
                    )}

                    <div className="pt-3 border-t border-border">
                      <Button
                        size="sm"
                        variant={existing ? 'outline' : 'gradient'}
                        className="w-full"
                        onClick={() => {
                          setSubmitWeek(weekNum);
                          setAssignmentModalOpen(true);
                        }}
                      >
                        {existing ? 'Update Submission' : 'Submit Week ' + weekNum + ' Deliverable'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: STARTER ASSETS & CODE */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-syne text-xl font-bold text-foreground">Project Starter Assets & Reference Docs</h2>
              <p className="text-xs text-muted-foreground">Download boilerplate code repositories, Figma designs, and API specifications.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { title: 'Official GitHub Starter Repo', desc: 'Pre-configured production template with TypeScript, Next.js & Tailwind.', icon: Code2, link: 'https://github.com' },
                { title: 'Figma UI/UX Design System', desc: 'Complete component library, design specs & responsive wireframes.', icon: Download, link: 'https://figma.com' },
                { title: 'API Documentation & Postman', desc: 'REST API schemas, authentication guides, and mock database scripts.', icon: ExternalLink, link: '/contact' },
              ].map((res) => {
                const Icon = res.icon;
                return (
                  <div key={res.title} className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm hover:border-primary/40 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-syne font-bold text-base text-foreground mb-1">{res.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{res.desc}</p>
                    </div>
                    <a
                      href={res.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline pt-2"
                    >
                      Access Asset <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: VERIFIED CERTIFICATE */}
        {activeTab === 'certificate' && (
          <div className="space-y-6 max-w-2xl mx-auto text-center py-6">
            {progress >= 100 || enrollment.status === 'completed' ? (
              <div className="bg-card border border-primary/40 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white mx-auto shadow-lg">
                  <Award className="w-8 h-8" />
                </div>

                <div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold uppercase tracking-wider">
                    Official Certificate Earned!
                  </span>
                  <h2 className="font-syne text-2xl font-bold text-foreground mt-3">
                    Congratulations!
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto leading-relaxed">
                    You have successfully completed all modules, practical code reviews, and project milestones for <strong className="text-foreground">{internship.title}</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-muted/60 border border-border text-xs space-y-2 text-left font-mono">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Certificate Number:</span>
                    <span className="font-bold text-foreground">{enrollment.certificateId?.certificateNumber || 'NJT-CERT-2026-X'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Verification URL:</span>
                    <span className="font-bold text-primary">najtech.com/verify-certificate</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link href="/certificates" className="flex-1">
                    <Button variant="gradient" className="w-full" leftIcon={<Award className="w-4 h-4" />}>
                      View Official Certificate
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-3xl p-8 space-y-4 shadow-md">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mx-auto">
                  <Award className="w-7 h-7" />
                </div>
                <h3 className="font-syne text-xl font-bold text-foreground">Certificate Locked</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Complete 100% of your weekly curriculum lessons and project deliverables to automatically unlock your verified career certificate.
                </p>
                <div className="pt-2">
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('curriculum')}>
                    Continue Modules ({progress}% / 100%)
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ASSIGNMENT SUBMISSION MODAL */}
      <AnimatePresence>
        {assignmentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-syne text-lg font-bold text-foreground">
                  Submit Week {submitWeek} Deliverable
                </h3>
                <button
                  onClick={() => setAssignmentModalOpen(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAssignmentSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Select Week</label>
                  <select
                    value={submitWeek}
                    onChange={(e) => setSubmitWeek(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {Array.from({ length: internship.duration || 4 }).map((_, idx) => (
                      <option key={idx + 1} value={idx + 1}>
                        Week {idx + 1} Milestone
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    GitHub Repository URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/your-username/project-repo"
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Live Demo / Hosted URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    placeholder="https://your-app.vercel.app"
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Notes & Deliverable Description
                  </label>
                  <textarea
                    rows={3}
                    value={submitNotes}
                    onChange={(e) => setSubmitNotes(e.target.value)}
                    placeholder="Describe what you built and key features implemented..."
                    className="w-full p-3 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setAssignmentModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="gradient"
                    className="flex-1"
                    loading={submitting}
                    leftIcon={<Send className="w-4 h-4" />}
                  >
                    Submit Deliverable
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
