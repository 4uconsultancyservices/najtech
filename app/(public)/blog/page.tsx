'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Search, Calendar, Eye, Tag, Loader2, FileText } from 'lucide-react';
import { formatDate, truncate } from '@/lib/utils';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail?: string;
  tags: string[];
  viewCount: number;
  publishedAt?: string;
  createdAt: string;
  author?: { name?: string; avatar?: string };
  category?: { name?: string };
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '9' });
    if (search) params.set('search', search);
    fetch(`/api/blogs?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setBlogs(d.data || []);
        setTotal(d.pagination?.total || 0);
        setPages(d.pagination?.pages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, page]);

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-syne text-4xl sm:text-5xl font-bold text-foreground mb-4">
            NajTech <span className="gradient-text">Blog</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Insights, career tips, and success stories from our community of mentors and alumni.
          </p>
          <div className="relative max-w-md mx-auto mt-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 h-11 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-3">{total} articles published</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-24">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-syne text-xl font-semibold text-foreground mb-2">No articles found</h3>
            <p className="text-muted-foreground">Try a different search term</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {blogs.map((blog, i) => (
                <motion.div
                  key={blog._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                >
                  <Link href={`/blog/${blog.slug}`} className="group block">
                    <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                      <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                        {blog.thumbnail ? (
                          <Image
                            src={blog.thumbnail}
                            alt={blog.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <FileText className="w-12 h-12 text-primary/30" />
                          </div>
                        )}
                        {blog.category && (
                          <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary text-white">
                              {blog.category.name}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(blog.publishedAt || blog.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {blog.viewCount} views
                          </div>
                        </div>

                        <h3 className="font-syne font-bold text-foreground text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {blog.title}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{blog.excerpt}</p>

                        <div className="flex flex-wrap gap-1.5">
                          {blog.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                              <Tag className="w-2.5 h-2.5" /> {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {pages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 text-sm border border-border rounded-lg disabled:opacity-50 hover:bg-accent transition-colors">
                  Previous
                </button>
                <span className="text-sm text-muted-foreground">Page {page} of {pages}</span>
                <button disabled={page === pages} onClick={() => setPage(page + 1)} className="px-4 py-2 text-sm border border-border rounded-lg disabled:opacity-50 hover:bg-accent transition-colors">
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
