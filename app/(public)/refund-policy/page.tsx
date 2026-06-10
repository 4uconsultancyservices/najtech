import { generateMetadata as genMeta } from '@/lib/seo';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const metadata = genMeta({
  title: 'Refund Policy',
  description: 'NajTech Refund Policy — understand our refund and cancellation terms.',
});

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="font-syne text-4xl font-bold text-foreground mb-3">Refund Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        {/* Quick summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4">
            <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-2" />
            <div className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm">Full Refund</div>
            <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">Within 7 days of enrollment, if no content accessed</div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
            <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 mb-2" />
            <div className="font-semibold text-amber-800 dark:text-amber-300 text-sm">Partial Refund</div>
            <div className="text-xs text-amber-700 dark:text-amber-400 mt-1">8–14 days, if less than 25% content accessed</div>
          </div>
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-4">
            <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 mb-2" />
            <div className="font-semibold text-red-800 dark:text-red-300 text-sm">No Refund</div>
            <div className="text-xs text-red-700 dark:text-red-400 mt-1">After 14 days or more than 25% content accessed</div>
          </div>
        </div>

        <div className="space-y-6">
          {[
            {
              title: '1. Refund Eligibility',
              content: `Students are eligible for a full refund within 7 days of enrollment, provided they have not accessed more than 10% of the course content. After 7 days but within 14 days, a 50% refund may be issued if less than 25% of content has been accessed. No refunds will be issued after 14 days of enrollment or if more than 25% of course content has been accessed, whichever comes first.`,
            },
            {
              title: '2. Non-Refundable Items',
              content: `The following are not eligible for refunds: certificate generation fees, processing fees charged by payment gateways, programs that have been 100% completed, programs purchased during promotional periods with explicit "non-refundable" labeling, and coupon discounts.`,
            },
            {
              title: '3. How to Request a Refund',
              content: `To request a refund, please contact our support team at refunds@internvault.com with your order number and reason for the refund. Our team will review your request and respond within 3–5 business days. If approved, refunds will be processed to your original payment method within 7–10 business days.`,
            },
            {
              title: '4. Technical Issues',
              content: `If you experience technical issues that prevent you from accessing course content, please contact us within 48 hours. We will first attempt to resolve the technical issue. If we are unable to resolve the issue within 72 hours, a full refund will be issued regardless of the time elapsed since enrollment.`,
            },
            {
              title: '5. Cancellation by NajTech',
              content: `In the unlikely event that NajTech cancels a program after enrollment, all enrolled students will receive a full refund of their enrollment fee within 5–7 business days. We will also provide reasonable notice before cancellation when possible.`,
            },
            {
              title: '6. Contact Us',
              content: `For refund-related queries, contact us at refunds@internvault.com or call +91 80000 00000 (Mon–Fri, 9 AM–6 PM IST). Please have your order number ready for faster resolution.`,
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
