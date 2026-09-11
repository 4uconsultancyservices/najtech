import { connectDB } from '@/lib/db/mongoose';
import { Assignment, Enrollment } from '@/models';
import { requireMentor } from '@/lib/auth/helpers';
import Link from 'next/link';
import { FileCheck, Users, Clock, Star, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default async function MentorDashboardPage() {
  const session = await requireMentor();
  await connectDB();

  const [pendingAssignments, totalSubmissions, activeStudentsCount, recentSubmissions] = await Promise.all([
    Assignment.countDocuments({ status: 'submitted' }),
    Assignment.countDocuments({ status: 'reviewed' }),
    Enrollment.countDocuments({ status: 'active' }),
    Assignment.find()
      .populate('studentId', 'name email avatar')
      .populate('internshipId', 'title')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const stats = [
    { label: 'Pending Reviews', value: pendingAssignments, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Reviewed Assignments', value: totalSubmissions, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Active Mentees', value: activeStudentsCount, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { label: 'Average Rating', value: '4.9 / 5', icon: Star, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent p-6 rounded-2xl border border-primary/20">
        <div>
          <h1 className="font-syne text-2xl sm:text-3xl font-bold text-foreground">
            Welcome back, <span className="gradient-text">{session.user.name}</span> 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here is an overview of your mentee assignments and evaluation workspace.
          </p>
        </div>
        <Link href="/mentor/assignments">
          <Button variant="gradient" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Review Submissions ({pendingAssignments})
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <div className="font-syne text-3xl font-bold text-foreground">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Submissions */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-syne text-xl font-bold text-foreground">Recent Submissions</h2>
            <p className="text-xs text-muted-foreground">Assignments submitted by your enrolled students</p>
          </div>
          <Link href="/mentor/assignments">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All
            </Button>
          </Link>
        </div>

        {recentSubmissions.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-xl">
            <FileCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No recent assignment submissions</p>
            <p className="text-xs text-muted-foreground mt-1">When students submit work, it will appear here for your review.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentSubmissions.map((sub: any) => (
              <div key={sub._id.toString()} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-accent/40 px-3 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                    {sub.studentId?.name?.[0] || 'S'}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{sub.title} (Week {sub.weekNumber})</h3>
                    <p className="text-xs text-muted-foreground">
                      Student: <span className="text-foreground font-medium">{sub.studentId?.name}</span> • Program: {sub.internshipId?.title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    sub.status === 'submitted' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                  }`}>
                    {sub.status === 'submitted' ? 'Pending Review' : 'Reviewed'}
                  </span>
                  <Link href="/mentor/assignments">
                    <Button size="sm" variant="ghost">Review</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
