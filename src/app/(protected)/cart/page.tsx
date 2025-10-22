"use client";

import Link from "next/link";
import { useCart } from "@/store/cart";
import { calcLineSubtotal, checkoutPreview } from "@/lib/pricing";
import CartLine from "@/components/cart-line";
import { Clock, ShieldCheck, ShoppingCart, PackageOpen, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { lines } = useCart();

  const lineTotals = lines.map((l) => {
    const { total } = calcLineSubtotal(l.product, l.selectedAddOnIds);
    return { total: total * l.quantity };
  });

  const estimatedDays = Math.max(
    0,
    ...lines.map((l) => {
      if (l.product.delivery === "instant") return 0;
      return l.product.custom_eta_days ?? 7;
    })
  );
  const preview = checkoutPreview(lineTotals);

  // === EMPTY STATE ===
  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <GlassCard className="p-10 text-center transition hover:bg-white/70 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/60 bg-white/60 ring-1 ring-black/5">
            <PackageOpen className="h-6 w-6 text-neutral-700" />
          </div>
          <h2 className="text-2xl font-semibold text-neutral-900">Cart kamu masih kosong</h2>
          <p className="mt-2 text-neutral-700">Jelajahi katalog, pilih template, dan centang add-on yang kamu butuhkan.</p>
          <div className="mt-6">
            <Link href="/products" className="inline-flex items-center gap-2 rounded-2xl bg-black/90 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black focus:outline-none focus:ring-1 focus:ring-black/10">
              <ShoppingCart className="h-4 w-4" />
              Mulai Belanja
            </Link>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <GlassBadge>
          <ShoppingCart className="h-3.5 w-3.5" />
          <span>{lines.reduce((s, l) => s + l.quantity, 0)} item</span>
        </GlassBadge>

        <div className="inline-flex items-center gap-2 text-sm text-neutral-700">
          <ShieldCheck className="h-4 w-4 text-green-600" />
          Pembayaran aman via escrow & milestone.
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* LEFT */}
        <div className="space-y-4 lg:col-span-2">
          <GlassCard className="p-4 md:p-5 transition hover:bg-white/70 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-900">Cart</h2>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/60 px-3 py-1 text-xs text-neutral-700 ring-1 ring-black/5">
                <Clock className="h-3.5 w-3.5 text-neutral-600" />
                Estimasi: {estimatedDays} hari
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {lines.map((l) => (
                <div key={l.product.id} className="rounded-2xl border border-white/60 bg-white/60 p-3 ring-1 ring-black/5 transition hover:bg-white/75">
                  <CartLine productId={l.product.id} />
                </div>
              ))}
            </div>

            <p className="mt-3 text-xs text-neutral-600">Estimasi waktu dihitung dari SLA dasar + add-on yang dipilih. Bisa berubah sesuai kompleksitas.</p>
          </GlassCard>
        </div>

        {/* RIGHT */}
        <GlassCard className="sticky top-24 h-fit p-4 md:p-5 transition hover:bg-white/70 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <h3 className="text-lg font-semibold text-neutral-900">Ringkasan</h3>

          <div className="mt-3 space-y-2">
            <Row label="Subtotal" value={formatIDR(preview.subtotal)} />
            <Row label="Platform Fee" value={formatIDR(preview.platformFee)} />
            <Row label="PPN" value={formatIDR(preview.tax)} />
            <div className="my-2 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
            <div className="flex items-baseline justify-between">
              <span className="font-semibold text-neutral-800">Total</span>
              <span className="text-lg font-semibold text-neutral-900">{formatIDR(preview.grandTotal)}</span>
            </div>

            {/* Checkout Button */}
            <Link
              href="/checkout"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-black/90 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black focus:outline-none focus:ring-1 focus:ring-black/10"
            >
              Lanjut ke Checkout
              <ArrowRight className="h-4 w-4" />
            </Link>

            <p className="pt-1 text-center text-[11px] text-neutral-600">Dana ditahan di escrow & dirilis per milestone setelah kamu approve.</p>

            <div className="mt-3 rounded-2xl border border-white/60 bg-white/60 p-3 text-xs text-neutral-700 ring-1 ring-black/5">
              <b className="font-medium">Catatan:</b> Pastikan add-on sudah sesuai. Perubahan add-on bisa mempengaruhi estimasi waktu & biaya.
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

/* === Helpers === */

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)] transition ${className}`}>
      <div className="pointer-events-none absolute inset-0 rounded-[16px] ring-1 ring-black/5" />
      {children}
    </div>
  );
}

function GlassBadge({ children }: { children: React.ReactNode }) {
  return <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs text-neutral-700 backdrop-blur-xl ring-1 ring-black/5 transition hover:bg-white/80">{children}</div>;
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-neutral-700">{label}</span>
      <span className="font-medium text-neutral-900">{value}</span>
    </div>
  );
}

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}
