// src/lib/services/auth.ts
import { api } from "../api";
import { User } from "@/store/auth";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: {
    id: string;
    email: string;
    display_name?: string;
    role?: string;
    user_metadata?: {
      display_name?: string;
    };
  };
  access_token: string;
  refresh_token: string;
  expires_at: number;
};

export type RegisterRequest = {
  email: string;
  password: string;
  displayName?: string;
  name?: string;
};

export type RegisterResponse = {
  user: {
    id: string;
    email: string;
    user_metadata?: {
      display_name?: string;
    };
  };
};

export type MeResponse = {
  user: {
    id: string;
    email: string;
    user_metadata?: {
      display_name?: string;
    };
  };
  profile?: {
    id: string;
    email: string;
    display_name: string;
  };
};

export const authService = {
  async login(credentials: LoginRequest) {
    console.log("🔐 Auth Service: Login attempt", { email: credentials.email });
    const response = await api.post<LoginResponse>("/auth/login", credentials);
    console.log("🔐 Auth Service: Login response", response);

    if (response.ok && response.data) {
      // Save token
      const token = response.data.access_token;
      if (token) {
        api.setToken(token);
        console.log("✅ Token saved to localStorage:", token.substring(0, 20) + "...");
      } else {
        console.warn("⚠️ No access_token in login response!");
      }

      // Transform to User format with role
      const user: User = {
        id: response.data.user.id,
        email: response.data.user.email,
        name: response.data.user.display_name || response.data.user.user_metadata?.display_name || response.data.user.email.split("@")[0],
        role: response.data.user.role,
      };

      return { ok: true, user, token: response.data.access_token };
    }

    return { ok: false, message: response.message || "Login gagal" };
  },

  async register(data: RegisterRequest) {
    const response = await api.post<RegisterResponse>("/auth/register", data);

    if (response.ok && response.data) {
      const user: User = {
        id: response.data.user.id,
        email: response.data.user.email,
        name: response.data.user.user_metadata?.display_name || data.displayName || data.name || response.data.user.email.split("@")[0],
      };

      return { ok: true, user };
    }

    return { ok: false, message: response.message || "Registrasi gagal" };
  },

  async getMe() {
    const response = await api.get<MeResponse>("/auth/me", true);

    if (response.ok && response.data) {
      const user: User = {
        id: response.data.user.id,
        email: response.data.user.email,
        name: response.data.profile?.display_name || response.data.user.user_metadata?.display_name || response.data.user.email.split("@")[0],
      };

      return { ok: true, user };
    }

    return { ok: false, message: response.message || "Gagal mengambil data user" };
  },

  async me() {
    const response = await api.get<any>("/profile/me", true);

    if (response.ok && response.data) {
      return {
        ok: true,
        data: {
          id: response.data.id,
          email: response.data.email,
          display_name: response.data.display_name,
          role: response.data.role || "buyer",
          store_name: response.data.store_name,
          bio: response.data.bio,
        },
      };
    }

    return { ok: false, message: response.message || "Gagal mengambil profil" };
  },

  logout() {
    api.clearToken();
  },
};
