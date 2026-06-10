'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, ShoppingCart, TrendingUp, Award, ClipboardList,
  ArrowUpRight, ArrowDownRight, Loader2, RefreshCw, DollarSign,
  UserCheck, Globe, Percent,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { formatCurrency, formatDate } from '@/lib/utils';

/* ─── Types ────────────────────────────────────────────────────────── */
interface AnalyticsData {
  overview: {
    totalUsers: number;
    newUsersThisMonth: number;
    userGrowth: number;
    totalInternships: number;
    publishedInternships: number;
    totalOrders: number;
    thisMonthRevenue: number;
    lastMonthRevenue: number;
    revenueGrowth: number;
    totalEnrollments: number;
    activeEnrollments: number;
    completedEnrollments: number;
    totalCertificates: number;
    pendingAssignments: number;
  };
  revenueData: Array<{ month: string; revenue: number; orders: number }>;
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    finalAmount: number;
    status: string;
    createdAt: string;
    studentId?: { name?: string; email?: string };
    internshipId?: { title?: string };
  }>;
}

/* ─── Stat card ─────────────────────────────────────────────────────── */
function StatCard({
  icon: Icon, label, value, sub, growth, color, delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  growth?: number;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {growth !== undefined && (
            <div className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${growth >= 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400'}`}>
              {growth >= 0
                ? <ArrowUpRight className="w-3 h-3" />
                : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(growth)}%
            </div>
          )}
        </div>
        <div className="font-syne text-2xl font-bold text-foreground leading-none mb-1">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      </div>
    </motion.div>
  );
}

/* ─── Tooltip ───────────────────────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label, currency }: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
  currency?: boolean;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-xl px-4 py-3 text-sm">
      <p className="text-muted-foreground font-medium mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground capitalize">{p.name}:</span>
          <span className="font-semibold text-foreground">
            {currency ? formatCurrency(p.value) : p.value.toLocaleString('en-IN')}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ─── Colours ───────────────────────────────────────────────────────── */
const PIE_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f97316'];

/* ─── Page ───────────────────────────────────────────────────────────── */
export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  const fetch_data = (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then((d) => setData(d.data))
      .catch(() => {})
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { fetch_data(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }
  if (!data) return null;

  const { overview, revenueData, recentOrders } = data;

  /* Enrollment breakdown for pie chart */
  const enrollmentPie = [
    { name: 'Active', value: overview.activeEnrollments },
    { name: 'Completed', value: overview.completedEnrollments },
    { name: 'Others', value: Math.max(0, overview.totalEnrollments - overview.activeEnrollments - overview.completedEnrollments) },
  ].filter((d) => d.value > 0);

  /* Completion rate */
  const completionRate = overview.totalEnrollments > 0
    ? Math.round((overview.completedEnrollments / overview.totalEnrollments) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Page title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-syne text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground text-sm">
            Platform performance overview · Updated just now
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period selector */}
          <div className="flex items-center p-1 bg-muted rounded-xl text-sm">
            {(['week', 'month', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${period === p ? 'bg-card text-foreground shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => fetch_data(true)}
            className={`p-2 rounded-xl border border-border hover:bg-accent transition-all ${refreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* ── Primary KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value={overview.totalUsers.toLocaleString('en-IN')} sub={`+${overview.newUsersThisMonth} this month`} growth={overview.userGrowth} color="from-indigo-500 to-purple-600" delay={0} />
        <StatCard icon={DollarSign} label="Monthly Revenue" value={formatCurrency(overview.thisMonthRevenue)} sub={`Last month: ${formatCurrency(overview.lastMonthRevenue)}`} growth={overview.revenueGrowth} color="from-emerald-500 to-teal-600" delay={0.06} />
        <StatCard icon={BookOpen} label="Active Enrollments" value={overview.activeEnrollments.toLocaleString('en-IN')} sub={`${overview.totalEnrollments.toLocaleString('en-IN')} total`} color="from-cyan-500 to-blue-600" delay={0.12} />
        <StatCard icon={Award} label="Certificates Issued" value={overview.totalCertificates.toLocaleString('en-IN')} color="from-amber-500 to-orange-600" delay={0.18} />
      </div>

      {/* ── Secondary KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ShoppingCart} label="Total Orders" value={overview.totalOrders.toLocaleString('en-IN')} color="from-purple-500 to-pink-600" delay={0.24} />
        <StatCard icon={TrendingUp} label="Completed Programs" value={overview.completedEnrollments.toLocaleString('en-IN')} color="from-rose-500 to-red-600" delay={0.3} />
        <StatCard icon={ClipboardList} label="Pending Assignments" value={overview.pendingAssignments.toLocaleString('en-IN')} color="from-sky-500 to-cyan-600" delay={0.36} />
        <StatCard icon={Percent} label="Completion Rate" value={`${completionRate}%`} color="from-violet-500 to-indigo-600" delay={0.42} />
      </div>

      {/* ── Charts row 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue area chart – 2/3 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="lg:col-span-2 bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-syne font-semibold text-foreground">Revenue Trend</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Monthly revenue and order count</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><div className="w-3 h-1 rounded-full bg-indigo-500" /> Revenue</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-1 rounded-full bg-cyan-500" /> Orders</div>
            </div>
          </div>

          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="rev" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} tickLine={false} axisLine={false} />
                <YAxis yAxisId="ord" orientation="right" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip currency />} />
                <Area yAxisId="rev" type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#gRevenue)" dot={false} activeDot={{ r: 5, fill: '#6366f1' }} />
                <Area yAxisId="ord" type="monotone" dataKey="orders" stroke="#06b6d4" strokeWidth={2} fill="url(#gOrders)" dot={false} activeDot={{ r: 4, fill: '#06b6d4' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-2">
              <TrendingUp className="w-8 h-8 opacity-40" />
              <p className="text-sm">No revenue data yet</p>
            </div>
          )}
        </motion.div>

        {/* Enrollment pie – 1/3 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h2 className="font-syne font-semibold text-foreground mb-1">Enrollments</h2>
          <p className="text-xs text-muted-foreground mb-5">Status breakdown</p>

          {enrollmentPie.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={enrollmentPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={78}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {enrollmentPie.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {enrollmentPie.map((entry, i) => (
                  <div key={entry.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-muted-foreground">{entry.name}</span>
                    </div>
                    <div className="font-semibold text-foreground">
                      {entry.value}
                      <span className="text-xs text-muted-foreground ml-1">
                        ({overview.totalEnrollments > 0 ? Math.round((entry.value / overview.totalEnrollments) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
              No enrollment data
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Charts row 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly orders bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h2 className="font-syne font-semibold text-foreground mb-1">Monthly Orders</h2>
          <p className="text-xs text-muted-foreground mb-5">Order volume per month</p>

          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--accent)', opacity: 0.5 }} />
                <Bar dataKey="orders" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-52 text-muted-foreground text-sm">No data yet</div>
          )}
        </motion.div>

        {/* Quick metrics table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h2 className="font-syne font-semibold text-foreground mb-1">Platform Metrics</h2>
          <p className="text-xs text-muted-foreground mb-5">Key performance indicators</p>

          <div className="space-y-3">
            {[
              { icon: Globe, label: 'Published Internships', value: overview.publishedInternships, total: overview.totalInternships, color: 'bg-indigo-500' },
              { icon: UserCheck, label: 'Avg Revenue / Student', value: overview.totalUsers > 0 ? formatCurrency(overview.thisMonthRevenue / Math.max(overview.newUsersThisMonth, 1)) : '₹0', total: null, color: 'bg-emerald-500' },
              { icon: Award, label: 'Cert / Enrolled ratio', value: `${overview.totalEnrollments > 0 ? Math.round((overview.totalCertificates / overview.totalEnrollments) * 100) : 0}%`, total: null, color: 'bg-amber-500' },
              { icon: ClipboardList, label: 'Pending Reviews', value: overview.pendingAssignments, total: null, color: 'bg-rose-500' },
              { icon: TrendingUp, label: 'YoY Revenue Growth', value: `${overview.revenueGrowth >= 0 ? '+' : ''}${overview.revenueGrowth}%`, total: null, color: overview.revenueGrowth >= 0 ? 'bg-emerald-500' : 'bg-red-500' },
            ].map(({ icon: Icon, label, value, total, color }) => (
              <div key={label} className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors">
                <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
                <div className="font-syne font-bold text-foreground">
                  {value}
                  {total !== null && (
                    <span className="text-xs text-muted-foreground font-normal ml-1">/ {total}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Recent Orders ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-card border border-border rounded-2xl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="font-syne font-semibold text-foreground">Recent Transactions</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Last 5 paid orders</p>
          </div>
          <a href="/admin/orders" className="text-xs text-primary hover:underline font-medium">
            View all →
          </a>
        </div>

        {recentOrders.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
            No orders yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60">
                  {['Order #', 'Student', 'Program', 'Amount', 'Status', 'Date'].map((h) => (
                    <th key={h} className="text-left py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, i) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 + i * 0.04 }}
                    className="border-b border-border/40 hover:bg-accent/40 transition-colors"
                  >
                    <td className="py-3.5 px-5 font-mono text-xs text-muted-foreground">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {order.studentId?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="font-medium text-foreground text-xs">{order.studentId?.name || '—'}</div>
                          <div className="text-[10px] text-muted-foreground">{order.studentId?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-muted-foreground max-w-[200px] truncate">
                      {order.internshipId?.title || '—'}
                    </td>
                    <td className="py-3.5 px-5 font-syne font-bold text-foreground text-sm">
                      {formatCurrency(order.finalAmount)}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        order.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : order.status === 'pending'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                          : 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-muted-foreground">
                      {formatDate(order.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}