// src/lib/services/products.ts
import { api } from "../api";
import { Product } from "../types";

export type ProductsResponse = {
  products: Product[];
  total: number;
};

export type ProductDetailResponse = {
  product: Product;
};

export type AddReviewRequest = {
  productId: string;
  rating: number;
  comment?: string;
};

export const productService = {
  async getProducts(params?: { q?: string; category?: string; stack?: string[] }) {
    let endpoint = "/products";

    if (params) {
      const searchParams = new URLSearchParams();
      if (params.q) searchParams.set("q", params.q);
      if (params.category) searchParams.set("category", params.category);
      if (params.stack && params.stack.length > 0) {
        searchParams.set("stack", params.stack.join(","));
      }

      const queryString = searchParams.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }
    }

    const response = await api.get<ProductsResponse>(endpoint);

    if (response.ok && response.data) {
      const rawProducts = response.data.products || response.data;

      // Normalize each product
      const products = (Array.isArray(rawProducts) ? rawProducts : []).map((p: any) => ({
        ...p,
        basePrice: p.base_price ?? p.basePrice ?? 0,
        baseSlaDays: p.base_sla_days ?? p.baseSlaDays ?? 7,
        addOns: (p.addons || p.product_addons || p.addOns || []).map((addon: any) => ({
          id: addon.id,
          name: addon.name,
          description: addon.description,
          price: addon.price ?? 0,
          extraSlaDays: addon.extra_sla_days ?? addon.extraSlaDays ?? 0,
        })),
      }));

      return { ok: true, products };
    }

    return { ok: false, message: response.message || "Gagal mengambil produk" };
  },

  async getProductBySlug(slug: string) {
    const response = await api.get<ProductDetailResponse>(`/products/${slug}`);

    if (response.ok && response.data) {
      const rawProduct = response.data.product || response.data;

      // Normalize backend fields to frontend format
      const product = {
        ...rawProduct,
        basePrice: (rawProduct as any).base_price ?? rawProduct.basePrice ?? 0,
        baseSlaDays: (rawProduct as any).base_sla_days ?? rawProduct.baseSlaDays ?? 7,
        addOns: ((rawProduct as any).addons || (rawProduct as any).product_addons || rawProduct.addOns || []).map((addon: any) => ({
          id: addon.id,
          name: addon.name,
          description: addon.description,
          price: addon.price ?? 0,
          extraSlaDays: addon.extra_sla_days ?? addon.extraSlaDays ?? 0,
        })),
      };

      return { ok: true, product };
    }

    return { ok: false, message: response.message || "Produk tidak ditemukan" };
  },

  async addReview(data: AddReviewRequest) {
    const response = await api.post("/products/reviews", data, true);

    if (response.ok) {
      return { ok: true };
    }

    return { ok: false, message: response.message || "Gagal menambahkan review" };
  },
};
