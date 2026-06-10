'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Award, CheckCircle, XCircle, Loader2, Shield, Calendar, User, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';

interface CertData {
  certificateNumber: string;
  issuedAt: string;
  expiresAt?: string;
  qrCode?: string;
  studentId?: { name?: string };
  internshipId?: { title?: string; duration?: number };
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const [certNumber, setCertNumber] = useState(searchParams.get('cert') || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ valid: boolean; data?: CertData; error?: string } | null>(null);

  const verify = async (num?: string) => {
    const cn = (num || certNumber).trim();
    if (!cn) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/certificates?cert=${encodeURIComponent(cn)}`);
      const data = await res.json();
      if (data.success) {
        setResult({ valid: true, data: data.data });
      } else {
        setResult({ valid: false, error: data.error || 'Certificate not found' });
      }
    } catch {
      setResult({ valid: false, error: 'Verification failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Auto-verify if cert param present
  useState(() => {
    const cert = searchParams.get('cert');
    if (cert) verify(cert);
  });

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-syne text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Verify Certificate
          </h1>
          <p className="text-muted-foreground">
            Enter the certificate number to verify its authenticity
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-6 mb-6"
        >
          <label className="block text-sm font-medium text-foreground mb-2">Certificate Number</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={certNumber}
              onChange={(e) => setCertNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && verify()}
              placeholder="e.g. IV-2024-ABC123"
              className="flex-1 h-11 px-3.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary font-mono"
            />
            <Button
              variant="gradient"
              onClick={() => verify()}
              loading={loading}
              leftIcon={<Search className="w-4 h-4" />}
            >
              Verify
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Find the certificate number on your certificate document or in your dashboard
          </p>
        </motion.div>

        {/* Result */}
        {loading && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          </div>
        )}

        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-card border-2 rounded-2xl p-6 ${
              result.valid
                ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                : 'border-red-500/50 shadow-lg shadow-red-500/10'
            }`}
          >
            {result.valid && result.data ? (
              <div className="space-y-5">
                {/* Valid badge */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-syne font-bold text-emerald-600 dark:text-emerald-400 text-lg">Certificate Verified ✓</div>
                    <div className="text-sm text-muted-foreground">This is an authentic NajTech certificate</div>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-xl">
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">Certificate Holder</div>
                      <div className="font-semibold text-foreground">{result.data.studentId?.name || '—'}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">Program</div>
                      <div className="font-semibold text-foreground">{result.data.internshipId?.title || '—'}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Award className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">Certificate Number</div>
                      <div className="font-mono font-semibold text-foreground">{result.data.certificateNumber}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">Issued On</div>
                      <div className="font-semibold text-foreground">
                        {formatDate(result.data.issuedAt)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                {result.data.qrCode && (
                  <div className="text-center">
                    <img
                      src={result.data.qrCode}
                      alt="Certificate QR Code"
                      className="w-24 h-24 mx-auto rounded-xl border border-border"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Scan QR to verify</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <div className="font-syne font-bold text-red-600 dark:text-red-400 text-lg">Invalid Certificate</div>
                  <div className="text-sm text-muted-foreground">{result.error}</div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function VerifyCertificatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <VerifyContent />
    </Suspense>
  );
}
