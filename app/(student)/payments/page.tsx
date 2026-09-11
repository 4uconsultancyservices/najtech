'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Loader2, Download, Receipt, QrCode, Clock, Eye, X, Printer, Check, Copy, Tag, BookOpen, ShieldCheck } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toaster';

interface Order {
  _id: string;
  orderNumber: string;
  finalAmount: number;
  amount: number;
  discountAmount: number;
  status: string;
  paymentProvider?: string;
  utrNumber?: string;
  senderUpiId?: string;
  paymentNotes?: string;
  createdAt: string;
  internshipId?: { title?: string; duration?: number };
  couponId?: { code?: string };
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [copiedUtr, setCopiedUtr] = useState(false);

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

  const handleCopyUtr = (utr: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(true);
    toast.success('UTR copied to clipboard!');
    setTimeout(() => setCopiedUtr(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-syne text-2xl font-bold text-foreground">Payment & Order History</h1>
        <p className="text-muted-foreground text-sm">{orders.length} total transactions</p>
      </div>

      {/* Summary card */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white/70 text-sm">Total Verified Investment</div>
            <div className="font-syne text-2xl font-bold">{formatCurrency(totalSpent)}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'Verified & Paid', value: orders.filter((o) => o.status === 'paid').length },
            { label: 'Pending Review', value: orders.filter((o) => o.status === 'pending').length },
            { label: 'Refunded / Other', value: orders.filter((o) => ['refunded', 'cancelled'].includes(o.status)).length },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="font-syne font-bold text-xl text-white">{value}</div>
              <div className="text-white/70 text-xs mt-0.5">{label}</div>
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
            <div
              key={order._id}
              onClick={() => setSelectedOrder(order)}
              className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 transition-all shadow-sm cursor-pointer group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1 sm:mt-0 text-primary group-hover:scale-105 transition-transform">
                    {order.paymentProvider === 'upi_qr' ? <QrCode className="w-5 h-5 text-emerald-500" /> : <Receipt className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="font-semibold text-base text-foreground mb-1 group-hover:text-primary transition-colors flex items-center gap-2">
                      <span>{order.internshipId?.title || 'Internship Program Enrollment'}</span>
                      <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="font-mono font-medium text-foreground">#{order.orderNumber}</span>
                      <span>•</span>
                      <span>{formatDate(order.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>•</span>
                      <span className="capitalize font-medium text-foreground">
                        {order.paymentProvider === 'upi_qr' ? 'UPI QR Payment' : order.paymentProvider || 'Standard'}
                      </span>
                    </div>

                    {order.utrNumber && (
                      <div className="mt-2 text-xs font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg w-fit flex items-center gap-1.5">
                        <QrCode className="w-3.5 h-3.5" />
                        <span>UTR Trans ID: {order.utrNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-border">
                  <div className="text-right">
                    <div className="font-syne font-bold text-lg text-foreground">{formatCurrency(order.finalAmount)}</div>
                    {order.discountAmount > 0 && (
                      <div className="text-xs text-emerald-600 dark:text-emerald-400">-{formatCurrency(order.discountAmount)} saved</div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[order.status] || ''}`}>
                      {order.status === 'pending' ? 'Verification Pending' : order.status}
                    </span>
                    <Button size="xs" variant="outline">
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* STUDENT ORDER RECEIPT / DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 relative my-8">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <h2 className="font-syne text-2xl font-bold text-foreground">
                  Order Receipt
                </h2>
                <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${STATUS_COLORS[selectedOrder.status]}`}>
                  {selectedOrder.status === 'pending' ? 'Verification Pending' : selectedOrder.status}
                </span>
              </div>
              <p className="text-xs font-mono text-muted-foreground mt-1">
                Order #: <strong className="text-foreground">{selectedOrder.orderNumber}</strong> • Date: {formatDate(selectedOrder.createdAt, { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            {/* Internship Program Info */}
            <div className="bg-muted/40 p-4 rounded-2xl border border-border space-y-2 text-xs">
              <h3 className="font-syne font-bold text-foreground text-sm flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-primary" />
                Enrolled Program
              </h3>
              <div className="text-sm font-semibold text-foreground">{selectedOrder.internshipId?.title || 'Internship Program'}</div>
              <div className="text-muted-foreground">Duration: {selectedOrder.internshipId?.duration || 4} Weeks • Live Industry Mentorship Included</div>
            </div>

            {/* Payment & UTR Info */}
            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3 text-xs">
              <h3 className="font-syne font-bold text-foreground text-sm flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                Payment Method & Reference
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground block mb-0.5">Method:</span>
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
              </div>

              {selectedOrder.status === 'pending' && (
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400 flex items-center gap-2 text-[11px]">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>Our team is verifying your UTR against bank records. Dashboard access unlocks automatically upon verification!</span>
                </div>
              )}
            </div>

            {/* Financial Breakdown */}
            <div className="p-4 rounded-2xl bg-card border border-border space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Program Fee:</span>
                <span className="font-medium text-foreground">{formatCurrency(selectedOrder.amount)}</span>
              </div>

              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount ({selectedOrder.couponId?.code || 'Applied'}):</span>
                  <span className="font-semibold">-{formatCurrency(selectedOrder.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground">
                <span>Taxes & GST:</span>
                <span className="text-emerald-500 font-semibold uppercase">Included</span>
              </div>

              <div className="pt-2 border-t border-border flex justify-between font-syne text-base font-bold text-foreground">
                <span>Total Amount:</span>
                <span className="text-lg text-primary">{formatCurrency(selectedOrder.finalAmount)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                leftIcon={<Printer className="w-3.5 h-3.5" />}
              >
                Print Receipt
              </Button>
              <Button
                variant="gradient"
                size="sm"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
