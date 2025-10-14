"use client";

import { create } from "zustand";
import { CartLine, Product } from "@/lib/types";
import { calcLineSubtotal } from "@/lib/pricing";

type CartState = {
  lines: CartLine[];
  add: (product: Product, selectedAddOnIds: string[], qty?: number) => void;
  remove: (productId: string) => void;
  setAddOns: (productId: string, addOnIds: string[]) => void;
  setQty: (productId: string, qty: number) => void;
  totals: () => { subtotal: number; items: number };
};

export const useCart = create<CartState>((set, get) => ({
  lines: [],
  add: (product, selectedAddOnIds, qty = 1) =>
    set((state) => {
      const exist = state.lines.find((l) => l.product.id === product.id);
      if (exist) {
        exist.selectedAddOnIds = selectedAddOnIds;
        exist.quantity += qty;
        return { lines: [...state.lines] };
      }
      return { lines: [...state.lines, { product, selectedAddOnIds, quantity: qty }] };
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
  totals: () => {
    const { lines } = get();
    const subtotal = lines.reduce((sum, l) => {
      const { total } = calcLineSubtotal(l.product, l.selectedAddOnIds);
      return sum + total * l.quantity;
    }, 0);
    const items = lines.reduce((s, l) => s + l.quantity, 0);
    return { subtotal, items };
  },
}));
