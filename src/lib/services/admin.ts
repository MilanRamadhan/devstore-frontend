// src/lib/services/admin.ts
import { api } from "../api";

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  pendingApplications: number;
  roleCounts: {
    buyer: number;
    seller: number;
    admin: number;
  };
}

export interface SellerApplication {
  id: string;
  user_id: string;
  store_name: string;
  bio: string;
  payout_bank: string;
  payout_account: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  profiles: {
    email: string;
    display_name: string;
  };
}

export interface User {
  id: string;
  email: string;
  display_name: string;
  role: "buyer" | "seller" | "admin";
  store_name?: string;
  bio?: string;
  payout_bank?: string;
  payout_account?: string;
  created_at: string;
}

export interface Store {
  id: string;
  email: string;
  display_name: string;
  store_name: string;
  bio?: string;
  payout_bank?: string;
  payout_account?: string;
  created_at: string;
  products_count: number;
}

export const adminService = {
  async getDashboardStats() {
    return api.get<{ stats: DashboardStats }>("/admin/stats", true);
  },

  async getSellerApplications(status?: "pending" | "approved" | "rejected") {
    const params = status ? `?status=${status}` : "";
    return api.get<SellerApplication[]>(`/admin/seller-applications${params}`, true);
  },

  async approveApplication(applicationId: string) {
    return api.patch(`/admin/seller-applications/${applicationId}`, { action: "approve" }, true);
  },

  async rejectApplication(applicationId: string) {
    return api.patch(`/admin/seller-applications/${applicationId}`, { action: "reject" }, true);
  },

  async getAllUsers(role?: "buyer" | "seller" | "admin") {
    const params = role ? `?role=${role}` : "";
    return api.get<User[]>(`/admin/users${params}`, true);
  },

  async getAllStores() {
    return api.get<Store[]>("/admin/stores", true);
  },
};
