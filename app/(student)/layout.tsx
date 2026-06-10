import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/config';
import { StudentSidebar } from '@/components/dashboard/StudentSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (!['student', 'admin', 'super_admin'].includes(session.user.role as string)) {
    redirect('/unauthorized');
  }

  return (
    <div className="min-h-screen bg-background flex">
      <StudentSidebar user={session.user as { name?: string | null; email?: string | null; image?: string | null; role?: string }} />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <DashboardHeader user={session.user as { name?: string | null; email?: string | null; image?: string | null; role?: string }} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
