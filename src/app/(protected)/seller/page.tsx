// src/app/(protected)/seller/page.tsx
"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth";
import { sellerService } from "@/lib/services/seller";
import { Product } from "@/lib/types";
import Link from "next/link";
import { formatIDR } from "@/lib/format";

/* ====================== PAGE ====================== */

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && user.role !== "seller") {
      router.push("/");
      return;
    }
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router]);

  async function loadProducts() {
    setIsLoading(true);
    const result = await sellerService.getMyProducts();

    if (result.ok && result.products) {
      setProducts(result.products);
    } else {
      setError(result.message || "Gagal memuat produk");
    }
    setIsLoading(false);
  }

  async function handlePublishToggle(productId: string, currentStatus: boolean) {
    const result = await sellerService.publishProduct(productId, !currentStatus);
    if (result.ok) {
      loadProducts(); // Refresh
    } else {
      alert(result.message);
    }
  }

  if (!user || user.role !== "seller") {
    return (
      <div className="py-20 text-center">
        <p className="text-neutral-600">Anda tidak memiliki akses ke halaman ini.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <GlassCard className="p-8 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-neutral-300 border-t-black" aria-hidden="true" />
          <p className="mt-4 text-neutral-600">Memuat produk...</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seller Dashboard</h1>
          <p className="mt-1 text-neutral-600">Kelola produk dan add-on Anda</p>
        </div>

        <GlassButton asChild variant="primary" aria-label="Tambah produk baru">
          <Link href="/seller/products/new">+ Produk Baru</Link>
        </GlassButton>
      </div>

      {/* Error */}
      {error && (
        <GlassCard className="mb-6 border-red-200 bg-red-50/80 p-4 ring-red-100" role="alert" aria-live="assertive">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </GlassCard>
      )}

      {/* Empty */}
      {products.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <p className="text-lg text-neutral-700">Belum ada produk.</p>
          <p className="mt-2 text-sm text-neutral-600">Mulai dengan membuat produk pertama Anda!</p>
          <div className="mt-4 flex justify-center">
            <GlassButton asChild variant="primary">
              <Link href="/seller/products/new">Buat Produk</Link>
            </GlassButton>
          </div>
        </GlassCard>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product: any) => (
            <GlassCard key={product.id} className="p-6">
              {/* Gambar Produk */}
              {product.cover_url && (
                <div className="mb-4 h-32 w-full overflow-hidden rounded-xl border border-white/60 bg-white/70 ring-1 ring-black/5">
                  <img src={product.cover_url} alt={product.title || "Cover produk"} className="h-full w-full object-cover" />
                </div>
              )}

              {/* Title + Status */}
              <div className="mb-4 flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{product.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{product.description || "Tanpa deskripsi"}</p>
                </div>
                <StatusPill published={!!product.published} />
              </div>

              {/* Harga */}
              <div className="mb-4 text-base font-semibold text-neutral-900">{formatIDR(Number(product.base_price) || 0)}</div>

              {/* Stack */}
              {product.stack && product.stack.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {product.stack.slice(0, 3).map((tech: string) => (
                    <span key={tech} className="rounded-full border border-white/60 bg-white/70 px-2 py-1 text-xs text-neutral-700 ring-1 ring-black/5">
                      {tech}
                    </span>
                  ))}
                  {product.stack.length > 3 && <span className="rounded-full border border-white/60 bg-white/70 px-2 py-1 text-xs text-neutral-700 ring-1 ring-black/5">+{product.stack.length - 3}</span>}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <GlassButton asChild variant="neutral" className="flex-1">
                  <Link href={`/seller/products/${product.id}/edit`}>Edit</Link>
                </GlassButton>

                <GlassButton onClick={() => handlePublishToggle(product.id, product.published)} variant={product.published ? "warning" : "info"} className="flex-1">
                  {product.published ? "Unpublish" : "Publish"}
                </GlassButton>
              </div>

              <GlassButton asChild variant="neutral" className="mt-2 w-full">
                <Link href={`/seller/products/${product.id}/addons`}>Kelola Add-ons</Link>
              </GlassButton>
            </GlassCard>
          ))}
        </div>
      )}
    </main>
  );
}

/* ====================== UI PRIMITIVES ====================== */

/** GlassCard: kartu glass dengan hover halus & ring aksen */
type GlassCardProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children: React.ReactNode;
};

function GlassCard({ children, className = "", ...rest }: GlassCardProps) {
  const base = "relative rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl ring-1 ring-black/5 transition shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:bg-white/75 hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)]";
  return (
    <div className={`${base} ${className}`} {...rest}>
      <div className="pointer-events-none absolute inset-0 rounded-[16px] ring-1 ring-black/5" />
      {children}
    </div>
  );
}

/** GlassButton: tombol soft dengan varian + hover jelas; polymorphic clone untuk <Link> */
type GlassButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean; // jika true dan child adalah ReactElement, akan di-clone
  variant?: "primary" | "neutral" | "success" | "info" | "warning" | "danger";
  className?: string;
  children: React.ReactNode;
};

function GlassButton({ asChild, variant = "neutral", className = "", children, ...rest }: GlassButtonProps) {
  const base = "inline-flex h-10 items-center justify-center rounded-2xl px-4 text-sm font-medium transition focus:outline-none focus:ring-1 focus:ring-black/10";

  const styles: Record<Required<GlassButtonProps>["variant"], string> = {
    primary: "bg-black/90 text-white hover:bg-black hover:shadow-[0_6px_20px_rgba(0,0,0,0.10)]",
    neutral: "border border-white/60 bg-white/70 text-neutral-900 ring-1 ring-black/5 hover:bg-white/85 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)]",
    success: "border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:shadow-[0_6px_20px_rgba(16,185,129,0.12)]",
    info: "border border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100 hover:shadow-[0_6px_20px_rgba(56,189,248,0.12)]",
    warning: "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 hover:shadow-[0_6px_20px_rgba(245,158,11,0.12)]",
    danger: "border border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100 hover:shadow-[0_6px_20px_rgba(244,63,94,0.14)]",
  };

  const cls = `${base} ${styles[variant]} ${className}`;

  // ✅ Fix: periksa validitas element sebelum clone
  if (asChild && React.isValidElement(children)) {
    const existingClass = (children.props as any)?.className ?? "";
    return React.cloneElement(
      children as React.ReactElement<any>,
      {
        className: [cls, existingClass].filter(Boolean).join(" "),
        ...rest,
      } as any
    );
  }

  // fallback kalau bukan element (text biasa)
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}

/** Status pill soft */
function StatusPill({ published }: { published: boolean }) {
  const cls = published ? "border-green-200 bg-green-50 text-green-700" : "border-amber-200 bg-amber-50 text-amber-800";
  const label = published ? "Published" : "Draft";
  return (
    <span className={`inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium ${cls}`} aria-label={`Status produk: ${label}`}>
      {label}
    </span>
  );
}
