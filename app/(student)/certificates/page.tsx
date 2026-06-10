'use client';

import { useEffect, useState } from 'react';
import { Award, Download, ExternalLink, Loader2, Share2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toaster';

interface Certificate {
  _id: string;
  certificateNumber: string;
  issuedAt: string;
  pdfUrl?: string;
  qrCode?: string;
  internshipId?: { title?: string; duration?: number };
}

export default function CertificatesPage() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/certificates')
      .then((r) => r.json())
      .then((d) => setCerts(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const copyVerifyLink = (certNumber: string) => {
    const url = `${window.location.origin}/verify-certificate?cert=${certNumber}`;
    navigator.clipboard.writeText(url);
    toast.success('Verification link copied!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-syne text-2xl font-bold text-foreground">My Certificates</h1>
        <p className="text-muted-foreground text-sm">{certs.length} certificate{certs.length !== 1 ? 's' : ''} earned</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : certs.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-syne text-xl font-bold text-foreground mb-2">No certificates yet</h3>
          <p className="text-muted-foreground">
            Complete your internship programs to earn certificates!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certs.map((cert) => (
            <div key={cert._id} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all duration-300">
              {/* Certificate visual */}
              <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-600 p-8 text-center">
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:24px_24px]" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-white/80 text-xs font-medium uppercase tracking-wider mb-1">Certificate of Completion</div>
                  <div className="font-syne text-white font-bold text-lg leading-tight">
                    {cert.internshipId?.title || 'Internship Program'}
                  </div>
                  <div className="mt-3 font-mono text-white/70 text-xs">{cert.certificateNumber}</div>
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Issued On</div>
                    <div className="font-medium text-sm text-foreground">{formatDate(cert.issuedAt)}</div>
                  </div>
                  {cert.internshipId?.duration && (
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Duration</div>
                      <div className="font-medium text-sm text-foreground">{cert.internshipId.duration} weeks</div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {cert.pdfUrl && (
                    <a href={cert.pdfUrl} download className="flex-1">
                      <Button size="sm" className="w-full" variant="outline" leftIcon={<Download className="w-3.5 h-3.5" />}>
                        Download
                      </Button>
                    </a>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Share2 className="w-3.5 h-3.5" />}
                    onClick={() => copyVerifyLink(cert.certificateNumber)}
                  >
                    Share
                  </Button>
                  <a href={`/verify-certificate?cert=${cert.certificateNumber}`} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="ghost">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
