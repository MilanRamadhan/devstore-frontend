// src/lib/services/orders.ts
import { api } from "../api";
import { CartLine } from "../types";

export type CheckoutRequest = {
  items: {
    product_id: string;
    quantity: number;
    unit_price: number;
    total: number;
    addons?: {
      addon_id: string;
      price: number;
    }[];
  }[];
  totals: {
    subtotal: number;
    platformFee: number;
    tax: number;
    grandTotal: number;
  };
  etaDays?: number;
};

export type CheckoutResponse = {
  order_id: string;
};

export type Order = {
  id: string;
  status: string;
  total: number;
  platformFee: number;
  tax: number;
  grandTotal: number;
  notes?: string;
  createdAt: string;
  etaDays?: number;
  lines: {
    productId: string;
    productTitle: string;
    quantity: number;
    price: number;
    addOns: string[];
  }[];
  milestones?: {
    id: string;
    title: string;
    amount: number;
    status: string;
    createdAt: string;
  }[];
};

export type OrdersResponse = {
  orders: Order[];
};

export type OrderDetailResponse = {
  order: Order;
};

export type ApproveMilestoneRequest = {
  milestone_id: string;
};

// Helper function to normalize order data from backend
function normalizeOrder(rawOrder: any): Order {
  return {
    id: rawOrder.id,
    status: rawOrder.status,
    total: rawOrder.total ?? rawOrder.subtotal ?? 0,
    platformFee: rawOrder.platform_fee ?? rawOrder.platformFee ?? 0,
    tax: rawOrder.tax ?? 0,
    grandTotal: rawOrder.grand_total ?? rawOrder.grandTotal ?? 0,
    notes: rawOrder.notes,
    createdAt: rawOrder.created_at ?? rawOrder.createdAt,
    etaDays: rawOrder.eta_days ?? rawOrder.etaDays,
    lines: (rawOrder.order_items || []).map((item: any) => ({
      productId: item.product_id ?? item.productId,
      productTitle: item.product_title ?? item.productTitle,
      quantity: item.quantity ?? 1,
      price: item.unit_price ?? item.price ?? 0,
      addOns: (item.order_item_addons || []).map((addon: any) => addon.addon_id ?? addon.addonId),
    })),
    milestones: (rawOrder.order_milestones || []).map((milestone: any) => ({
      id: milestone.id,
      title: milestone.title,
      amount: milestone.amount ?? 0,
      status: milestone.status,
      createdAt: milestone.created_at ?? milestone.createdAt,
    })),
  };
}

export const orderService = {
  async checkout(data: CheckoutRequest) {
    const response = await api.post<CheckoutResponse>("/orders/checkout", data, true);

    if (response.ok && response.data) {
      return { ok: true, orderId: response.data.order_id };
    }

    return { ok: false, message: response.message || "Checkout gagal" };
  },
  async getMyOrders() {
    const response = await api.get<any>("/orders/mine", true);

    if (response.ok && response.data) {
      const rawOrders = Array.isArray(response.data) ? response.data : response.data.orders || [];
      const normalizedOrders = rawOrders.map(normalizeOrder);
      console.log("📦 Normalized orders:", normalizedOrders);
      return { ok: true, orders: normalizedOrders };
    }

    return { ok: false, message: response.message || "Gagal mengambil orders" };
  },

  async getOrderDetail(orderId: string) {
    const response = await api.get<any>(`/orders/${orderId}`, true);

    if (response.ok && response.data) {
      const rawOrder = response.data.order || response.data;
      const normalizedOrder = normalizeOrder(rawOrder);
      console.log("📦 Normalized order detail:", normalizedOrder);
      return { ok: true, order: normalizedOrder };
    }

    return { ok: false, message: response.message || "Order tidak ditemukan" };
  },

  async approveMilestone(data: ApproveMilestoneRequest) {
    const response = await api.post("/orders/milestones/approve", data, true);

    if (response.ok) {
      return { ok: true };
    }

    return { ok: false, message: response.message || "Gagal approve milestone" };
  },
};
