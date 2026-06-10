import { MetadataRoute } from 'next';
import { connectDB } from '@/lib/db/mongoose';
import Internship from '@/models/Internship';
import { Blog } from '@/models';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://internvault.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();

  const internships = await Internship.find({ status: 'published' })
    .select('slug updatedAt')
    .lean();

  const blogs = await Blog.find({ status: 'published' })
    .select('slug updatedAt')
    .lean();

  const staticPages = [
    { url: APP_URL, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${APP_URL}/internships`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${APP_URL}/mentors`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${APP_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.7 },
    { url: `${APP_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${APP_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${APP_URL}/verify-certificate`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.4 },
  ];

  const internshipPages = internships.map((i) => ({
    url: `${APP_URL}/internships/${i.slug}`,
    lastModified: i.updatedAt || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const blogPages = blogs.map((b) => ({
    url: `${APP_URL}/blog/${b.slug}`,
    lastModified: b.updatedAt || new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...internshipPages, ...blogPages];
}
