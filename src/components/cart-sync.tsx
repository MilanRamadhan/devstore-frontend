"use client";

import { useEffect } from "react";
import { useAuth } from "@/store/auth";
import { useCart } from "@/store/cart";

/**
 * Cart Sync Component
 *
 * Ensures cart is synced with current user on every user change
 * CRITICAL: Prevents cart data leak between users
 */
export function CartSync() {
  const { user } = useAuth();
  const { syncUser } = useCart();

  useEffect(() => {
    const userId = user?.id || null;
    console.log(`🔄 CartSync: Detected user change - syncing cart for userId="${userId}"`);

    // Sync cart whenever user changes
    syncUser(userId);
  }, [user?.id, syncUser]);

  return null; // This is a logic-only component
}
