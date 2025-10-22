// src/store/auth.ts
"use client";

import { create } from "zustand";
import { authService } from "@/lib/services/auth";

export type User = {
  id: string;
  name: string;
  email: string;
  role?: string; // seller | buyer | admin (opsional, diisi dari /api/profile/me)
  store_name?: string | null;
};

type AuthResult = { ok: true; user: User } | { ok: false; message?: string };

type AuthState = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (email: string, password: string, name?: string) => Promise<AuthResult>;
  logout: () => void;
  hydrate: () => Promise<void>;
  setUser: (u: User) => void;
};

const LS_KEY = "devstore_user";

/** Simpel helper buat update localStorage tiap set user */
function persistUser(u: User | null) {
  if (typeof window === "undefined") return;
  if (!u) {
    localStorage.removeItem(LS_KEY);
  } else {
    localStorage.setItem(LS_KEY, JSON.stringify(u));
  }
}

/** ✅ Sync cart dengan user saat ini */
function syncCartWithUser(userId: string | null) {
  if (typeof window === "undefined") return;

  try {
    // Dynamically import to avoid circular dependency
    import("@/store/cart").then((mod) => {
      mod.useCart.getState().syncUser(userId);
    });
  } catch (e) {
    console.warn("Failed to sync cart with user:", e);
  }
}

/**
 * Ambil profil lengkap dari backend dan merge ke state.user
 * Mengandalkan authService.me() (harusnya sudah include token).
 * Aman: kalau gagal, tidak melempar error dan tidak merusak state.
 */
async function mergeProfileIntoState(set: (p: Partial<AuthState>) => void, get: () => AuthState) {
  try {
    // Check if authService.me exists
    if (typeof authService.me !== "function") {
      console.warn("authService.me() not available");
      return;
    }

    const resp = await authService.me();
    console.log("🔐 Auth Service: mergeProfile response", resp);

    // Ekspektasi shape: { ok: true, data: { id, email, display_name, role, store_name, ... } }
    if (resp && resp.ok && resp.data) {
      const profileData = resp.data as any; // Backend bisa return berbagai format
      console.log("📦 Raw profile data:", profileData);

      // Handle berbagai format response:
      // 1. Direct: { id, email, display_name, ... }
      // 2. Wrapped profile: { profile: { id, email, ... } }
      // 3. Wrapped user: { user: { id, email, ... } }
      const actualProfile = profileData.user || profileData.profile || profileData;
      console.log("📦 Actual profile after unwrap:", actualProfile);

      // Ensure we have minimum required data
      if (!actualProfile.id && !actualProfile.email) {
        console.warn("⚠️ Invalid profile data from backend", actualProfile);
        return;
      }

      const cur = get().user;

      // Backend bisa return display_name atau name
      const displayName = actualProfile.display_name || actualProfile.name;
      const fallbackName = actualProfile.email?.split("@")[0] || "User";

      const merged: User = {
        id: actualProfile.id || cur?.id || "",
        email: actualProfile.email || cur?.email || "",
        name: displayName || cur?.name || fallbackName,
        role: actualProfile.role || cur?.role || "buyer",
        store_name: actualProfile.store_name || cur?.store_name || null,
      };

      console.log("✅ Merged profile:", merged);
      set({ user: merged });
      persistUser(merged);
    }
  } catch (error) {
    // Silently handle errors - profil opsional
    console.debug("⚠️ mergeProfileIntoState error:", error);
  }
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,

  /** Hydrate saat app start: ambil dari localStorage, lalu coba merge profil dari backend */
  hydrate: async () => {
    if (typeof window === "undefined") return;
    set({ isLoading: true });
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as User;
          set({ user: parsed });
        } catch {
          localStorage.removeItem(LS_KEY);
        }
      }
      // setelah load lokal, coba ambil profil lengkap (biar role ke-update)
      await mergeProfileIntoState(set, get);
    } finally {
      set({ isLoading: false });
    }
  },

  setUser: (u: User) => {
    persistUser(u);
    set({ user: u });
    syncCartWithUser(u.id); // ✅ Sync cart when user is set
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      console.log("🔐 Auth Service: Login attempt", { email });
      const result = await authService.login({ email, password });
      console.log("🔐 Auth Service: Login response", result);

      // ekspektasi: result = { ok, user?, message? } dan token sudah disimpan oleh authService
      if (result.ok && (result as any).user) {
        const userData = (result as any).user;

        // Map dari backend format ke User format
        const u: User = {
          id: userData.id,
          email: userData.email,
          name: userData.name || userData.display_name || userData.email?.split("@")[0] || "User",
          role: userData.role || "buyer",
          store_name: userData.store_name || null,
        };

        console.log("✅ Login success, user:", u);
        persistUser(u);
        set({ user: u });

        // merge profil (role/store_name) setelah login
        await mergeProfileIntoState(set, get);
        set({ isLoading: false });
        return { ok: true, user: get().user! };
      }

      console.warn("⚠️ Login failed:", (result as any).message);
      set({ isLoading: false });
      return { ok: false, message: (result as any).message || "Login gagal" };
    } catch (error) {
      console.error("❌ Login error:", error);
      set({ isLoading: false });
      return { ok: false, message: "Terjadi kesalahan saat login" };
    }
  },

  register: async (email: string, password: string, name?: string) => {
    set({ isLoading: true });
    try {
      console.log("🔐 Auth Service: Register attempt", { email, name });
      const result = await authService.register({
        email,
        password,
        displayName: name || email.split("@")[0],
      });

      console.log("🔐 Auth Service: Register response", result);

      // ✅ Register berhasil - TIDAK set user, TIDAK login otomatis
      // Backend tidak return token, jadi user harus login manual
      if (result.ok) {
        console.log("✅ Register success - user must login");
        set({ isLoading: false });
        return {
          ok: true,
          message: "Registrasi berhasil! Silakan login dengan akun Anda.",
        } as any;
      }

      console.warn("⚠️ Register failed:", (result as any).message);
      set({ isLoading: false });
      return { ok: false, message: (result as any).message || "Registrasi gagal" };
    } catch (error) {
      console.error("❌ Register error:", error);
      set({ isLoading: false });
      return { ok: false, message: "Terjadi kesalahan saat registrasi" };
    }
  },

  logout: () => {
    try {
      authService.logout?.();
    } catch {
      // noop
    }

    // Clear all auth-related data
    persistUser(null);

    // Clear token
    if (typeof window !== "undefined") {
      localStorage.removeItem("devstore_token");
      localStorage.removeItem("devstore_redirect_after_login");
    }

    set({ user: null });
    syncCartWithUser(null); // ✅ Clear cart on logout

    // Redirect to login
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },
}));
