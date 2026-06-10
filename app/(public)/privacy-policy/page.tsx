import { generateMetadata as genMeta } from '@/lib/seo';

export const metadata = genMeta({
  title: 'Privacy Policy',
  description: 'NajTech Privacy Policy — how we collect, use, and protect your personal data.',
  noIndex: false,
});

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="font-syne text-4xl font-bold text-foreground mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        <div className="prose prose-sm max-w-none space-y-8">
          {[
            {
              title: '1. Information We Collect',
              content: `We collect information you provide directly to us, such as when you create an account, enroll in an internship, submit assignments, or contact us for support. This includes your name, email address, phone number, and payment information. We also collect information automatically when you use our services, including log data, device information, and usage patterns.`,
            },
            {
              title: '2. How We Use Your Information',
              content: `We use the information we collect to provide, maintain, and improve our services, process transactions and send related information, send technical notices and support messages, respond to your comments and questions, and send information about products and services. We may also use your information to monitor and analyze trends, usage, and activities in connection with our services.`,
            },
            {
              title: '3. Information Sharing',
              content: `We do not share your personal information with third parties except in the following circumstances: with your consent, to comply with laws, to protect our rights, with service providers who assist in our operations, or in connection with a merger or acquisition. We require all third parties to respect the security of your data and treat it in accordance with the law.`,
            },
            {
              title: '4. Data Security',
              content: `We take reasonable measures to protect your personal information from unauthorized access, use, or disclosure. We use industry-standard encryption protocols, secure servers, and regular security audits. However, no method of transmission over the Internet or electronic storage is 100% secure.`,
            },
            {
              title: '5. Cookies',
              content: `We use cookies and similar tracking technologies to track activity on our services and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.`,
            },
            {
              title: '6. Your Rights',
              content: `You have the right to access, update, or delete your personal information at any time. You can do this through your account settings or by contacting us directly. You may also opt-out of marketing communications by following the unsubscribe instructions in those messages.`,
            },
            {
              title: '7. Contact Us',
              content: `If you have questions about this Privacy Policy, please contact us at privacy@internvault.com or write to us at NajTech, Bangalore, Karnataka, India.`,
            },
          ].map(({ title, content }) => (
            <div key={title} className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-syne text-lg font-semibold text-foreground mb-3">{title}</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">{content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
