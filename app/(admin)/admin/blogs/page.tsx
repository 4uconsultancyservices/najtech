'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Eye, Loader2, FileText, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/Toaster';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  isFeatured: boolean;
  viewCount: number;
  publishedAt?: string;
  createdAt: string;
  author?: { name?: string };
  category?: { name?: string };
  tags: string[];
}

const STATUS_COLORS = {
  published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  draft: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  archived: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [total, setTotal] = useState(0);

  const fetchBlogs = () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '15' });
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    else params.set('status', ''); // Admin sees all
    fetch(`/api/blogs?${params}`)
      .then((r) => r.json())
      .then((d) => { setBlogs(d.data || []); setTotal(d.pagination?.total || 0); })
      .catch(() => toast.error('Failed to load blogs'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBlogs(); }, [search, statusFilter]);

  const deleteBlog = async (id: string) => {
    if (!confirm('Delete this blog post?')) return;
    const res = await fetch(`/api/blogs/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) { toast.success('Blog deleted'); fetchBlogs(); }
    else toast.error('Failed to delete');
  };

  const toggleFeatured = async (id: string, isFeatured: boolean) => {
    const res = await fetch(`/api/blogs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFeatured: !isFeatured }),
    });
    if ((await res.json()).success) fetchBlogs();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-syne text-2xl font-bold text-foreground">Blog Management</h1>
          <p className="text-muted-foreground text-sm">{total} blog posts</p>
        </div>
        <Link href="/admin/blogs/new">
          <Button variant="gradient" leftIcon={<Plus className="w-4 h-4" />}>Write Post</Button>
        </Link>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search blogs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 h-10 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none"
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-24">
            <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No blog posts yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  {['Title', 'Author', 'Status', 'Views', 'Published', 'Actions'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog._id} className="border-b border-border/50 hover:bg-accent/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground max-w-xs truncate flex items-center gap-2">
                        {blog.isFeatured && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />}
                        {blog.title}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {blog.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">#{tag}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{blog.author?.name || '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[blog.status]}`}>
                        {blog.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{blog.viewCount}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {blog.publishedAt ? formatDate(blog.publishedAt, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/blog/${blog.slug}`} target="_blank">
                          <button className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"><Eye className="w-4 h-4" /></button>
                        </Link>
                        <button onClick={() => toggleFeatured(blog._id, blog.isFeatured)} className={`p-1.5 rounded-lg transition-colors ${blog.isFeatured ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20' : 'text-muted-foreground hover:bg-accent'}`}>
                          <Star className="w-4 h-4" fill={blog.isFeatured ? 'currentColor' : 'none'} />
                        </button>
                        <Link href={`/admin/blogs/${blog._id}/edit`}>
                          <button className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-blue-500 transition-colors"><Edit className="w-4 h-4" /></button>
                        </Link>
                        <button onClick={() => deleteBlog(blog._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-muted-foreground hover:text-red-500 transition-colors">
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
    </div>
  );
}
