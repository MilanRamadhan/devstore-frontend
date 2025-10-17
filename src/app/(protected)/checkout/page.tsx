"use client";

import { useState } from "react";
import { useCart } from "@/store/cart";
import { calcLineSubtotal, checkoutPreview } from "@/lib/pricing";
import { formatIDR } from "@/lib/format";
import { Clock, ShieldCheck, CreditCard, FileText, ArrowRight, CheckCircle2 } from "lucide-react";

export default function CheckoutPage() {
  const { lines } = useCart();

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <GlassCard className="p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/60 bg-white/60 ring-1 ring-black/5">
            <CreditCard className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-semibold">Cart masih kosong</h2>
          <p className="mt-2 text-neutral-700">Tambah produk dulu sebelum checkout, ya.</p>
        </GlassCard>
      </div>
    );
  }

  const lineTotals = lines.map((l) => {
    const { total } = calcLineSubtotal(l.product, l.selectedAddOnIds);
    return { total: total * l.quantity };
  });

  const baseEta = Math.max(0, ...lines.map((l) => l.product.baseSlaDays ?? 0));
  const preview = checkoutPreview(lineTotals, baseEta);

  // UI state
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [agree, setAgree] = useState(false);

  // mock split milestone: 30/50/20
  const m1 = Math.round(preview.grandTotal * 0.3);
  const m2 = Math.round(preview.grandTotal * 0.5);
  const m3 = preview.grandTotal - m1 - m2;

  const canPay = agree && email.trim().length > 3;

  return (
    <div className="space-y-6">
      {/* Stepper + badges */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Stepper />
        <GlassBadge>
          <Clock className="h-3.5 w-3.5" />
          Estimasi selesai: {preview.etaDays} hari
        </GlassBadge>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* LEFT: form & detail */}
        <div className="lg:col-span-2 space-y-6">
          {/* Kontak Pembeli */}
          <GlassCard className="p-4 md:p-5">
            <h2 className="text-lg font-semibold">Informasi pembeli</h2>
            <p className="mt-1 text-sm text-neutral-700">Email dipakai untuk notifikasi order, milestone, dan file delivery.</p>
            <div className="mt-4">
              <label className="text-sm text-neutral-700">Email</label>
              <input
                type="email"
                placeholder="kamu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm outline-none ring-1 ring-black/5 placeholder:text-neutral-400 focus:bg-white/90"
              />
            </div>
            <div className="mt-4">
              <label className="text-sm text-neutral-700">Catatan untuk seller (opsional)</label>
              <textarea
                placeholder="Contoh: minta warna brand biru, integrasi Midtrans, deploy ke Vercel..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm outline-none ring-1 ring-black/5 placeholder:text-neutral-400 focus:bg-white/90"
              />
            </div>
          </GlassCard>

          {/* Escrow & Milestone Preview */}
          <GlassCard className="p-4 md:p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Escrow & milestone</h2>
              <span className="inline-flex items-center gap-2 text-xs text-neutral-700">
                <ShieldCheck className="h-4 w-4" />
                Dana dirilis setelah approval kamu
              </span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <MilestoneItem index={1} title="Setup" amount={m1} hint="Inisialisasi & setup project" />
              <MilestoneItem index={2} title="Kustomisasi" amount={m2} hint="Implementasi add-on & fitur" />
              <MilestoneItem index={3} title="Handover" amount={m3} hint="Final delivery & dokumen" />
            </div>
            <p className="mt-3 text-xs text-neutral-600">Proporsi default 30% / 50% / 20%. Seller bisa mengusulkan penyesuaian sebelum mulai.</p>
          </GlassCard>
        </div>

        {/* RIGHT: summary & pay */}
        <GlassCard className="h-fit sticky top-24 p-4 md:p-5">
          <h3 className="text-lg font-semibold">Ringkasan pembayaran</h3>
          <div className="mt-3 space-y-2">
            <Row label="Subtotal" value={formatIDR(preview.subtotal)} />
            <Row label="Platform Fee" value={formatIDR(preview.platformFee)} />
            <Row label="PPN" value={formatIDR(preview.tax)} />
            <div className="my-2 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
            <div className="flex items-baseline justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-semibold">{formatIDR(preview.grandTotal)}</span>
            </div>
          </div>

          {/* Agreement */}
          <label className="mt-4 flex items-start gap-2 text-sm text-neutral-700">
            <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border border-white/60 bg-white/70 ring-1 ring-black/5" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <span>
              Saya setuju dengan{" "}
              <a href="#" className="underline">
                Syarat Layanan
              </a>{" "}
              &{" "}
              <a href="#" className="underline">
                Kebijakan Refund
              </a>
              .
            </span>
          </label>

          {/* Pay button (mock) */}
          <button
            disabled={!canPay}
            onClick={() => alert(`Mock pay\nEmail: ${email}\nNotes: ${notes}`)}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-white transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Bayar (Mock)
            <ArrowRight className="h-4 w-4" />
          </button>

          {/* tiny hints */}
          <div className="mt-3 space-y-1 text-[11px] text-neutral-600">
            <p>
              <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" /> Dana ditahan di escrow, dirilis per milestone.
            </p>
            <p>
              <FileText className="mr-1 inline h-3.5 w-3.5" /> Bukti & file delivery akan tersimpan di order.
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

/* ===== helpers (scoped) ===== */

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)] ${className}`}>
      <div className="pointer-events-none absolute inset-0 rounded-[16px] ring-1 ring-black/5" />
      {children}
    </div>
  );
}

function GlassBadge({ children }: { children: React.ReactNode }) {
  return <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/60 px-3 py-1 text-xs text-neutral-700 backdrop-blur-xl ring-1 ring-black/5">{children}</div>;
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-neutral-700">{label}</span>
      <span className="font-medium text-neutral-900">{value}</span>
    </div>
  );
}

function MilestoneItem({ index, title, amount, hint }: { index: number; title: string; amount: number; hint: string }) {
  return (
    <div className="rounded-xl border border-white/60 bg-white/60 p-3 ring-1 ring-black/5">
      <div className="flex items-center justify-between">
        <div className="font-medium">
          Milestone {index}: {title}
        </div>
        <div className="text-sm font-semibold">{formatIDR(amount)}</div>
      </div>
      <div className="mt-1 text-xs text-neutral-600">{hint}</div>
    </div>
  );
}

function Stepper() {
  const stepClass = "flex items-center gap-2 rounded-full border border-white/60 bg-white/60 px-3 py-1 text-xs text-neutral-700 ring-1 ring-black/5";
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className={stepClass}>1. Cart</span>
      <span className={stepClass + " font-semibold"}>2. Checkout</span>
      <span className={stepClass}>3. Pembayaran</span>
    </div>
  );
}
