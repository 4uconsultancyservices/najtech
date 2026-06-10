'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Eye, Loader2, BookOpen, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/Toaster';

interface Internship {
  _id: string;
  title: string;
  slug: string;
  price: number;
  discountPrice?: number;
  status: 'draft' | 'published' | 'archived';
  isFeatured: boolean;
  enrollmentCount: number;
  rating: number;
  duration: number;
  createdAt: string;
  category?: { name?: string; color?: string };
  mentor?: { title?: string };
}

const STATUS_COLORS = {
  published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  draft: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  archived: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

export default function AdminInternshipsPage() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const fetchInternships = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '10' });
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    fetch(`/api/internships?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setInternships(d.data || []);
        setTotal(d.pagination?.total || 0);
        setPages(d.pagination?.pages || 1);
      })
      .catch(() => toast.error('Failed to load internships'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchInternships(); }, [search, statusFilter, page]);

  const deleteInternship = async (id: string) => {
    if (!confirm('Are you sure you want to delete this internship?')) return;
    const res = await fetch(`/api/internships/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      toast.success('Internship deleted');
      fetchInternships();
    } else {
      toast.error(data.error || 'Failed to delete');
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    const res = await fetch(`/api/internships/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(`Internship ${newStatus}`);
      fetchInternships();
    } else {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-syne text-2xl font-bold text-foreground">Internships</h1>
          <p className="text-muted-foreground text-sm">{total} total programs</p>
        </div>
        <Link href="/admin/internships/new">
          <Button variant="gradient" leftIcon={<Plus className="w-4 h-4" />}>
            Create Internship
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search internships..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 h-10 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : internships.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No internships found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Internship</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mentor</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Price</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stats</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {internships.map((internship) => (
                  <tr key={internship._id} className="border-b border-border/50 hover:bg-accent/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground max-w-xs truncate">{internship.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        {internship.category && (
                          <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: `${internship.category.color}22`, color: internship.category.color || '#6366f1' }}>
                            {internship.category.name}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">{internship.duration}w</span>
                        {internship.isFeatured && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-sm">{internship.mentor?.title || '—'}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{formatCurrency(internship.discountPrice || internship.price)}</div>
                      {internship.discountPrice && (
                        <div className="text-xs text-muted-foreground line-through">{formatCurrency(internship.price)}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleStatus(internship._id, internship.status)}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer hover:opacity-80 transition-opacity ${STATUS_COLORS[internship.status]}`}
                      >
                        {internship.status}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      <div>{internship.enrollmentCount} enrolled</div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        {internship.rating.toFixed(1)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/internships/${internship.slug}`} target="_blank">
                          <button className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <Link href={`/admin/internships/${internship._id}/edit`}>
                          <button className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-blue-500">
                            <Edit className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => deleteInternship(internship._id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-muted-foreground hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {pages}</span>
          <Button variant="outline" size="sm" disabled={page === pages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
