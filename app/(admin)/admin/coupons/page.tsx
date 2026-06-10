'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Loader2, Tag, Edit, Trash2, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toaster';
import { couponSchema } from '@/lib/validations';
import { formatDate } from '@/lib/utils';
import type { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';

type CouponForm = z.infer<typeof couponSchema>;

interface Coupon {
  _id: string;
  code: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  usageCount: number;
  usageLimit?: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  minOrderAmount?: number;
  maxDiscount?: number;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CouponForm>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      type: 'percentage',
      isActive: true,
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  });

  const fetchCoupons = () => {
    setLoading(true);
    fetch('/api/coupons')
      .then((r) => r.json())
      .then((d) => setCoupons(d.data || []))
      .catch(() => toast.error('Failed to load coupons'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCoupons(); }, []);

  const onSubmit = async (data: CouponForm) => {
    setSaving(true);
    try {
      const url = editId ? `/api/coupons/${editId}` : '/api/coupons';
      const method = editId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (result.success) {
        toast.success(editId ? 'Coupon updated' : 'Coupon created');
        setShowForm(false);
        setEditId(null);
        reset();
        fetchCoupons();
      } else {
        toast.error(result.error || 'Failed to save coupon');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    const res = await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      toast.success('Coupon deleted');
      fetchCoupons();
    } else {
      toast.error('Failed to delete');
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    const res = await fetch(`/api/coupons/${coupon._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !coupon.isActive }),
    });
    const data = await res.json();
    if (data.success) {
      fetchCoupons();
    } else {
      toast.error('Failed to update');
    }
  };

  const isCouponExpired = (validUntil: string) => new Date(validUntil) < new Date();

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-syne text-2xl font-bold text-foreground">Coupons</h1>
          <p className="text-muted-foreground text-sm">{coupons.length} coupon codes</p>
        </div>
        <Button variant="gradient" leftIcon={<Plus className="w-4 h-4" />} onClick={() => { setShowForm(true); setEditId(null); reset(); }}>
          Create Coupon
        </Button>
      </div>

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-syne font-bold text-foreground">{editId ? 'Edit Coupon' : 'Create Coupon'}</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-accent">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Coupon Code *</label>
                    <input {...register('code')} placeholder="SAVE20" className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Type *</label>
                    <select {...register('type')} className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Value *</label>
                    <input type="number" {...register('value', { valueAsNumber: true })} placeholder="20" className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    {errors.value && <p className="text-red-500 text-xs mt-1">{errors.value.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Max Discount (₹)</label>
                    <input type="number" {...register('maxDiscount', { valueAsNumber: true })} placeholder="500" className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Min Order (₹)</label>
                    <input type="number" {...register('minOrderAmount', { valueAsNumber: true })} placeholder="999" className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Usage Limit</label>
                    <input type="number" {...register('usageLimit', { valueAsNumber: true })} placeholder="100" className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Valid From *</label>
                    <input type="datetime-local" {...register('validFrom')} className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Valid Until *</label>
                    <input type="datetime-local" {...register('validUntil')} className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                  <input {...register('description')} placeholder="Save 20% on all programs" className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('isActive')} className="w-4 h-4 rounded border-border" />
                  <span className="text-sm text-foreground">Active</span>
                </label>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button type="submit" variant="gradient" className="flex-1" loading={saving} leftIcon={<Save className="w-4 h-4" />}>
                    {editId ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Coupons grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Tag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No coupons created yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => {
            const expired = isCouponExpired(coupon.validUntil);
            return (
              <div key={coupon._id} className={`bg-card border rounded-2xl p-5 transition-all ${expired ? 'border-border opacity-60' : 'border-border hover:border-primary/40 hover:shadow-lg'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-mono font-bold text-lg text-foreground">{coupon.code}</div>
                    {coupon.description && <div className="text-xs text-muted-foreground mt-0.5">{coupon.description}</div>}
                  </div>
                  <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    expired ? 'bg-gray-100 text-gray-500 dark:bg-gray-800' :
                    coupon.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
                    'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                  }`}>
                    {expired ? 'Expired' : coupon.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>

                <div className="text-2xl font-syne font-bold gradient-text mb-3">
                  {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                </div>

                <div className="space-y-1 text-xs text-muted-foreground mb-4">
                  <div>Used: {coupon.usageCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''} times</div>
                  <div>Valid: {formatDate(coupon.validFrom, { month: 'short', day: 'numeric' })} – {formatDate(coupon.validUntil, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  {coupon.minOrderAmount && <div>Min order: ₹{coupon.minOrderAmount}</div>}
                  {coupon.maxDiscount && <div>Max discount: ₹{coupon.maxDiscount}</div>}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => toggleActive(coupon)} className={`flex-1 text-xs py-1.5 rounded-lg border font-medium transition-colors ${coupon.isActive ? 'border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20' : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'}`}>
                    {coupon.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => deleteCoupon(coupon._id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
