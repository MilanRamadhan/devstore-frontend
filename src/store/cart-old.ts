"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartLine, Product } from "@/lib/types";
import { calcLineSubtotal } from "@/lib/pricing";

type CartState = {
  lines: CartLine[];
  add: (product: Product, selectedAddOnIds: string[], qty?: number, brief?: string) => void;
  remove: (productId: string) => void;
  setAddOns: (productId: string, addOnIds: string[]) => void;
  setQty: (productId: string, qty: number) => void;
  setBrief: (productId: string, brief: string) => void;
  clear: () => void;
  totals: () => { subtotal: number; items: number };
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (product, selectedAddOnIds, qty = 1, brief = "") =>
        set((state) => {
          const exist = state.lines.find((l) => l.product.id === product.id);
          if (exist) {
            exist.selectedAddOnIds = selectedAddOnIds;
            exist.quantity += qty;
            if (brief) exist.brief = brief;
            return { lines: [...state.lines] };
          }
          return { lines: [...state.lines, { product, selectedAddOnIds, quantity: qty, brief }] };
        }),
      remove: (productId) => set((state) => ({ lines: state.lines.filter((l) => l.product.id !== productId) })),
      setAddOns: (productId, addOnIds) =>
        set((state) => {
          const line = state.lines.find((l) => l.product.id === productId);
          if (line) line.selectedAddOnIds = addOnIds;
          return { lines: [...state.lines] };
        }),
      setQty: (productId, qty) =>
        set((state) => {
          const line = state.lines.find((l) => l.product.id === productId);
          if (line) line.quantity = Math.max(1, qty);
          return { lines: [...state.lines] };
        }),
      setBrief: (productId, brief) =>
        set((state) => {
          const line = state.lines.find((l) => l.product.id === productId);
          if (line) line.brief = brief;
          return { lines: [...state.lines] };
        }),
      clear: () => set({ lines: [] }),
      totals: () => {
        const { lines } = get();
        const subtotal = lines.reduce((sum, l) => {
          const price = l.product.base_price || l.product.basePrice || 0;
          const addonsPrice = l.selectedAddOnIds.reduce((s, id) => {
            const addon = l.product.addOns?.find((a) => a.id === id);
            return s + (addon?.price || 0);
          }, 0);
          return sum + (price + addonsPrice) * l.quantity;
        }, 0);
        const items = lines.reduce((s, l) => s + l.quantity, 0);
        return { subtotal, items };
      },
    }),
    {
      name: "devstore-cart-storage",
    }
  )
);
