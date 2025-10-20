// src/app/(protected)/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/store/auth";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, hydrate } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate();
    const t = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(t);
  }, [hydrate]);

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace(`/login?next=${encodeURIComponent(pathname ?? "/")}`);
  }, [ready, user, router, pathname]);

  if (!ready || !user) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="mx-auto max-w-sm rounded-2xl border border-white/60 bg-white/60 p-6 text-center backdrop-blur-xl ring-1 ring-black/5">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/80 border-t-transparent mx-auto mb-3" />
          <div className="text-sm text-neutral-700">Memuat…</div>
        </div>
      </main>
    );
  }

  // penting: wrapper flex-col biar sticky/top-0 di navbar behave enak
  return (
    <div className="min-h-dvh flex flex-col">
      <Navbar />
      <main className="w-full flex-1 mx-auto max-w-7xl px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
}
