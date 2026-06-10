'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList, Upload, Plus, Loader2, CheckCircle, Clock,
  AlertCircle, RefreshCw, X, FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toaster';
import { formatDate } from '@/lib/utils';

interface Assignment {
  _id: string;
  weekNumber: number;
  title: string;
  description: string;
  status: string;
  submittedAt?: string;
  mentorFeedback?: string;
  mentorRating?: number;
  files?: Array<{ originalName: string; url: string; size: number }>;
  internshipId?: { title?: string };
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  pending: { label: 'Pending', icon: Clock, color: 'text-amber-500' },
  submitted: { label: 'Submitted', icon: CheckCircle, color: 'text-blue-500' },
  reviewed: { label: 'Reviewed', icon: CheckCircle, color: 'text-emerald-500' },
  resubmit: { label: 'Resubmit', icon: AlertCircle, color: 'text-red-500' },
};

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [enrollmentId, setEnrollmentId] = useState('');
  const [weekNumber, setWeekNumber] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAssignments = () => {
    setLoading(true);
    fetch('/api/assignments')
      .then((r) => r.json())
      .then((d) => setAssignments(d.data || []))
      .catch(() => toast.error('Failed to load assignments'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAssignments(); }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => setFiles(files.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollmentId || !title || !description) {
      toast.error('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('enrollmentId', enrollmentId);
      formData.append('weekNumber', String(weekNumber));
      formData.append('title', title);
      formData.append('description', description);
      files.forEach((f) => formData.append('files', f));

      const res = await fetch('/api/assignments', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        toast.success('Assignment submitted successfully!');
        setShowSubmit(false);
        setFiles([]);
        setTitle('');
        setDescription('');
        fetchAssignments();
      } else {
        toast.error(data.error || 'Failed to submit');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) =>
    bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)}KB` : `${(bytes / (1024 * 1024)).toFixed(1)}MB`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-syne text-2xl font-bold text-foreground">Assignments</h1>
          <p className="text-muted-foreground text-sm">{assignments.length} total assignments</p>
        </div>
        <Button
          variant="gradient"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setShowSubmit(true)}
        >
          Submit Assignment
        </Button>
      </div>

      {/* Submit modal */}
      {showSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-syne font-bold text-foreground text-lg">Submit Assignment</h2>
              <button onClick={() => setShowSubmit(false)} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Enrollment ID *</label>
                <input
                  value={enrollmentId}
                  onChange={(e) => setEnrollmentId(e.target.value)}
                  placeholder="Your enrollment ID"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Week Number *</label>
                <input
                  type="number"
                  min={1}
                  value={weekNumber}
                  onChange={(e) => setWeekNumber(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Assignment Title *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Week 3 Project Submission"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe your submission..."
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              {/* File upload */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Files (optional)</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload files</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, ZIP, PPT, Images</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.doc,.zip,.ppt,.pptx,.png,.jpg,.jpeg"
                  />
                </div>

                {files.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {files.map((file, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg text-sm">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="flex-1 truncate text-foreground">{file.name}</span>
                        <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                        <button type="button" onClick={() => removeFile(i)} className="text-muted-foreground hover:text-red-500 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowSubmit(false)}>Cancel</Button>
                <Button type="submit" variant="gradient" className="flex-1" loading={submitting} leftIcon={<Upload className="w-4 h-4" />}>
                  Submit
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="font-syne text-lg font-bold text-foreground mb-2">No assignments yet</h3>
          <p className="text-muted-foreground text-sm">Submit your first assignment when ready</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment, i) => {
            const statusConfig = STATUS_CONFIG[assignment.status] || STATUS_CONFIG.pending;
            const StatusIcon = statusConfig.icon;

            return (
              <motion.div
                key={assignment._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">W{assignment.weekNumber}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="font-semibold text-foreground text-sm">{assignment.title}</h3>
                      <div className={`flex items-center gap-1.5 text-xs font-medium flex-shrink-0 ${statusConfig.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusConfig.label}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{assignment.description}</p>

                    {assignment.internshipId?.title && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-md">{assignment.internshipId.title}</span>
                    )}

                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-3">
                      <span>Submitted: {assignment.submittedAt ? formatDate(assignment.submittedAt, { month: 'short', day: 'numeric' }) : 'Not yet'}</span>
                      {assignment.files && assignment.files.length > 0 && (
                        <span>{assignment.files.length} file{assignment.files.length > 1 ? 's' : ''} attached</span>
                      )}
                      {assignment.mentorRating && (
                        <span className="text-amber-500">★ {assignment.mentorRating}/5</span>
                      )}
                    </div>

                    {assignment.mentorFeedback && (
                      <div className="mt-3 p-3 bg-muted/60 rounded-xl border border-border">
                        <div className="text-xs font-semibold text-foreground mb-1">Mentor Feedback</div>
                        <p className="text-xs text-muted-foreground">{assignment.mentorFeedback}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
