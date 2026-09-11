'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Trash2, ArrowRight, ShieldCheck, Tag, Award, CheckCircle2,
  Loader2, Sparkles, CreditCard, Lock, QrCode, Copy, Check, Info, Clock, AlertCircle
} from 'lucide-react';
import { useCartStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/components/ui/Toaster';
import { useSession } from 'next-auth/react';

export default function CartPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, removeItem, clearCart, coupon, setCoupon } = useCartStore();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState<'razorpay' | 'upi_qr' | 'test'>('razorpay');

  // UPI Specific state
  const [utrNumber, setUtrNumber] = useState('');
  const [senderUpiId, setSenderUpiId] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Pending order verification modal state
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState<{
    orderNumber: string;
    utrNumber: string;
    amount: number;
    title: string;
  } | null>(null);

  // Calculations
  const rawSubtotal = items.reduce((acc, item) => acc + item.price, 0);
  const effectiveSubtotal = items.reduce((acc, item) => acc + (item.discountPrice || item.price), 0);
  const regularSavings = rawSubtotal - effectiveSubtotal;

  let couponDiscount = 0;
  if (coupon) {
    couponDiscount = coupon.discountAmount || 0;
  }

  const finalTotal = Math.max(0, effectiveSubtotal - couponDiscount);

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText('alauddinkhan.aurangabad@gmail.com');
    setCopiedUpi(true);
    toast.success('UPI ID copied to clipboard!');
    setTimeout(() => setCopiedUpi(false), 3000);
  };

  // Apply Coupon
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          amount: effectiveSubtotal,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setCoupon({
          code: data.data.code,
          discountAmount: data.data.discountAmount,
        });
        toast.success(`Coupon "${data.data.code}" applied! Saved ₹${data.data.discountAmount}`);
        setCouponCode('');
      } else {
        toast.error(data.error || 'Invalid coupon code');
      }
    } catch {
      toast.error('Failed to validate coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCoupon(null);
    toast.info('Coupon removed');
  };

  // Checkout Process
  const handleCheckout = async () => {
    if (!session?.user) {
      toast.error('Please sign in to complete your enrollment');
      router.push(`/login?callbackUrl=${encodeURIComponent('/cart')}`);
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (paymentProvider === 'upi_qr' && !utrNumber.trim()) {
      toast.error('Please enter the 12-digit UTR / Transaction Reference Number');
      return;
    }

    setCheckoutLoading(true);
    try {
      // Create orders for cart items
      for (const item of items) {
        // 1. Create order API call
        const createRes = await fetch('/api/payments/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            internshipId: item.internshipId,
            couponCode: coupon?.code,
            provider: paymentProvider,
            utrNumber: paymentProvider === 'upi_qr' ? utrNumber.trim() : undefined,
            senderUpiId: paymentProvider === 'upi_qr' ? senderUpiId.trim() : undefined,
            paymentNotes: paymentProvider === 'upi_qr' ? paymentNotes.trim() : undefined,
          }),
        });

        const createData = await createRes.json();

        if (!createData.success) {
          toast.error(createData.error || `Failed to create order for ${item.title}`);
          setCheckoutLoading(false);
          return;
        }

        const { orderId, orderNumber, razorpayOrderId, amount, keyId } = createData.data;

        // 2. Handle UPI QR Flow
        if (paymentProvider === 'upi_qr') {
          setPendingOrderData({
            orderNumber,
            utrNumber: utrNumber.trim(),
            amount,
            title: item.title,
          });
          setShowPendingModal(true);
          clearCart();
          toast.success('UPI Order submitted! Verification pending.');
          setCheckoutLoading(false);
          return;
        }

        // 3. Handle Razorpay SDK
        if (paymentProvider === 'razorpay' && window.Razorpay && keyId && !keyId.includes('xxxxxxxxxxxx')) {
          const options = {
            key: keyId,
            amount: Math.round(amount * 100),
            currency: 'INR',
            name: 'NajTech',
            description: `Enrollment: ${item.title}`,
            order_id: razorpayOrderId,
            handler: async function (response: any) {
              const verifyRes = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  provider: 'razorpay',
                }),
              });
              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                toast.success(`Enrolled in ${item.title}!`);
                clearCart();
                router.push('/my-internships');
              } else {
                toast.error(verifyData.error || 'Payment verification failed');
              }
            },
            prefill: {
              name: session.user.name || '',
              email: session.user.email || '',
            },
            theme: { color: '#6366f1' },
          };
          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          // Test Mode / Instant Demo Verification
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              razorpayOrderId: razorpayOrderId || `DEMO_ORD_${Date.now()}`,
              razorpayPaymentId: `DEMO_PAY_${Date.now()}`,
              razorpaySignature: 'DEMO_SIGNATURE',
              provider: 'test',
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            toast.success(`Enrollment confirmed for ${item.title}!`);
            clearCart();
            router.push('/my-internships');
          } else {
            toast.error(verifyData.error || 'Payment verification failed');
          }
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Checkout error. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    `upi://pay?pa=alauddinkhan.aurangabad@gmail.com&pn=NajTech&am=${finalTotal}&cu=INR&tn=Internship%20Enrollment`
  )}`;

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-syne text-3xl sm:text-4xl font-bold text-foreground">
              Shopping <span className="gradient-text">Cart</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Review your items, apply promotional discounts, and complete your enrollment.
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={() => { clearCart(); toast.info('Cart cleared'); }}
              className="text-xs font-semibold text-muted-foreground hover:text-red-500 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty Cart State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-card border border-border rounded-3xl p-8 max-w-xl mx-auto shadow-sm"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h2 className="font-syne text-2xl font-bold text-foreground mb-2">Your Cart is Empty</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
              You haven't added any internship programs to your cart yet. Explore our curated virtual internships to start building your career!
            </p>
            <Link href="/internships">
              <Button size="lg" variant="gradient" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Browse Internships
              </Button>
            </Link>
          </motion.div>
        ) : (
          /* Cart Content & Summary */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Items Column */}
            <div className="lg:col-span-8 space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.internshipId}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-card border border-border rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-primary/30 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      {item.thumbnail ? (
                        <div className="w-20 h-20 rounded-xl relative overflow-hidden bg-muted flex-shrink-0">
                          <Image src={item.thumbnail} alt={item.title} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                          {item.title[0]}
                        </div>
                      )}
                      <div>
                        <h3 className="font-syne font-bold text-foreground text-base sm:text-lg line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Duration: <span className="font-medium text-foreground">{item.duration || 4} Weeks</span> • Verified Certificate Included
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            Virtual Internship
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-border">
                      <div className="text-right">
                        <div className="font-syne font-bold text-lg text-foreground">
                          {formatCurrency(item.discountPrice || item.price)}
                        </div>
                        {item.discountPrice && (
                          <div className="text-xs text-muted-foreground line-through">
                            {formatCurrency(item.price)}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.internshipId)}
                        className="p-2 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Benefits Banner */}
              <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent p-5 rounded-2xl border border-primary/20 space-y-3">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <ShieldCheck className="w-5 h-5" />
                  <span>NajTech Guarantee</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Instant Dashboard Access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span>Verified Industry Certificate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <span>7-Day Refund Policy</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Summary Column */}
            <div className="lg:col-span-4 space-y-6">
              {/* Coupon Card */}
              <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <h3 className="font-syne font-bold text-sm text-foreground flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  Apply Coupon Code
                </h3>

                {coupon ? (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-emerald-600 text-sm">{coupon.code}</span>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">Saved ₹{coupon.discountAmount}</p>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-xs font-semibold text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter code e.g. WELCOME10"
                      className="flex-1 h-10 px-3 rounded-xl border border-border bg-background text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <Button type="submit" size="sm" variant="gradient" loading={couponLoading}>
                      Apply
                    </Button>
                  </form>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-md">
                <h3 className="font-syne font-bold text-lg text-foreground border-b border-border pb-3">
                  Order Summary
                </h3>

                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Program Price</span>
                    <span className="font-medium text-foreground">{formatCurrency(rawSubtotal)}</span>
                  </div>

                  {regularSavings > 0 && (
                    <div className="flex items-center justify-between text-emerald-600 font-medium">
                      <span>Course Offer Savings</span>
                      <span>- {formatCurrency(regularSavings)}</span>
                    </div>
                  )}

                  {couponDiscount > 0 && (
                    <div className="flex items-center justify-between text-purple-600 font-medium">
                      <span>Coupon Discount ({coupon?.code})</span>
                      <span>- {formatCurrency(couponDiscount)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Taxes & GST</span>
                    <span className="text-xs text-emerald-500 font-semibold uppercase">Included</span>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between font-syne text-lg font-bold text-foreground">
                    <span>Total Amount</span>
                    <span className="text-xl gradient-text">{formatCurrency(finalTotal)}</span>
                  </div>
                </div>

                {/* Payment Option Selector */}
                <div className="pt-3 border-t border-border space-y-3">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Select Payment Method
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentProvider('razorpay')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                        paymentProvider === 'razorpay'
                          ? 'bg-primary/10 border-primary text-primary shadow-sm'
                          : 'bg-background border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Razorpay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentProvider('upi_qr')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                        paymentProvider === 'upi_qr'
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 shadow-sm'
                          : 'bg-background border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <QrCode className="w-4 h-4" />
                      <span>UPI QR Code</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentProvider('test')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                        paymentProvider === 'test'
                          ? 'bg-purple-500/10 border-purple-500 text-purple-600 shadow-sm'
                          : 'bg-background border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Demo Mode</span>
                    </button>
                  </div>
                </div>

                {/* UPI QR Payment Detail Form Box */}
                {paymentProvider === 'upi_qr' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-4 text-xs"
                  >
                    <div className="text-center space-y-2">
                      <div className="text-xs font-bold text-foreground">Scan QR Code to Pay {formatCurrency(finalTotal)}</div>
                      <div className="p-3 bg-white rounded-2xl w-fit mx-auto border border-emerald-500/30 shadow-md">
                        <img
                          src={upiQrUrl}
                          alt="NajTech UPI QR Code"
                          className="w-44 h-44 object-contain"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">Scan with Google Pay, PhonePe, Paytm or any BHIM UPI App</p>

                      {/* Copy UPI ID */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-background border border-border mt-2">
                        <span className="font-mono text-[11px] text-foreground truncate">alauddinkhan.aurangabad@gmail.com</span>
                        <button
                          type="button"
                          onClick={handleCopyUpiId}
                          className="px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg font-semibold hover:bg-emerald-500/20 transition-colors flex items-center gap-1"
                        >
                          {copiedUpi ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    {/* UTR Submission Inputs */}
                    <div className="space-y-3 pt-2 border-t border-border/60">
                      <div>
                        <label className="block text-[11px] font-bold text-foreground mb-1">
                          Transaction ID / UTR Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={utrNumber}
                          onChange={(e) => setUtrNumber(e.target.value)}
                          placeholder="e.g. 425129384756 (12-digit number)"
                          className="w-full h-9 px-3 rounded-xl border border-border bg-background text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                          Your Sender UPI ID / Mobile (Optional)
                        </label>
                        <input
                          type="text"
                          value={senderUpiId}
                          onChange={(e) => setSenderUpiId(e.target.value)}
                          placeholder="e.g. username@okaxis"
                          className="w-full h-9 px-3 rounded-xl border border-border bg-background text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                          Payment Notes (Optional)
                        </label>
                        <input
                          type="text"
                          value={paymentNotes}
                          onChange={(e) => setPaymentNotes(e.target.value)}
                          placeholder="Any additional notes"
                          className="w-full h-9 px-3 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                <Button
                  onClick={handleCheckout}
                  loading={checkoutLoading}
                  className="w-full mt-2"
                  size="lg"
                  variant="gradient"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {paymentProvider === 'upi_qr'
                    ? `Submit UPI Payment (${formatCurrency(finalTotal)})`
                    : `Complete Enrollment (${formatCurrency(finalTotal)})`}
                </Button>

                <p className="text-[11px] text-muted-foreground text-center flex items-center justify-center gap-1 mt-2">
                  <Lock className="w-3 h-3 text-emerald-500" />
                  <span>256-Bit SSL Encrypted & Secure Payment</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pending Order Verification Modal */}
      <AnimatePresence>
        {showPendingModal && pendingOrderData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
                <Clock className="w-7 h-7" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                  Verification Pending
                </span>
                <h3 className="font-syne text-2xl font-bold text-foreground mt-3">
                  UPI Order Received!
                </h3>
                <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                  Thank you! Your payment details for <strong className="text-foreground">{pendingOrderData.title}</strong> have been submitted.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/60 border border-border space-y-2 text-left text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order #:</span>
                  <span className="font-bold text-foreground">{pendingOrderData.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">UTR / Trans ID:</span>
                  <span className="font-bold text-emerald-600">{pendingOrderData.utrNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-bold text-foreground">{formatCurrency(pendingOrderData.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-bold text-amber-500 uppercase">Pending Review</span>
                </div>
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-left text-xs text-blue-600 dark:text-blue-400 flex items-start gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Our administration team will verify your UTR number against bank records. Your internship dashboard will be automatically unlocked upon verification!
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => router.push('/payments')}
                >
                  View Transactions
                </Button>
                <Button
                  className="flex-1"
                  variant="gradient"
                  onClick={() => router.push('/my-internships')}
                >
                  Go to Dashboard
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
