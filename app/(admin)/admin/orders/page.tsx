'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, ShoppingCart, RefreshCw } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/Toaster';

interface Order {
  _id: string;
  orderNumber: string;
  amount: number;
  finalAmount: number;
  discountAmount: number;
  status: string;
  paymentProvider?: string;
  createdAt: string;
  studentId?: { name?: string; email?: string };
  internshipId?: { title?: string };
  couponId?: { code?: string };
}

const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  refunded: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const fetchOrders = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '15' });
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    fetch(`/api/admin/orders?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setOrders(d.data?.orders || []);
        setTotal(d.data?.total || 0);
        setPages(d.data?.pages || 1);
        setTotalRevenue(d.data?.totalRevenue || 0);
      })
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [search, statusFilter, page]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-syne text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground text-sm">{total} total orders · {formatCurrency(totalRevenue)} revenue</p>
        </div>
        <button onClick={fetchOrders} className="p-2 rounded-lg border border-border hover:bg-accent transition-colors" title="Refresh">
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {['paid', 'pending', 'cancelled', 'refunded'].map((status) => {
          const count = orders.filter((o) => o.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                statusFilter === status
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/40'
              }`}
            >
              <div className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit mb-2 capitalize ${STATUS_COLORS[status]}`}>
                {status}
              </div>
              <div className="font-syne font-bold text-xl text-foreground">{count}</div>
            </button>
          );
        })}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by order number or student..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 h-10 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingCart className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  {['Order #', 'Student', 'Program', 'Amount', 'Discount', 'Status', 'Provider', 'Date'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b border-border/50 hover:bg-accent/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{order.orderNumber}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-sm text-foreground">{order.studentId?.name || '—'}</div>
                      <div className="text-xs text-muted-foreground">{order.studentId?.email}</div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground max-w-xs truncate">{order.internshipId?.title || '—'}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{formatCurrency(order.finalAmount)}</div>
                      {order.amount !== order.finalAmount && (
                        <div className="text-xs text-muted-foreground line-through">{formatCurrency(order.amount)}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-emerald-600">
                      {order.discountAmount > 0 ? `-${formatCurrency(order.discountAmount)}` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] || ''}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground capitalize">{order.paymentProvider || '—'}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{formatDate(order.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
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
