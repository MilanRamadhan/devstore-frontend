"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { calcLineSubtotal, checkoutPreview } from "@/lib/pricing";
import { formatIDR } from "@/lib/format";
import { orderService } from "@/lib/services/orders";
import { Clock, ShieldCheck, CreditCard, FileText, ArrowRight, CheckCircle2 } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, clear } = useCart();

  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [agree, setAgree] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <GlassCard className="p-10 text-center transition hover:bg-white/70 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/60 bg-white/60 ring-1 ring-black/5">
            <CreditCard className="h-6 w-6 text-neutral-700" />
          </div>
          <h2 className="text-2xl font-semibold text-neutral-900">Cart masih kosong</h2>
          <p className="mt-2 text-neutral-700">Tambah produk dulu sebelum checkout, ya.</p>
        </GlassCard>
      </div>
    );
  }

  const lineTotals = lines.map((l) => {
    const { total } = calcLineSubtotal(l.product, l.selectedAddOnIds);
    return { total: total * l.quantity };
  });

  const preview = checkoutPreview(lineTotals);
  const canPay = agree && email.trim().length > 3;

  const handleCheckout = async () => {
    if (!canPay) return;

    setIsProcessing(true);
    setError("");

    try {
      const items = lines.map((line) => ({
        product_id: line.product.id,
        quantity: line.quantity,
        brief: line.brief || undefined,
      }));

      const result = await orderService.checkout(items);

      if (result.ok && result.orderId) {
        clear();
        if ((result as any).requires_brief) router.push(`/orders/${result.orderId}?warning=brief_required`);
        else router.push(`/orders/${result.orderId}`);
      } else {
        setError(result.message || "Checkout gagal. Silakan coba lagi.");
      }
    } catch {
      setError("Terjadi kesalahan saat memproses checkout.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Stepper />
        <GlassBadge>
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
          Instant Digital Delivery
        </GlassBadge>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* LEFT */}
        <div className="space-y-6 lg:col-span-2">
          <GlassCard className="p-4 md:p-5 transition hover:bg-white/70 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
            <h2 className="text-lg font-semibold text-neutral-900">Informasi Pembeli</h2>
            <p className="mt-1 text-sm text-neutral-700">Email dipakai untuk notifikasi order dan akses download source code.</p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm text-neutral-700">Email</label>
                <input
                  type="email"
                  placeholder="kamu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm outline-none ring-1 ring-black/5 placeholder:text-neutral-400 focus:bg-white/90"
                />
              </div>
              <div>
                <label className="text-sm text-neutral-700">Catatan untuk seller (opsional)</label>
                <textarea
                  placeholder="Contoh: minta warna brand biru, custom logo, dll..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm outline-none ring-1 ring-black/5 placeholder:text-neutral-400 focus:bg-white/90"
                />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4 md:p-5 transition hover:bg-white/70 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Instant Digital Delivery</h2>
                <p className="text-sm text-neutral-700">Langsung akses download setelah pembayaran sukses.</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-white/60 bg-white/60 p-3 ring-1 ring-black/5">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Source Code</span>
                </div>
                <p className="mt-1 text-xs text-neutral-600">File lengkap dengan dokumentasi.</p>
              </div>
              <div className="rounded-xl border border-white/60 bg-white/60 p-3 ring-1 ring-black/5">
                <div className="flex items-center gap-2 text-blue-600">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">Panduan Setup</span>
                </div>
                <p className="mt-1 text-xs text-neutral-600">Instruksi instalasi & konfigurasi.</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-neutral-600">✨ Tidak ada waktu tunggu — langsung download begitu bayar!</p>
          </GlassCard>
        </div>

        {/* RIGHT */}
        <GlassCard className="sticky top-24 h-fit p-4 md:p-5 transition hover:bg-white/70 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <h3 className="text-lg font-semibold text-neutral-900">Ringkasan Pembayaran</h3>

          <div className="mt-3 space-y-2">
            <Row label="Subtotal" value={formatIDR(preview.subtotal)} />
            <Row label="Platform Fee" value={formatIDR(preview.platformFee)} />
            <Row label="PPN" value={formatIDR(preview.tax)} />
            <div className="my-2 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
            <div className="flex items-baseline justify-between">
              <span className="font-semibold text-neutral-800">Total</span>
              <span className="text-lg font-semibold text-neutral-900">{formatIDR(preview.grandTotal)}</span>
            </div>
          </div>

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

          {error && <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</div>}

          <button
            disabled={!canPay || isProcessing}
            onClick={handleCheckout}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-black/90 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-black/10"
          >
            {isProcessing ? "Memproses..." : "Bayar Sekarang"}
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="mt-3 space-y-1 text-[11px] text-neutral-600">
            <p>
              <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" /> Instant access setelah pembayaran sukses.
            </p>
            <p>
              <FileText className="mr-1 inline h-3.5 w-3.5" /> Link download tersimpan di halaman order.
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

/* === Helpers === */

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)] ${className}`}>
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

function Stepper() {
  const base = "flex items-center gap-2 rounded-full border border-white/60 bg-white/60 px-3 py-1 text-xs text-neutral-700 ring-1 ring-black/5";
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className={base}>1. Cart</span>
      <span className={base + " font-semibold bg-white/70"}>2. Checkout</span>
      <span className={base}>3. Pembayaran</span>
    </div>
  );
}
