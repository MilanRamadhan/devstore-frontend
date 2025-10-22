// src/lib/services/orders.ts - DUAL DELIVERY MODE
import { api } from "../api";
import { Order, OrderItem, DeliveryType } from "../types";

export type CheckoutRequest = {
  items: {
    product_id: string;
    quantity: number;
    brief?: string; // For custom products
  }[];
};

export type CheckoutResponse = {
  order_id: string;
  status: string;
  gross_amount: number;
  snap_token?: string;
  items: OrderItem[];
};

// Helper function to normalize order data from backend
function normalizeOrder(rawOrder: any): Order {
  return {
    id: rawOrder.id,
    buyer_id: rawOrder.buyer_id,
    status: rawOrder.status,
    subtotal: rawOrder.subtotal ?? 0,
    platform_fee: rawOrder.platform_fee ?? 0,
    tax: rawOrder.tax ?? 0,
    grand_total: rawOrder.grand_total ?? 0,
    gross_amount: rawOrder.gross_amount ?? rawOrder.grand_total ?? 0,
    midtrans_order_id: rawOrder.midtrans_order_id,
    snap_token: rawOrder.snap_token,
    created_at: rawOrder.created_at ?? new Date().toISOString(),
    updated_at: rawOrder.updated_at ?? new Date().toISOString(),
    order_items: (rawOrder.order_items || []).map((item: any) => ({
      id: item.id,
      order_id: item.order_id,
      product_id: item.product_id,
      delivery: item.delivery as DeliveryType,
      quantity: item.quantity ?? 1,
      unit_price: item.unit_price ?? 0,
      download_path: item.download_path,
      download_expires_at: item.download_expires_at,
      download_count: item.download_count ?? 0,
      brief: item.brief,
      milestones: item.milestones,
      custom_status: item.custom_status,
      product: item.products
        ? {
            id: item.products.id,
            slug: item.products.slug,
            title: item.products.title,
            base_price: item.products.base_price,
            delivery: item.products.delivery,
            asset_path: item.products.asset_path,
            requires_brief: item.products.requires_brief,
            stack: item.products.stack || [],
            description: item.products.description || "",
          }
        : undefined,
      deliverables: item.deliverables || [],
    })),
  };
}

export const orderService = {
  async checkout(items: { product_id: string; quantity: number; brief?: string }[]) {
    const response = await api.post<CheckoutResponse>("/orders/checkout", { items }, true);

    if (response.ok && response.data) {
      return {
        ok: true,
        orderId: response.data.order_id,
        status: response.data.status,
        snapToken: response.data.snap_token,
      };
    }

    return { ok: false, message: response.message || "Checkout gagal" };
  },

  async simulatePayment(orderId: string) {
    const response = await api.post(`/orders/${orderId}/simulate-payment`, {}, true);

    if (response.ok) {
      return { ok: true, message: "Payment simulated successfully" };
    }

    return { ok: false, message: response.message || "Failed to simulate payment" };
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

  downloadInstant(orderId: string, itemId: string): string {
    // This will redirect to signed URL
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

    return `${baseUrl}/api/orders/${orderId}/items/${itemId}/download?token=${token}`;
  },

  async updateBrief(itemId: string, brief: string) {
    const response = await api.patch(`/orders/items/${itemId}/brief`, { brief }, true);

    if (response.ok) {
      return { ok: true };
    }

    return { ok: false, message: response.message || "Gagal update brief" };
  },

  async getDeliverable(orderId: string, itemId: string) {
    const response = await api.get<any>(`/orders/${orderId}/items/${itemId}/deliverable`, true);

    if (response.ok && response.data) {
      return { ok: true, deliverable: response.data.deliverable };
    }

    return { ok: false, message: response.message || "Deliverable tidak ditemukan" };
  },

  async downloadDeliverable(orderId: string, itemId: string) {
    const response = await api.get<any>(`/orders/${orderId}/items/${itemId}/deliverable`, true);

    if (response.ok && response.data) {
      return { ok: true, deliverable: response.data.deliverable };
    }

    return { ok: false, message: response.message || "Gagal mendapatkan download link" };
  },
};
