import { generateMetadata as genMeta } from '@/lib/seo';

export const metadata = genMeta({
  title: 'Terms & Conditions',
  description: 'NajTech Terms & Conditions — the rules and regulations governing use of our platform.',
});

export default function TermsConditionsPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="font-syne text-4xl font-bold text-foreground mb-3">Terms & Conditions</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        <div className="space-y-6">
          {[
            {
              title: '1. Acceptance of Terms',
              content: 'By accessing and using NajTech, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.',
            },
            {
              title: '2. Account Registration',
              content: 'To use certain features of the platform, you must register for an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete. You are responsible for maintaining the confidentiality of your password.',
            },
            {
              title: '3. Enrollment and Payments',
              content: 'By enrolling in an internship program, you agree to pay all applicable fees. All fees are non-refundable except as described in our Refund Policy. We reserve the right to change pricing at any time, with notice to existing enrolled students.',
            },
            {
              title: '4. Intellectual Property',
              content: 'All content on this platform, including but not limited to text, graphics, logos, and course materials, is the property of NajTech or its content suppliers and is protected by applicable intellectual property laws.',
            },
            {
              title: '5. Code of Conduct',
              content: 'Users agree not to use the platform for any unlawful purpose, to post or transmit harmful content, to violate the rights of others, or to interfere with the operation of the service. Violation may result in immediate account termination.',
            },
            {
              title: '6. Certificate Issuance',
              content: 'Certificates are issued upon successful completion of all program requirements, including assignments and meeting the minimum progress threshold. NajTech reserves the right to revoke certificates if awarded based on fraudulent or dishonest activity.',
            },
            {
              title: '7. Limitation of Liability',
              content: 'NajTech shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.',
            },
            {
              title: '8. Modifications',
              content: 'We reserve the right to modify these terms at any time. We will provide notice of significant changes by updating the date at the top of this page. Continued use of the platform after changes constitutes acceptance.',
            },
            {
              title: '9. Governing Law',
              content: 'These terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka.',
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
