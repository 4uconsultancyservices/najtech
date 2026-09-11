import { requireMentor } from '@/lib/auth/helpers';
import { MentorSidebar } from '@/components/mentor/MentorSidebar';

export default async function MentorLayout({ children }: { children: React.ReactNode }) {
  const session = await requireMentor();

  return (
    <div className="min-h-screen bg-background flex">
      <MentorSidebar user={{ name: session.user.name, email: session.user.email, role: session.user.role }} />
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
