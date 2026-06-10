'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  internshipId: string;
  title: string;
  price: number;
  discountPrice?: number;
  thumbnail?: string;
  mentorName?: string;
  duration?: number;
}

interface CartStore {
  items: CartItem[];
  coupon: { code: string; discount: number; type: 'percentage' | 'fixed' } | null;
  addItem: (item: CartItem) => void;
  removeItem: (internshipId: string) => void;
  clearCart: () => void;
  setCoupon: (coupon: CartStore['coupon']) => void;
  removeCoupon: () => void;
  getTotal: () => number;
  getFinalTotal: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,

      addItem: (item) =>
        set((state) => {
          if (state.items.find((i) => i.internshipId === item.internshipId)) return state;
          return { items: [...state.items, item] };
        }),

      removeItem: (internshipId) =>
        set((state) => ({
          items: state.items.filter((i) => i.internshipId !== internshipId),
        })),

      clearCart: () => set({ items: [], coupon: null }),

      setCoupon: (coupon) => set({ coupon }),

      removeCoupon: () => set({ coupon: null }),

      getTotal: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + (item.discountPrice || item.price), 0);
      },

      getFinalTotal: () => {
        const { items, coupon } = get();
        const total = items.reduce((sum, item) => sum + (item.discountPrice || item.price), 0);
        if (!coupon) return total;
        if (coupon.type === 'percentage') {
          return Math.max(0, total - (total * coupon.discount) / 100);
        }
        return Math.max(0, total - coupon.discount);
      },

      itemCount: () => get().items.length,
    }),
    { name: 'internvault-cart' }
  )
);

// ─── UI Store ────────────────────────────────────────────────────────────────
interface UIStore {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  setTheme: (theme: UIStore['theme']) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      theme: 'system',
      sidebarOpen: true,

      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    { name: 'internvault-ui' }
  )
);
