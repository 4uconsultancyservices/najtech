'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileCheck, Star, MessageSquare, ExternalLink, CheckCircle2, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toaster';

interface IAssignmentItem {
  _id: string;
  title: string;
  description: string;
  weekNumber: number;
  status: 'submitted' | 'reviewed' | 'resubmit';
  submittedAt: string;
  mentorFeedback?: string;
  mentorRating?: number;
  files: Array<{ filename: string; originalName: string; url: string; size: number }>;
  studentId?: { _id: string; name: string; email: string; avatar?: string };
  internshipId?: { _id: string; title: string };
}

export default function MentorAssignmentsPage() {
  const [assignments, setAssignments] = useState<IAssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedAssignment, setSelectedAssignment] = useState<IAssignmentItem | null>(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewing, setReviewing] = useState(false);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/assignments');
      const data = await res.json();
      if (data.success) {
        setAssignments(data.data || []);
      }
    } catch (err) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleReview = async (newStatus: 'reviewed' | 'resubmit') => {
    if (!selectedAssignment) return;
    setReviewing(true);
    try {
      const res = await fetch('/api/assignments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: selectedAssignment._id,
          status: newStatus,
          mentorFeedback: feedback,
          mentorRating: rating,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(newStatus === 'reviewed' ? 'Assignment approved!' : 'Resubmission requested');
        setSelectedAssignment(null);
        setFeedback('');
        fetchAssignments();
      } else {
        toast.error(data.error || 'Failed to update review');
      }
    } catch {
      toast.error('Network error updating assignment');
    } finally {
      setReviewing(false);
    }
  };

  const filtered = assignments.filter((item) => {
    if (filter === 'submitted') return item.status === 'submitted';
    if (filter === 'reviewed') return item.status === 'reviewed';
    if (filter === 'resubmit') return item.status === 'resubmit';
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-syne text-3xl font-bold text-foreground">Assignment Reviews</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Evaluate submitted work, provide constructive feedback, and award ratings.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-card p-1 rounded-xl border border-border">
          {[
            { id: 'all', label: 'All' },
            { id: 'submitted', label: 'Pending Review' },
            { id: 'reviewed', label: 'Approved' },
            { id: 'resubmit', label: 'Resubmit Requested' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl">
          <FileCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-syne text-lg font-semibold text-foreground">No assignments found</h3>
          <p className="text-sm text-muted-foreground mt-1">There are no submissions matching your current filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Submissions List */}
          <div className="lg:col-span-6 space-y-4">
            {filtered.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => {
                  setSelectedAssignment(item);
                  setFeedback(item.mentorFeedback || '');
                  setRating(item.mentorRating || 5);
                }}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  selectedAssignment?._id === item._id
                    ? 'bg-primary/10 border-primary shadow-md'
                    : 'bg-card border-border hover:border-primary/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Week {item.weekNumber}</span>
                    <h3 className="font-syne font-bold text-foreground text-base mt-0.5">{item.title}</h3>
                  </div>
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                    item.status === 'submitted'
                      ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      : item.status === 'reviewed'
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      : 'bg-red-500/10 text-red-600 border border-red-500/20'
                  }`}>
                    {item.status === 'submitted' ? 'Pending' : item.status === 'reviewed' ? 'Approved' : 'Resubmit'}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{item.description}</p>

                <div className="flex items-center justify-between text-xs border-t border-border/60 pt-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                      {item.studentId?.name?.[0] || 'S'}
                    </div>
                    <span className="font-medium text-foreground">{item.studentId?.name}</span>
                  </div>
                  <span className="text-muted-foreground">{new Date(item.submittedAt).toLocaleDateString()}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Review Pane */}
          <div className="lg:col-span-6">
            {selectedAssignment ? (
              <div className="bg-card border border-border rounded-2xl p-6 sticky top-24 space-y-6">
                <div className="border-b border-border pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary">Week {selectedAssignment.weekNumber} Assignment</span>
                    <span className="text-xs text-muted-foreground">Submitted by {selectedAssignment.studentId?.name}</span>
                  </div>
                  <h2 className="font-syne text-xl font-bold text-foreground mt-1">{selectedAssignment.title}</h2>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Description / Student Notes</h4>
                  <p className="text-sm text-foreground bg-muted p-3.5 rounded-xl leading-relaxed">
                    {selectedAssignment.description}
                  </p>
                </div>

                {/* Submitted Files */}
                {selectedAssignment.files && selectedAssignment.files.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Submitted Deliverables</h4>
                    <div className="space-y-2">
                      {selectedAssignment.files.map((file, i) => (
                        <a
                          key={i}
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-3 bg-muted hover:bg-accent rounded-xl border border-border text-xs font-medium text-foreground transition-colors group"
                        >
                          <span className="truncate max-w-[200px] sm:max-w-[300px]">{file.originalName}</span>
                          <ExternalLink className="w-4 h-4 text-primary group-hover:translate-x-0.5 transition-transform" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grading Form */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="font-syne font-bold text-foreground text-base">Evaluation & Feedback</h3>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Score / Rating (1-5)</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`p-2 rounded-lg border transition-all ${
                            rating >= star
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                              : 'bg-muted border-border text-muted-foreground'
                          }`}
                        >
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Mentor Feedback Comments</label>
                    <textarea
                      rows={4}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Provide detailed feedback on code quality, architecture, and areas of improvement..."
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => handleReview('reviewed')}
                      loading={reviewing}
                      className="flex-1"
                      variant="gradient"
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      Approve & Grade
                    </Button>
                    <Button
                      onClick={() => handleReview('resubmit')}
                      loading={reviewing}
                      className="flex-1"
                      variant="outline"
                      leftIcon={<RotateCcw className="w-4 h-4" />}
                    >
                      Request Resubmission
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="font-semibold text-foreground">Select an assignment to review</p>
                <p className="text-xs mt-1">Click on any submission from the list on the left to inspect files and provide feedback.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
