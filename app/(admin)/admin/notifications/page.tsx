'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, BellRing, CheckCheck, Trash2, Plus, Loader2,
  Send, X, Search, Filter, Users, User, RefreshCw,
  Info, CheckCircle, AlertTriangle, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toaster';
import { formatRelativeTime } from '@/lib/utils';

/* ─── Types ──────────────────────────────────────────────────────────── */
type NotifType = 'info' | 'success' | 'warning' | 'error';
type SendTarget = 'all' | 'role' | 'user';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: NotifType;
  isRead: boolean;
  link?: string;
  createdAt: string;
  userId?: { name?: string; email?: string; role?: string };
}

/* ─── Config ─────────────────────────────────────────────────────────── */
const TYPE_CONFIG: Record<NotifType, { icon: React.ElementType; color: string; bg: string }> = {
  info:    { icon: Info,          color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-100 dark:bg-blue-950/40'    },
  success: { icon: CheckCircle,   color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-950/40' },
  warning: { icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-100 dark:bg-amber-950/40'  },
  error:   { icon: AlertCircle,   color: 'text-red-600 dark:text-red-400',      bg: 'bg-red-100 dark:bg-red-950/40'      },
};

const defaultForm = {
  title: '',
  message: '',
  type: 'info' as NotifType,
  link: '',
  target: 'all' as SendTarget,
  role: 'student',
  userId: '',
};

/* ─── Page ───────────────────────────────────────────────────────────── */
export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm]     = useState(false);
  const [sending, setSending]       = useState(false);
  const [search, setSearch]         = useState('');
  const [typeFilter, setTypeFilter] = useState<NotifType | 'all'>('all');
  const [readFilter, setReadFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [form, setForm]             = useState(defaultForm);
  const [total, setTotal]           = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  /* Fetch */
  const fetchNotifications = (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    fetch('/api/admin/notifications')
      .then((r) => r.json())
      .then((d) => {
        setNotifications(d.data?.notifications || []);
        setTotal(d.data?.total || 0);
        setUnreadCount(d.data?.unreadCount || 0);
      })
      .catch(() => toast.error('Failed to load notifications'))
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { fetchNotifications(); }, []);

  /* Send notification */
  const handleSend = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Title and message are required');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Notification sent to ${data.data?.sentCount || 'users'}!`);
        setShowForm(false);
        setForm(defaultForm);
        fetchNotifications(true);
      } else {
        toast.error(data.error || 'Failed to send notification');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSending(false);
    }
  };

  /* Mark all read */
  const markAllRead = async () => {
    const res = await fetch('/api/admin/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success('All marked as read');
      fetchNotifications(true);
    }
  };

  /* Delete */
  const deleteNotification = async (id: string) => {
    const res = await fetch(`/api/admin/notifications/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setTotal((t) => t - 1);
    } else {
      toast.error('Failed to delete');
    }
  };

  /* Filtered list */
  const filtered = notifications.filter((n) => {
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    if (readFilter === 'read' && !n.isRead) return false;
    if (readFilter === 'unread' && n.isRead) return false;
    if (search) {
      const s = search.toLowerCase();
      return n.title.toLowerCase().includes(s) || n.message.toLowerCase().includes(s);
    }
    return true;
  });

  const updateForm = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-syne text-2xl font-bold text-foreground">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm">{total} total notifications</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchNotifications(true)}
            className={`p-2 rounded-xl border border-border hover:bg-accent transition-colors ${refreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" leftIcon={<CheckCheck className="w-4 h-4" />} onClick={markAllRead}>
              Mark all read
            </Button>
          )}
          <Button variant="gradient" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(true)}>
            Send Notification
          </Button>
        </div>
      </div>

      {/* ── Type badges ── */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'info', 'success', 'warning', 'error'] as const).map((t) => {
          const cfg = t !== 'all' ? TYPE_CONFIG[t] : null;
          return (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all capitalize
                ${typeFilter === t
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}
            >
              {cfg && <cfg.icon className="w-3 h-3" />}
              {t}
            </button>
          );
        })}
      </div>

      {/* ── Filters row ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 h-10 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex items-center p-1 bg-muted rounded-xl text-sm">
          {(['all', 'unread', 'read'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setReadFilter(r)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${readFilter === r ? 'bg-card text-foreground shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ── Send Notification Modal ── */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-syne font-bold text-xl text-foreground">Send Notification</h2>
                  <p className="text-sm text-muted-foreground">Broadcast a message to users</p>
                </div>
                <button
                  onClick={() => { setShowForm(false); setForm(defaultForm); }}
                  className="p-2 rounded-xl hover:bg-accent transition-colors text-muted-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Target */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Send To</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { value: 'all', label: 'All Users', icon: Users },
                      { value: 'role', label: 'By Role', icon: Filter },
                      { value: 'user', label: 'Specific User', icon: User },
                    ] as const).map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updateForm('target', value)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                          form.target === value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Role selector */}
                {form.target === 'role' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Role</label>
                    <select
                      value={form.role}
                      onChange={(e) => updateForm('role', e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="student">Students</option>
                      <option value="mentor">Mentors</option>
                      <option value="admin">Admins</option>
                    </select>
                  </div>
                )}

                {/* User ID */}
                {form.target === 'user' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">User ID</label>
                    <input
                      value={form.userId}
                      onChange={(e) => updateForm('userId', e.target.value)}
                      placeholder="MongoDB ObjectId of the user"
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                )}

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['info', 'success', 'warning', 'error'] as const).map((t) => {
                      const cfg = TYPE_CONFIG[t];
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => updateForm('type', t)}
                          className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg border text-xs font-medium transition-all capitalize ${
                            form.type === t
                              ? `${cfg.bg} ${cfg.color} border-current`
                              : 'border-border text-muted-foreground hover:border-primary/40'
                          }`}
                        >
                          <cfg.icon className="w-3.5 h-3.5" />
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) => updateForm('title', e.target.value)}
                    placeholder="Notification headline..."
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => updateForm('message', e.target.value)}
                    rows={3}
                    placeholder="Detailed notification message..."
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>

                {/* Link */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Action Link <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <input
                    value={form.link}
                    onChange={(e) => updateForm('link', e.target.value)}
                    placeholder="/internships or https://..."
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setShowForm(false); setForm(defaultForm); }}
                >
                  Cancel
                </Button>
                <Button
                  variant="gradient"
                  className="flex-1"
                  loading={sending}
                  leftIcon={<Send className="w-4 h-4" />}
                  onClick={handleSend}
                >
                  Send Notification
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── List ── */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <BellRing className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="font-syne text-lg font-semibold text-foreground mb-1">No notifications</h3>
          <p className="text-muted-foreground text-sm">
            {search || typeFilter !== 'all' || readFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Send your first notification to users'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {filtered.map((notif, i) => {
              const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={notif._id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.03 }}
                >
                  <div className={`flex items-start gap-4 p-4 rounded-2xl border transition-all group ${
                    !notif.isRead
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-border bg-card hover:border-border/60'
                  }`}>
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-foreground">{notif.title}</span>
                            {!notif.isRead && (
                              <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                            )}
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md capitalize ${cfg.bg} ${cfg.color}`}>
                              {notif.type}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => deleteNotification(notif._id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-muted-foreground hover:text-red-500"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Footer row */}
                      <div className="flex items-center flex-wrap gap-3 mt-2">
                        {notif.userId && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <User className="w-3 h-3" />
                            <span>{notif.userId.name || notif.userId.email}</span>
                            {notif.userId.role && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted capitalize">
                                {notif.userId.role}
                              </span>
                            )}
                          </div>
                        )}
                        {notif.link && (
                          <a
                            href={notif.link}
                            className="text-xs text-primary hover:underline"
                            target={notif.link.startsWith('http') ? '_blank' : undefined}
                            rel="noreferrer"
                          >
                            View link →
                          </a>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}