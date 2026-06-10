'use client';

import { useEffect, useState } from 'react';
import {
  Users, BookOpen, ShoppingCart, TrendingUp, Award, ClipboardList,
  ArrowUpRight, ArrowDownRight, Loader2,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    newUsersThisMonth: number;
    userGrowth: number;
    totalInternships: number;
    publishedInternships: number;
    thisMonthRevenue: number;
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

function StatCard({
  icon: Icon,
  label,
  value,
  growth,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  growth?: number;
  color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {growth !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${growth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {growth >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {Math.abs(growth)}%
          </div>
        )}
      </div>
      <div className="font-syne text-2xl font-bold text-foreground mb-0.5">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then((d) => setData(d.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  const { overview, revenueData, recentOrders } = data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-syne text-2xl font-bold text-foreground">Platform Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Real-time analytics for NajTech</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value={overview.totalUsers.toLocaleString('en-IN')} growth={overview.userGrowth} color="from-indigo-500 to-purple-600" />
        <StatCard icon={ShoppingCart} label="Monthly Revenue" value={formatCurrency(overview.thisMonthRevenue)} growth={overview.revenueGrowth} color="from-emerald-500 to-teal-600" />
        <StatCard icon={BookOpen} label="Active Enrollments" value={overview.activeEnrollments.toLocaleString('en-IN')} color="from-cyan-500 to-blue-600" />
        <StatCard icon={Award} label="Certificates Issued" value={overview.totalCertificates.toLocaleString('en-IN')} color="from-amber-500 to-orange-600" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Published Internships" value={overview.publishedInternships} color="from-purple-500 to-pink-600" />
        <StatCard icon={TrendingUp} label="Completed Programs" value={overview.completedEnrollments} color="from-rose-500 to-red-600" />
        <StatCard icon={ClipboardList} label="Pending Assignments" value={overview.pendingAssignments} color="from-sky-500 to-cyan-600" />
        <StatCard icon={Users} label="New Users (Month)" value={overview.newUsersThisMonth} color="from-violet-500 to-indigo-600" />
      </div>

      {/* Revenue chart */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-syne text-lg font-semibold text-foreground mb-5">Revenue Overview</h2>
        {revenueData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} tickFormatter={(v) => `₹${v/1000}k`} />
              <Tooltip formatter={(v: number) => [formatCurrency(v), 'Revenue']} contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">No revenue data yet</div>
        )}
      </div>

      {/* Recent orders */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-syne text-lg font-semibold text-foreground mb-5">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Order</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Student</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Program</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id} className="border-b border-border/50 hover:bg-accent/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{order.orderNumber}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground">{order.studentId?.name || '—'}</div>
                      <div className="text-xs text-muted-foreground">{order.studentId?.email}</div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground max-w-xs truncate">{order.internshipId?.title || '—'}</td>
                    <td className="py-3 px-4 font-semibold text-foreground">{formatCurrency(order.finalAmount)}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        order.status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
                        order.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                        'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">{formatDate(order.createdAt)}</td>
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
