// src/app/(public)/store/[id]/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import { Store as StoreIcon, Package, Mail, Calendar } from "lucide-react";
import { productService } from "@/lib/services/products";
import { Product } from "@/lib/types";
import ProductCard from "@/components/product-card";

interface StoreInfo {
  id: string;
  display_name: string;
  store_name: string | null;
  bio?: string | null;
  email: string;
  created_at: string;
}

export default function StorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoreData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadStoreData() {
    setIsLoading(true);

    // ---- fetch profil toko
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/${id}`);
      if (r.ok) {
        const j = await r.json();
        if (j.ok && j.data) setStore(j.data);
      }
    } catch {
      // ignore
    }

    // ---- fetch produk toko
    const pr = await productService.getProducts();
    if (pr.ok && pr.products) {
      setProducts(pr.products.filter((p) => (p as any).seller_id === id));
    }

    setIsLoading(false);
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10" aria-live="polite">
        <GlassCard className="p-6 text-center">
          <div className="mx-auto h-4 w-4 animate-spin rounded-full border-2 border-black/80 border-t-transparent" />
          <p className="mt-3 text-sm text-neutral-700">Memuat toko…</p>
        </GlassCard>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <GlassCard className="p-10 text-center">
          <Package className="mx-auto mb-3 h-10 w-10 text-neutral-400" />
          <p className="text-neutral-700">Toko tidak ditemukan.</p>
        </GlassCard>
      </div>
    );
  }

  const name = store.store_name || store.display_name;
  const joined = new Date(store.created_at).toLocaleDateString("id-ID", { month: "long", year: "numeric" }) || "-";

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      {/* ===== Header Toko ===== */}
      <GlassCard className="p-6 transition hover:bg-white/70 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/60 bg-white/70 ring-1 ring-black/5" aria-hidden="true">
            <StoreIcon className="h-8 w-8 text-neutral-900" />
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
            <p className="mt-0.5 text-neutral-600">{store.display_name}</p>

            {store.bio && <p className="mt-3 max-w-2xl text-neutral-700">{store.bio}</p>}

            <div className="mt-4 flex flex-wrap gap-3 text-sm text-neutral-700">
              <InfoPill icon={<Mail className="h-3.5 w-3.5" aria-hidden="true" />}>{store.email}</InfoPill>
              <InfoPill icon={<Calendar className="h-3.5 w-3.5" aria-hidden="true" />}>Bergabung {joined}</InfoPill>
              <InfoPill icon={<Package className="h-3.5 w-3.5" aria-hidden="true" />}>{products.length} produk</InfoPill>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* ===== Daftar Produk ===== */}
      <div className="flex items-end justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Produk dari {name}</h2>
        <span className="text-sm text-neutral-600">{products.length} produk</span>
      </div>

      {products.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Package className="mx-auto mb-3 h-12 w-12 text-neutral-400" />
          <p className="text-neutral-700">Toko ini belum memiliki produk.</p>
        </GlassCard>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} p={product} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= helpers (scoped) ================= */

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)] ${className}`} role="region" aria-label="Section">
      {/* ring aksen tipis */}
      <div className="pointer-events-none absolute inset-0 rounded-[16px] ring-1 ring-black/5" />
      {children}
    </div>
  );
}

function InfoPill({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-neutral-800 ring-1 ring-black/5 transition hover:bg-white/80 hover:ring-black/10 hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-1 focus:ring-black/10"
      tabIndex={0}
    >
      {icon}
      <span className="truncate">{children}</span>
    </span>
  );
}
