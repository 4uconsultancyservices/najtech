import { Metadata } from 'next';

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'NajTech';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://internvault.com';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

export function generateMetadata({
  title,
  description,
  keywords = [],
  ogTitle,
  ogDescription,
  ogImage,
  canonicalUrl,
  noIndex = false,
}: SEOProps): Metadata {
  const fullTitle = title ? `${title} | ${APP_NAME}` : APP_NAME;
  const defaultDescription =
    'NajTech - Premier virtual internship platform connecting students with industry mentors.';
  const metaDescription = description || defaultDescription;

  return {
    title: fullTitle,
    description: metaDescription,
    keywords: keywords.join(', '),
    metadataBase: new URL(APP_URL),
    openGraph: {
      title: ogTitle || fullTitle,
      description: ogDescription || metaDescription,
      images: ogImage ? [{ url: ogImage }] : [{ url: '/og-image.png' }],
      siteName: APP_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle || fullTitle,
      description: ogDescription || metaDescription,
      images: ogImage ? [ogImage] : ['/og-image.png'],
    },
    alternates: {
      canonical: canonicalUrl || APP_URL,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export function generateJsonLd(type: string, data: Record<string, unknown>) {
  const schemas: Record<string, Record<string, unknown>> = {
    organization: {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: APP_NAME,
      url: APP_URL,
      logo: `${APP_URL}/logo.png`,
      description: 'Virtual internship and learning management platform',
    },
    course: {
      '@context': 'https://schema.org',
      '@type': 'Course',
      provider: {
        '@type': 'Organization',
        name: APP_NAME,
        url: APP_URL,
      },
      ...data,
    },
    blogPost: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      publisher: {
        '@type': 'Organization',
        name: APP_NAME,
        url: APP_URL,
      },
      ...data,
    },
    faqPage: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      ...data,
    },
    breadcrumb: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      ...data,
    },
  };

  return schemas[type] || { '@context': 'https://schema.org', '@type': type, ...data };
}

export function generateSitemapEntry(
  path: string,
  lastModified?: Date,
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' = 'weekly',
  priority = 0.5
) {
  return {
    url: `${APP_URL}${path}`,
    lastModified: lastModified || new Date(),
    changeFrequency,
    priority,
  };
}
