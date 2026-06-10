import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/config';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (!['admin', 'super_admin'].includes(session.user.role as string)) {
    redirect('/unauthorized');
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar user={session.user as { name?: string | null; email?: string | null; role?: string }} />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-72">
        <DashboardHeader user={session.user as { name?: string | null; email?: string | null; role?: string }} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
