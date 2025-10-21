export type AddOn = {
  id: string;
  name: string;
  description?: string;
  price: number; // dalam rupiah
  extraSlaDays?: number;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  category: "Web" | "App" | "Game";
  stack: string[];
  cover: string;
  cover_url?: string; // URL foto produk dari upload
  basePrice: number; // rupiah
  baseSlaDays?: number;
  ratingAvg?: number;
  ratingCount?: number;
  demoUrl?: string;
  description: string;
  addOns: AddOn[];
  changelog?: { version: string; notes: string; releasedAt: string }[];
};

export type CartLine = {
  product: Product;
  selectedAddOnIds: string[];
  quantity: number;
};

export type CheckoutPreview = {
  subtotal: number;
  platformFee: number;
  tax: number;
  grandTotal: number;
  etaDays: number; // estimasi SLA total
};
