// src/lib/services/profile.ts
import { api } from "../api";

export type Profile = {
  id: string;
  email?: string;
  display_name: string;
  bio?: string;
  website?: string;
  created_at?: string;
  updated_at?: string;
};

export type UpdateProfileRequest = {
  display_name?: string;
  bio?: string;
  website?: string;
};

export type BecomeSellerRequest = {
  store_name: string;
  payout_bank: string;
  payout_account: string;
  bio?: string;
};

export type SellerApplication = {
  id: string;
  user_id: string;
  store_name: string;
  payout_bank: string;
  payout_account: string;
  bio?: string;
  status: "pending" | "approved" | "rejected";
  reviewed_at?: string;
  reviewed_by?: string;
  created_at: string;
  updated_at: string;
};

export const profileService = {
  async getMyProfile() {
    const response = await api.get<{ profile: Profile }>("/profile/me", true);

    if (response.ok && response.data) {
      return { ok: true, profile: response.data.profile || response.data };
    }

    return { ok: false, message: response.message || "Gagal mengambil profile" };
  },

  async updateMyProfile(data: UpdateProfileRequest) {
    const response = await api.patch<{ profile: Profile }>("/profile/me", data, true);

    if (response.ok && response.data) {
      return { ok: true, profile: response.data.profile || response.data };
    }

    return { ok: false, message: response.message || "Gagal update profile" };
  },

  async becomeSeller(data: BecomeSellerRequest) {
    const response = await api.post<{ profile: Profile }>("/profile/become-seller", data, true);

    if (response.ok && response.data) {
      return { ok: true, profile: response.data.profile || response.data };
    }

    return { ok: false, message: response.message || "Gagal upgrade ke seller" };
  },

  async applySeller(data: BecomeSellerRequest) {
    const response = await api.post<{ message: string; application: SellerApplication }>("/profile/apply-seller", data, true);

    if (response.ok && response.data) {
      return { ok: true, message: response.data.message, application: response.data.application };
    }

    return { ok: false, message: response.message || "Gagal submit aplikasi seller" };
  },

  async getMyApplication() {
    const response = await api.get<SellerApplication>("/profile/my-application", true);

    if (response.ok && response.data) {
      return { ok: true, application: response.data };
    }

    return { ok: false, message: response.message || "Belum ada aplikasi" };
  },
};
