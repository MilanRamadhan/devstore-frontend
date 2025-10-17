// src/store/auth.ts
"use client";

import { create } from "zustand";

export type User = {
  id: string;
  name: string;
  email: string;
};

type AuthState = {
  user: User | null;
  login: (u: User) => void;
  register: (u: User) => void;
  logout: () => void;
  hydrate: () => void;
};

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  hydrate: () => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("devstore_user");
    if (raw) set({ user: JSON.parse(raw) as User });
  },
  login: (u) => {
    if (typeof window !== "undefined") localStorage.setItem("devstore_user", JSON.stringify(u));
    set({ user: u });
  },
  register: (u) => {
    if (typeof window !== "undefined") localStorage.setItem("devstore_user", JSON.stringify(u));
    set({ user: u });
  },
  logout: () => {
    if (typeof window !== "undefined") localStorage.removeItem("devstore_user");
    set({ user: null });
  },
}));
