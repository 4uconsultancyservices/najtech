import { connectDB } from '@/lib/db/mongoose';
import Internship from '@/models/Internship';
import { InternshipForm } from '@/components/admin/InternshipForm';
import { notFound } from 'next/navigation';

export default async function EditInternshipPage({ params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;

  const internship = await Internship.findById(id)
    .populate('mentorId')
    .populate('categoryId')
    .lean();

  if (!internship) {
    notFound();
  }

  // Convert MongoDB ObjectIDs to plain strings for Client Component
  const initialData = JSON.parse(JSON.stringify(internship));

  return <InternshipForm initialData={initialData} isEditing={true} internshipId={id} />;
}
