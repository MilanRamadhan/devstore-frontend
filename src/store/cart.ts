"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartLine, Product } from "@/lib/types";
import { calcLineSubtotal } from "@/lib/pricing";

type CartState = {
  lines: CartLine[];
  userId: string | null;
  add: (product: Product, selectedAddOnIds: string[], qty?: number, brief?: string) => void;
  remove: (productId: string) => void;
  setAddOns: (productId: string, addOnIds: string[]) => void;
  setQty: (productId: string, qty: number) => void;
  setBrief: (productId: string, brief: string) => void;
  clear: () => void;
  syncUser: (userId: string | null) => void;
  totals: () => { subtotal: number; items: number };
};

// ✅ Get current user ID from auth storage
function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const authStorage = localStorage.getItem("devstore_user");
    if (authStorage) {
      const user = JSON.parse(authStorage);
      return user?.id || null;
    }
  } catch (e) {
    console.warn("Failed to get user ID from auth storage");
  }

  return null;
}

// ✅ Custom storage that uses user-specific keys
// IMPORTANT: Must return STRING (not parsed object) for Zustand persist to work correctly
const createUserStorage = () => {
  return {
    getItem: (name: string) => {
      const userId = getCurrentUserId();
      const key = userId ? `devstore-cart-${userId}` : "devstore-cart-anonymous";

      console.log(`🛒 Storage GET from key: ${key}`);
      const value = localStorage.getItem(key);

      if (value) {
        console.log(`🛒 Storage GET success - returning raw string`);
        return value; // ✅ Return STRING, not parsed object
      }

      console.log(`🛒 Storage GET: No data found for key ${key}`);
      return null;
    },
    setItem: (name: string, value: string) => {
      const userId = getCurrentUserId();
      const key = userId ? `devstore-cart-${userId}` : "devstore-cart-anonymous";

      console.log(`🛒 Storage SET to key: ${key}`);
      localStorage.setItem(key, value); // ✅ Store as string directly
    },
    removeItem: (name: string) => {
      const userId = getCurrentUserId();
      const key = userId ? `devstore-cart-${userId}` : "devstore-cart-anonymous";

      console.log(`🛒 Storage REMOVE key: ${key}`);
      localStorage.removeItem(key);
    },
  };
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      userId: getCurrentUserId(), // ✅ Initialize with current user

      // ✅ Sync user and clear/reload cart if user changed
      syncUser: (newUserId) => {
        const currentUserId = get().userId;

        console.log(`🛒 Cart syncUser called: "${currentUserId}" → "${newUserId}"`);

        // ⚠️ CRITICAL: Prevent cart leak between users
        if (currentUserId !== newUserId) {
          console.log(`🛒 Cart: User changed from "${currentUserId}" to "${newUserId}"`);

          // Step 1: CLEAR current cart immediately (prevent auto-save to wrong key)
          set({ lines: [], userId: newUserId });

          // Step 2: Force storage write untuk ensure clear disimpan ke key yang benar
          if (typeof window !== "undefined") {
            const oldKey = currentUserId ? `devstore-cart-${currentUserId}` : "devstore-cart-anonymous";
            const newKey = newUserId ? `devstore-cart-${newUserId}` : "devstore-cart-anonymous";

            // Save empty cart to new key first (prevent auto-load from wrong key)
            localStorage.setItem(newKey, JSON.stringify({ state: { lines: [], userId: newUserId }, version: 0 }));
            console.log(`🛒 Cart: Cleared storage for new user key "${newKey}"`);

            // Step 3: Now load cart for new user (if exists)
            const stored = localStorage.getItem(newKey);

            if (stored) {
              try {
                const parsed = JSON.parse(stored);
                console.log(`🛒 Cart: Parsed storage for user "${newUserId}":`, parsed);

                // Zustand persist stores in { state: {...}, version: 0 } format
                if (parsed?.state?.lines && Array.isArray(parsed.state.lines)) {
                  if (parsed.state.lines.length > 0) {
                    console.log(`🛒 Cart: Restored ${parsed.state.lines.length} items for user "${newUserId}"`);
                    set({ lines: parsed.state.lines, userId: newUserId });
                  } else {
                    console.log(`🛒 Cart: User "${newUserId}" has empty cart`);
                  }
                } else if (Array.isArray(parsed.lines) && parsed.lines.length > 0) {
                  // Fallback: if stored as { lines: [...] }
                  console.log(`🛒 Cart: Restored ${parsed.lines.length} items (fallback format)`);
                  set({ lines: parsed.lines, userId: newUserId });
                } else {
                  console.log(`🛒 Cart: No valid lines for user "${newUserId}", starting empty`);
                }
              } catch (e) {
                console.error(`🛒 Cart: Parse error for user "${newUserId}":`, e);
                set({ lines: [], userId: newUserId });
              }
            } else {
              console.log(`🛒 Cart: No stored cart for user "${newUserId}", starting fresh`);
            }
          }
        } else {
          console.log(`🛒 Cart: Same user "${currentUserId}", no reload needed`);
        }
      },

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
      name: "cart", // Base name, actual key will be user-specific
      storage: createJSONStorage(() => createUserStorage()),
    }
  )
);
