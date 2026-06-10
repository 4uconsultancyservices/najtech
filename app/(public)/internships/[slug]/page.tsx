import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db/mongoose';
import Internship from '@/models/Internship';
import { InternshipDetail } from '@/components/internships/InternshipDetail';
import { generateMetadata as genMeta } from '@/lib/seo';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const internship = await Internship.findOne({ slug, status: 'published' }).lean();
  if (!internship) return {};
  const i = internship as { title: string; shortDescription: string; thumbnail?: string };
  return genMeta({
    title: i.title,
    description: i.shortDescription,
    ogImage: i.thumbnail,
  });
}

export default async function InternshipDetailPage({ params }: Props) {
  const { slug } = await params;
  await connectDB();

  const internship = await Internship.findOne({ slug, status: 'published' })
    .populate('mentorId')
    .populate('categoryId')
    .lean();

  if (!internship) notFound();

  return <InternshipDetail internship={JSON.parse(JSON.stringify(internship))} />;
}
