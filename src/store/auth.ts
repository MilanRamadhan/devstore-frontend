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

/**
 * Ambil profil lengkap dari backend dan merge ke state.user
 * Mengandalkan authService.me() (harusnya sudah include token).
 * Aman: kalau gagal, tidak melempar error dan tidak merusak state.
 */
async function mergeProfileIntoState(set: (p: Partial<AuthState>) => void, get: () => AuthState) {
  try {
    // @ts-ignore — kasih fleksibilitas kalau authService.me belum diketik
    const resp = authService.me ? await authService.me() : null;
    // Ekspektasi shape: { ok: true, data: { id, email, display_name, role, store_name, ... } }
    if (resp && resp.ok && resp.data) {
      const cur = get().user;
      const merged: User = {
        id: cur?.id ?? resp.data.id,
        email: cur?.email ?? resp.data.email,
        name: cur?.name ?? resp.data.display_name ?? resp.data.name ?? (resp.data.email?.split("@")[0] || "User"),
        role: resp.data.role ?? cur?.role ?? "buyer",
        store_name: resp.data.store_name ?? cur?.store_name ?? null,
      };
      set({ user: merged });
      persistUser(merged);
    }
  } catch {
    // diam aja; profil opsional
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
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const result = await authService.login({ email, password });
      // ekspektasi: result = { ok, user?, message? } dan token sudah disimpan oleh authService
      if (result.ok && (result as any).user) {
        const u = (result as any).user as User;
        persistUser(u);
        set({ user: u });
        // merge profil (role/store_name) setelah login
        await mergeProfileIntoState(set, get);
        set({ isLoading: false });
        return { ok: true, user: get().user! };
      }
      set({ isLoading: false });
      return { ok: false, message: (result as any).message || "Login gagal" };
    } catch {
      set({ isLoading: false });
      return { ok: false, message: "Terjadi kesalahan saat login" };
    }
  },

  register: async (email: string, password: string, name?: string) => {
    set({ isLoading: true });
    try {
      const result = await authService.register({
        email,
        password,
        displayName: name || email.split("@")[0],
      });
      if (result.ok && (result as any).user) {
        const u = (result as any).user as User;
        persistUser(u);
        set({ user: u });
        // merge profil (role/store_name) setelah register
        await mergeProfileIntoState(set, get);
        set({ isLoading: false });
        return { ok: true, user: get().user! };
      }
      set({ isLoading: false });
      return { ok: false, message: (result as any).message || "Registrasi gagal" };
    } catch {
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
    persistUser(null);
    set({ user: null });
  },
}));
