'use client';

import { useState, useEffect } from 'react';
import { Award, Search, Loader2, ExternalLink, ShieldOff } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/Toaster';

interface Certificate {
  _id: string;
  certificateNumber: string;
  issuedAt: string;
  isRevoked: boolean;
  studentId?: { name?: string; email?: string };
  internshipId?: { title?: string };
}

export default function AdminCertificatesPage() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const fetchCerts = () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '20' });
    if (search) params.set('search', search);
    fetch(`/api/admin/certificates?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setCerts(d.data || []);
        setTotal(d.pagination?.total || d.data?.length || 0);
      })
      .catch(() => toast.error('Failed to load certificates'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCerts(); }, [search]);

  const revokeCertificate = async (id: string, isRevoked: boolean) => {
    if (!confirm(isRevoked ? 'Reinstate this certificate?' : 'Revoke this certificate?')) return;
    const res = await fetch(`/api/admin/certificates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isRevoked: !isRevoked }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(isRevoked ? 'Certificate reinstated' : 'Certificate revoked');
      fetchCerts();
    } else {
      toast.error('Failed to update certificate');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-syne text-2xl font-bold text-foreground">Certificates</h1>
        <p className="text-muted-foreground text-sm">{total} total certificates issued</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by student or certificate number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 h-10 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : certs.length === 0 ? (
          <div className="text-center py-24">
            <Award className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No certificates found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  {['Certificate #', 'Student', 'Program', 'Issued', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {certs.map((cert) => (
                  <tr key={cert._id} className="border-b border-border/50 hover:bg-accent/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{cert.certificateNumber}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-sm text-foreground">{cert.studentId?.name || '—'}</div>
                      <div className="text-xs text-muted-foreground">{cert.studentId?.email}</div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground max-w-xs truncate">{cert.internshipId?.title || '—'}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{formatDate(cert.issuedAt, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        cert.isRevoked
                          ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                      }`}>
                        {cert.isRevoked ? 'Revoked' : 'Valid'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <a href={`/verify-certificate?cert=${cert.certificateNumber}`} target="_blank" rel="noreferrer">
                          <button className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </a>
                        <button
                          onClick={() => revokeCertificate(cert._id, cert.isRevoked)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            cert.isRevoked
                              ? 'hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-muted-foreground hover:text-emerald-500'
                              : 'hover:bg-red-50 dark:hover:bg-red-950/20 text-muted-foreground hover:text-red-500'
                          }`}
                          title={cert.isRevoked ? 'Reinstate' : 'Revoke'}
                        >
                          <ShieldOff className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
