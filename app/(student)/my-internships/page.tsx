import { auth } from '@/lib/auth/config';
import { connectDB } from '@/lib/db/mongoose';
import { Enrollment } from '@/models';
import Link from 'next/link';
import { BookOpen, Clock, Award, ArrowRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function MyInternshipsPage() {
  const session = await auth();
  await connectDB();

  const enrollments = await Enrollment.find({ studentId: session!.user.id })
    .populate('internshipId')
    .sort({ createdAt: -1 })
    .lean();

  const statusLabel: Record<string, { label: string; class: string }> = {
    active: { label: 'In Progress', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' },
    completed: { label: 'Completed', class: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' },
    cancelled: { label: 'Cancelled', class: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' },
    expired: { label: 'Expired', class: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-syne text-2xl font-bold text-foreground">My Internships</h1>
        <p className="text-muted-foreground text-sm">{enrollments.length} enrolled programs</p>
      </div>

      {enrollments.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-syne text-xl font-bold text-foreground mb-2">No internships yet</h3>
          <p className="text-muted-foreground mb-6">
            Explore our catalog and enroll in your first internship today!
          </p>
          <Link
            href="/internships"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            Browse Internships <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {enrollments.map((enrollment) => {
            const e = enrollment as {
              _id: string;
              progress?: number;
              status: string;
              startDate: Date;
              endDate?: Date;
              certificateId?: string;
              internshipId: {
                _id?: string;
                title?: string;
                thumbnail?: string;
                duration?: number;
                curriculum?: unknown[];
                slug?: string;
              } | null;
            };
            const internship = e.internshipId;
            const st = statusLabel[e.status] || statusLabel.active;
            const totalWeeks = (internship?.curriculum as unknown[])?.length || internship?.duration || 0;

            return (
              <div key={e._id.toString()} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-lg transition-all duration-200">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-syne font-bold text-foreground text-base line-clamp-2 mb-1">
                      {internship?.title || 'Internship Program'}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {internship?.duration || '?'} weeks
                      </div>
                      <span>Started {formatDate(e.startDate, { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${st.class}`}>
                    {st.label}
                  </span>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">{e.progress || 0}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${e.progress || 0}%` }}
                    />
                  </div>
                  {totalWeeks > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {Math.round(((e.progress || 0) / 100) * totalWeeks)}/{totalWeeks} weeks completed
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {internship?.slug && (
                    <Link
                      href={`/my-internships/${internship._id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Continue Learning
                    </Link>
                  )}
                  {e.status === 'completed' && (
                    <Link
                      href="/certificates"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-primary text-primary text-xs font-semibold hover:bg-primary/10 transition-colors"
                    >
                      <Award className="w-3.5 h-3.5" />
                      Certificate
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
