import { auth } from '@/lib/auth/config';
import { connectDB } from '@/lib/db/mongoose';
import { Enrollment, Assignment, Certificate } from '@/models';
import { BookOpen, ClipboardList, Award, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default async function StudentDashboard() {
  const session = await auth();
  await connectDB();

  const [enrollments, pendingAssignments, certificates] = await Promise.all([
    Enrollment.find({ studentId: session!.user.id })
      .populate('internshipId', 'title thumbnail duration')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Assignment.countDocuments({ studentId: session!.user.id, status: 'pending' }),
    Certificate.countDocuments({ studentId: session!.user.id }),
  ]);

  const stats = [
    {
      icon: BookOpen,
      label: 'Active Internships',
      value: enrollments.filter((e) => (e as { status: string }).status === 'active').length,
      color: 'from-indigo-500 to-purple-600',
      href: '/my-internships',
    },
    {
      icon: ClipboardList,
      label: 'Pending Assignments',
      value: pendingAssignments,
      color: 'from-amber-500 to-orange-600',
      href: '/assignments',
    },
    {
      icon: Award,
      label: 'Certificates Earned',
      value: certificates,
      color: 'from-emerald-500 to-teal-600',
      href: '/certificates',
    },
    {
      icon: TrendingUp,
      label: 'Avg Progress',
      value: `${enrollments.length
        ? Math.round(
            enrollments.reduce((sum, e) => sum + ((e as { progress?: number }).progress || 0), 0) / enrollments.length
          )
        : 0}%`,
      color: 'from-cyan-500 to-blue-600',
      href: '/my-internships',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-lg transition-all duration-200 group">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className="font-syne text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent enrollments */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-syne text-lg font-semibold text-foreground">My Internships</h2>
          <Link href="/my-internships" className="text-sm text-primary hover:underline">View all</Link>
        </div>

        {enrollments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-1">No internships yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Browse our catalog to get started</p>
            <Link href="/internships" className="text-sm text-primary hover:underline font-medium">
              Explore Internships →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {enrollments.map((enrollment) => {
              const e = enrollment as {
                _id: string;
                progress?: number;
                status: string;
                startDate: Date;
                internshipId: { title?: string; duration?: number } | null;
              };
              return (
                <div
                  key={e._id.toString()}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground truncate">
                      {e.internshipId?.title || 'Internship'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Started {formatDate(e.startDate)} · {e.internshipId?.duration || '?'}w program
                    </div>
                    <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden w-full max-w-xs">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        style={{ width: `${e.progress || 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      e.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
                      e.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {e.status}
                    </span>
                    <div className="text-xs text-muted-foreground mt-1">{e.progress || 0}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
