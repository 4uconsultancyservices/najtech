'use client';

import { useState, useEffect } from 'react';
import { Shield, Loader2, RefreshCw } from 'lucide-react';
import { formatDate, formatRelativeTime } from '@/lib/utils';

interface AuditLog {
  _id: string;
  action: string;
  resource: string;
  resourceId?: string;
  ip?: string;
  createdAt: string;
  userId?: { name?: string; email?: string; role?: string };
}

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  update: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  delete: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  login: 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400',
  logout: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchLogs = () => {
    setLoading(true);
    fetch(`/api/admin/audit-logs?page=${page}&limit=20`)
      .then((r) => r.json())
      .then((d) => {
        setLogs(d.data || []);
        setPages(d.pagination?.pages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLogs(); }, [page]);

  const getActionColor = (action: string) => {
    const key = Object.keys(ACTION_COLORS).find((k) => action.toLowerCase().includes(k));
    return key ? ACTION_COLORS[key] : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-syne text-2xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-muted-foreground text-sm">Track all admin and user actions across the platform</p>
        </div>
        <button onClick={fetchLogs} className="p-2 rounded-lg border border-border hover:bg-accent transition-colors">
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-24">
            <Shield className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No audit logs yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  {['Action', 'User', 'Resource', 'IP Address', 'Time'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-b border-border/50 hover:bg-accent/40 transition-colors">
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-sm text-foreground">{log.userId?.name || 'System'}</div>
                      <div className="text-xs text-muted-foreground">{log.userId?.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-foreground capitalize">{log.resource}</div>
                      {log.resourceId && <div className="text-xs text-muted-foreground font-mono truncate max-w-xs">{log.resourceId}</div>}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-muted-foreground">{log.ip || '—'}</td>
                    <td className="py-3 px-4">
                      <div className="text-xs text-foreground">{formatRelativeTime(log.createdAt)}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(log.createdAt, { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 text-sm border border-border rounded-lg disabled:opacity-50 hover:bg-accent transition-colors">Previous</button>
          <span className="text-sm text-muted-foreground">Page {page} of {pages}</span>
          <button disabled={page === pages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 text-sm border border-border rounded-lg disabled:opacity-50 hover:bg-accent transition-colors">Next</button>
        </div>
      )}
    </div>
  );
}
