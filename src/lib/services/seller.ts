// src/lib/services/seller.ts
import { api } from "../api";
import { Product } from "../types";

export type CreateProductRequest = {
  title: string;
  description?: string;
  base_price: number;
  stack?: string[];
  features?: string[];
  published?: boolean;
};

export type UpdateProductRequest = {
  title?: string;
  description?: string;
  base_price?: number;
  stack?: string[];
  features?: string[];
  published?: boolean;
};

export type CreateAddonRequest = {
  name: string;
  price: number;
  description?: string;
  eta_days?: number;
  sla_days?: number;
};

export type UpdateAddonRequest = {
  name?: string;
  price?: number;
  description?: string;
  eta_days?: number;
  sla_days?: number;
  position?: number;
};

export type Addon = {
  id: string;
  product_id: string;
  name: string;
  price: number;
  description?: string;
  eta_days: number;
  sla_days?: number;
  position: number;
  created_at: string;
};

export const sellerService = {
  // ===== PRODUCTS =====
  async getMyProducts() {
    const response = await api.get<Product[]>("/products/mine/list", true);

    if (response.ok && response.data) {
      return { ok: true, products: response.data };
    }

    return { ok: false, message: response.message || "Gagal mengambil produk" };
  },

  async createProduct(data: CreateProductRequest) {
    const response = await api.post<Product>("/products/mine/create", data, true);

    if (response.ok && response.data) {
      return { ok: true, product: response.data };
    }

    return { ok: false, message: response.message || "Gagal membuat produk" };
  },

  async updateProduct(productId: string, data: UpdateProductRequest) {
    const response = await api.patch<Product>(`/products/mine/${productId}`, data, true);

    if (response.ok && response.data) {
      return { ok: true, product: response.data };
    }

    return { ok: false, message: response.message || "Gagal update produk" };
  },

  async publishProduct(productId: string, published: boolean) {
    const response = await api.post<Product>(`/products/${productId}/publish`, { published }, true);

    if (response.ok && response.data) {
      return { ok: true, product: response.data };
    }

    return { ok: false, message: response.message || "Gagal publish produk" };
  },

  async getProductById(productId: string) {
    const response = await api.get<Product>(`/products/${productId}`, true);

    if (response.ok && response.data) {
      return { ok: true, product: response.data };
    }

    return { ok: false, message: response.message || "Produk tidak ditemukan" };
  },

  // ===== ADDONS =====
  async getMyAddons(productId: string) {
    const response = await api.get<Addon[]>(`/products/mine/${productId}/addons`, true);

    if (response.ok && response.data) {
      return { ok: true, addons: response.data };
    }

    return { ok: false, message: response.message || "Gagal mengambil addons" };
  },

  async createAddon(productId: string, data: CreateAddonRequest) {
    const response = await api.post<Addon>(`/products/mine/${productId}/addons`, data, true);

    if (response.ok && response.data) {
      return { ok: true, addon: response.data };
    }

    return { ok: false, message: response.message || "Gagal membuat addon" };
  },

  async updateAddon(productId: string, addonId: string, data: UpdateAddonRequest) {
    const response = await api.patch<Addon>(`/products/mine/${productId}/addons/${addonId}`, data, true);

    if (response.ok && response.data) {
      return { ok: true, addon: response.data };
    }

    return { ok: false, message: response.message || "Gagal update addon" };
  },

  async deleteAddon(productId: string, addonId: string) {
    const response = await api.delete<{ deleted: string }>(`/products/mine/${productId}/addons/${addonId}`, true);

    if (response.ok) {
      return { ok: true };
    }

    return { ok: false, message: response.message || "Gagal delete addon" };
  },
};
