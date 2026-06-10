'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Loader2, Download, Receipt } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Order {
  _id: string;
  orderNumber: string;
  finalAmount: number;
  amount: number;
  discountAmount: number;
  status: string;
  paymentProvider?: string;
  createdAt: string;
  internshipId?: { title?: string };
}

const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  refunded: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

export default function PaymentsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    fetch('/api/payments/history')
      .then((r) => r.json())
      .then((d) => {
        setOrders(d.data || []);
        const total = (d.data || []).filter((o: Order) => o.status === 'paid').reduce((sum: number, o: Order) => sum + o.finalAmount, 0);
        setTotalSpent(total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-syne text-2xl font-bold text-foreground">Payment History</h1>
        <p className="text-muted-foreground text-sm">{orders.length} transactions</p>
      </div>

      {/* Summary card */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white/70 text-sm">Total Invested in Learning</div>
            <div className="font-syne text-2xl font-bold">{formatCurrency(totalSpent)}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'Completed', value: orders.filter((o) => o.status === 'paid').length },
            { label: 'Pending', value: orders.filter((o) => o.status === 'pending').length },
            { label: 'Refunded', value: orders.filter((o) => o.status === 'refunded').length },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="font-syne font-bold text-xl text-white">{value}</div>
              <div className="text-white/60 text-xs">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-syne text-lg font-bold text-foreground mb-2">No transactions yet</h3>
          <p className="text-muted-foreground text-sm">Enroll in a program to see your payment history</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order._id} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Receipt className="w-5 h-5 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground mb-0.5 truncate">
                    {order.internshipId?.title || 'Internship Enrollment'}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-mono">{order.orderNumber}</span>
                    <span>{formatDate(order.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    {order.paymentProvider && <span className="capitalize">{order.paymentProvider}</span>}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="font-syne font-bold text-foreground">{formatCurrency(order.finalAmount)}</div>
                  {order.discountAmount > 0 && (
                    <div className="text-xs text-emerald-600 dark:text-emerald-400">-{formatCurrency(order.discountAmount)} saved</div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] || ''}`}>
                    {order.status}
                  </span>
                  {order.status === 'paid' && (
                    <button className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground" title="Download invoice">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
