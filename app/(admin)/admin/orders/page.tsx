'use client';

import { useState, useEffect } from 'react';
import {
  Search, Loader2, ShoppingCart, RefreshCw, CheckCircle2, QrCode, ShieldCheck,
  Eye, X, Copy, Check, User, BookOpen, Calendar, CreditCard, Tag, FileText, Printer
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/Toaster';
import { Button } from '@/components/ui/Button';

interface Order {
  _id: string;
  orderNumber: string;
  amount: number;
  finalAmount: number;
  discountAmount: number;
  currency?: string;
  status: string;
  paymentProvider?: string;
  paymentId?: string;
  utrNumber?: string;
  senderUpiId?: string;
  paymentNotes?: string;
  verifiedAt?: string;
  createdAt: string;
  studentId?: { _id?: string; name?: string; email?: string; role?: string };
  internshipId?: { _id?: string; title?: string; slug?: string; thumbnail?: string; duration?: number; price?: number };
  couponId?: { _id?: string; code?: string; value?: number; type?: string };
  verifiedBy?: { _id?: string; name?: string; email?: string };
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

  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [copiedUtr, setCopiedUtr] = useState(false);

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

  const handleVerifyOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm(`Are you sure you want to verify payment and enroll the student for Order #${orderNumber}?`)) {
      return;
    }

    setVerifyingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/verify`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Payment verified and enrollment activated for Order #${orderNumber}!`);
        if (selectedOrder?._id === orderId) {
          setSelectedOrder((prev) => prev ? { ...prev, status: 'paid', verifiedAt: new Date().toISOString() } : null);
        }
        fetchOrders();
      } else {
        toast.error(data.error || 'Failed to verify order');
      }
    } catch {
      toast.error('Verification failed');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleCopyUtr = (utr: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(true);
    toast.success('UTR copied to clipboard!');
    setTimeout(() => setCopiedUtr(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-syne text-2xl font-bold text-foreground">Orders & Payments</h1>
          <p className="text-muted-foreground text-sm">{total} total orders · {formatCurrency(totalRevenue)} verified revenue</p>
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
                {status === 'pending' ? 'Pending Review' : status}
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
          placeholder="Search by order #, UTR, or student..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 h-10 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Orders Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
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
                  {['Order # / UTR', 'Student', 'Program', 'Amount', 'Discount', 'Status', 'Provider', 'Date', 'Action'].map((h) => (
                    <th key={h} className="text-left py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b border-border/50 hover:bg-accent/40 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-xs text-foreground font-semibold flex items-center gap-1.5">
                        <span>{order.orderNumber}</span>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1 rounded text-muted-foreground hover:text-primary transition-colors"
                          title="View Full Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {order.utrNumber && (
                        <div className="flex items-center gap-1 mt-0.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                          <QrCode className="w-3 h-3 flex-shrink-0" />
                          <span>UTR: {order.utrNumber}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-sm text-foreground">{order.studentId?.name || '—'}</div>
                      <div className="text-xs text-muted-foreground">{order.studentId?.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-muted-foreground max-w-xs truncate">{order.internshipId?.title || '—'}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground">{formatCurrency(order.finalAmount)}</div>
                      {order.amount !== order.finalAmount && (
                        <div className="text-xs text-muted-foreground line-through">{formatCurrency(order.amount)}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-sm text-emerald-600">
                      {order.discountAmount > 0 ? `-${formatCurrency(order.discountAmount)}` : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] || ''}`}>
                        {order.status === 'pending' ? 'Pending Review' : order.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-muted-foreground capitalize">
                      {order.paymentProvider === 'upi_qr' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                          <QrCode className="w-3 h-3" /> UPI QR
                        </span>
                      ) : (
                        order.paymentProvider || '—'
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-muted-foreground">{formatDate(order.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => setSelectedOrder(order)}
                          leftIcon={<Eye className="w-3 h-3" />}
                        >
                          Details
                        </Button>
                        {order.status === 'pending' && (
                          <Button
                            size="xs"
                            variant="gradient"
                            loading={verifyingId === order._id}
                            onClick={() => handleVerifyOrder(order._id, order.orderNumber)}
                            leftIcon={<CheckCircle2 className="w-3 h-3" />}
                          >
                            Approve
                          </Button>
                        )}
                      </div>
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

      {/* FULL ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 relative my-8">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Info */}
            <div className="border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <h2 className="font-syne text-2xl font-bold text-foreground">
                  Order Details
                </h2>
                <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${STATUS_COLORS[selectedOrder.status]}`}>
                  {selectedOrder.status === 'pending' ? 'Pending Review' : selectedOrder.status}
                </span>
              </div>
              <p className="text-xs font-mono text-muted-foreground mt-1">
                Order #: <strong className="text-foreground">{selectedOrder.orderNumber}</strong> • Placed on {formatDate(selectedOrder.createdAt, { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            {/* Grid 2 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              {/* Student Details */}
              <div className="bg-muted/40 p-4 rounded-2xl border border-border space-y-2">
                <h3 className="font-syne font-bold text-foreground text-sm flex items-center gap-1.5">
                  <User className="w-4 h-4 text-primary" />
                  Student Information
                </h3>
                <div className="space-y-1 text-muted-foreground pt-1">
                  <div>Name: <span className="font-semibold text-foreground">{selectedOrder.studentId?.name || 'N/A'}</span></div>
                  <div>Email: <span className="font-semibold text-foreground">{selectedOrder.studentId?.email || 'N/A'}</span></div>
                  <div>Role: <span className="font-semibold text-foreground capitalize">{selectedOrder.studentId?.role || 'Student'}</span></div>
                </div>
              </div>

              {/* Program Details */}
              <div className="bg-muted/40 p-4 rounded-2xl border border-border space-y-2">
                <h3 className="font-syne font-bold text-foreground text-sm flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Internship Program
                </h3>
                <div className="space-y-1 text-muted-foreground pt-1">
                  <div>Title: <span className="font-semibold text-foreground">{selectedOrder.internshipId?.title || 'N/A'}</span></div>
                  <div>Duration: <span className="font-semibold text-foreground">{selectedOrder.internshipId?.duration || 4} Weeks</span></div>
                  <div>Certificate: <span className="font-semibold text-emerald-600">Included & Verified</span></div>
                </div>
              </div>
            </div>

            {/* Payment & UTR Section */}
            <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-3 text-xs">
              <h3 className="font-syne font-bold text-foreground text-sm flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-indigo-500" />
                Payment & Verification Info
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="text-muted-foreground block mb-0.5">Payment Method:</span>
                  <span className="font-semibold text-foreground capitalize flex items-center gap-1">
                    {selectedOrder.paymentProvider === 'upi_qr' && <QrCode className="w-3.5 h-3.5 text-emerald-500" />}
                    {selectedOrder.paymentProvider === 'upi_qr' ? 'UPI QR Payment' : selectedOrder.paymentProvider || 'Online'}
                  </span>
                </div>

                {selectedOrder.utrNumber && (
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Transaction ID / UTR:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {selectedOrder.utrNumber}
                      </span>
                      <button
                        onClick={() => handleCopyUtr(selectedOrder.utrNumber!)}
                        className="p-1 text-muted-foreground hover:text-foreground"
                        title="Copy UTR"
                      >
                        {copiedUtr ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                {selectedOrder.senderUpiId && (
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Sender UPI ID:</span>
                    <span className="font-mono text-foreground font-semibold">{selectedOrder.senderUpiId}</span>
                  </div>
                )}

                {selectedOrder.verifiedBy && (
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Verified By:</span>
                    <span className="font-semibold text-foreground">{selectedOrder.verifiedBy.name || selectedOrder.verifiedBy.email}</span>
                  </div>
                )}
              </div>

              {selectedOrder.paymentNotes && (
                <div className="pt-2 border-t border-indigo-500/10">
                  <span className="text-muted-foreground block mb-0.5">Payment Notes:</span>
                  <p className="text-foreground italic bg-background p-2 rounded-lg border border-border">"{selectedOrder.paymentNotes}"</p>
                </div>
              )}
            </div>

            {/* Financial Summary */}
            <div className="p-4 rounded-2xl bg-card border border-border space-y-2 text-xs">
              <h3 className="font-syne font-bold text-foreground text-sm flex items-center gap-1.5 mb-2">
                <Tag className="w-4 h-4 text-primary" />
                Financial Breakdown
              </h3>

              <div className="flex justify-between text-muted-foreground">
                <span>Program Price:</span>
                <span className="font-medium text-foreground">{formatCurrency(selectedOrder.amount)}</span>
              </div>

              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount ({selectedOrder.couponId?.code || 'Applied'}):</span>
                  <span className="font-semibold">-{formatCurrency(selectedOrder.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground">
                <span>GST & Taxes:</span>
                <span className="text-emerald-500 font-semibold uppercase">Included</span>
              </div>

              <div className="pt-2 border-t border-border flex justify-between font-syne text-base font-bold text-foreground">
                <span>Final Paid Amount:</span>
                <span className="text-lg text-primary">{formatCurrency(selectedOrder.finalAmount)}</span>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                leftIcon={<Printer className="w-3.5 h-3.5" />}
              >
                Print Receipt
              </Button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </Button>

                {selectedOrder.status === 'pending' && (
                  <Button
                    variant="gradient"
                    size="sm"
                    loading={verifyingId === selectedOrder._id}
                    onClick={() => handleVerifyOrder(selectedOrder._id, selectedOrder.orderNumber)}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Approve & Enroll Student
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
