import { connectDB } from '@/lib/db/mongoose';
import { Enrollment } from '@/models';
import { requireMentor } from '@/lib/auth/helpers';
import { Users, GraduationCap, Calendar, CheckCircle, Award } from 'lucide-react';

export default async function MentorStudentsPage() {
  await requireMentor();
  await connectDB();

  const enrollments = await Enrollment.find()
    .populate('studentId', 'name email avatar createdAt')
    .populate('internshipId', 'title duration price')
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-syne text-3xl font-bold text-foreground">Enrolled Students</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Monitor your mentees, track their internship progress, and manage learning milestones.
        </p>
      </div>

      {/* Student List */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span className="font-syne font-bold text-foreground">All Mentees ({enrollments.length})</span>
          </div>
        </div>

        {enrollments.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <GraduationCap className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-semibold text-foreground">No enrolled students yet</p>
            <p className="text-xs mt-1">As students enroll in your internships, they will be listed here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Enrolled Program</th>
                  <th className="px-6 py-4">Enrollment Date</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {enrollments.map((item: any) => (
                  <tr key={item._id.toString()} className="hover:bg-accent/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                          {item.studentId?.name?.[0] || 'S'}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{item.studentId?.name || 'Student'}</p>
                          <p className="text-xs text-muted-foreground">{item.studentId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {item.internshipId?.title || 'Internship Program'}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{new Date(item.startDate || item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-36">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium text-foreground">{item.progress || 0}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                            style={{ width: `${item.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                        item.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20'
                      }`}>
                        {item.status === 'completed' ? <Award className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                        <span>{item.status || 'Active'}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
