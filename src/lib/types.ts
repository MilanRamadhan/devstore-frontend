// 🔄 DUAL DELIVERY MODE: Support instant & custom
export type DeliveryType = "instant" | "custom";

export type AddOn = {
  id: string;
  product_id?: string;
  name: string;
  description?: string;
  price: number; // dalam rupiah
  position?: number;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  category?: "Web" | "App" | "Game";
  stack: string[];
  cover?: string;
  cover_url?: string; // URL foto produk dari upload
  basePrice?: number; // rupiah (deprecated)
  base_price: number; // rupiah (from DB)
  ratingAvg?: number;
  rating_avg?: number;
  ratingCount?: number;
  rating_count?: number;
  demoUrl?: string;
  demo_url?: string;
  description: string;
  addOns?: AddOn[];
  changelog?: { version: string; notes: string; releasedAt: string }[];
  seller_id?: string; // ID seller/pemilik produk
  published?: boolean;

  // 🔄 DUAL DELIVERY MODE fields
  delivery: DeliveryType;

  // INSTANT fields
  asset_path?: string; // Path to ZIP file in storage
  license?: string; // License text
  download_url?: string; // Deprecated - use asset_path

  // CUSTOM fields
  requires_brief?: boolean; // Need brief from buyer?
  custom_eta_days?: number; // Estimated days for custom work
};

export type CartLine = {
  product: Product;
  selectedAddOnIds: string[];
  quantity: number;
  brief?: string; // For custom products
};

export type CheckoutPreview = {
  subtotal: number;
  platformFee: number;
  tax: number;
  grandTotal: number;
};

// Order types
export type OrderStatus = "PENDING_PAYMENT" | "PAID" | "REQUIRES_BRIEF" | "IN_PROGRESS" | "DELIVERED" | "COMPLETED" | "CANCELLED" | "REFUNDED";

export type Milestone = {
  name: string;
  eta_days: number;
  status: "pending" | "in_progress" | "completed";
  note?: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  delivery: DeliveryType;
  quantity: number;
  unit_price: number;

  // INSTANT fields
  download_path?: string;
  download_expires_at?: string;
  download_count?: number;

  // CUSTOM fields
  brief?: string;
  milestones?: Milestone[];
  custom_status?: string;

  // Relations
  product?: Product;
  deliverables?: Deliverable[];
};

export type Deliverable = {
  id: string;
  order_item_id: string;
  file_path: string;
  file_name: string;
  file_size?: number;
  note?: string;
  milestone_index?: number;
  created_at: string;
};

export type Order = {
  id: string;
  buyer_id: string;
  status: OrderStatus;
  subtotal: number;
  platform_fee: number;
  tax: number;
  grand_total: number;
  gross_amount?: number;
  midtrans_order_id?: string;
  snap_token?: string;
  created_at: string;
  updated_at: string;

  // Relations
  order_items?: OrderItem[];
};
