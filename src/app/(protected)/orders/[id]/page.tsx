// src/app/(protected)/orders/[id]/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { orderService } from "@/lib/services/orders";
import { Order } from "@/lib/types";
import { formatIDR } from "@/lib/format";
import { Package, Clock, CheckCircle2, XCircle, AlertCircle, ChevronLeft, Download, FileText } from "lucide-react";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // === State (dipertahankan) ===
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [approvingMilestone, setApprovingMilestone] = useState<string | null>(null); // dipertahankan walau tidak dipakai
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      const result = await orderService.getOrderDetail(id);

      if (result.ok && result.order) {
        setOrder(result.order);

        // Banner sukses untuk order baru dibuat (<=30s)
        const createdAt = new Date(result.order.created_at).getTime();
        if (Date.now() - createdAt < 30_000) {
          setShowSuccessBanner(true);
          setTimeout(() => setShowSuccessBanner(false), 5000);
        }
      } else {
        setError(result.message || "Order tidak ditemukan");
      }

      setIsLoading(false);
    };

    fetchOrder();
  }, [id]);

  // NOTE: approve milestone dihilangkan di mode dual di kode sebelumnya
  // tapi state-nya tetap ada agar tidak breaking:
  // const handleApproveMilestone = async (milestoneId: string) => { ... }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-neutral-600">Memuat order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-3 py-1.5 text-sm text-neutral-800 ring-1 ring-black/5 transition hover:bg-white/80 focus:outline-none focus:ring-1 focus:ring-black/10"
        >
          <ChevronLeft className="h-4 w-4" />
          Kembali
        </button>

        <GlassCard className="p-8 text-center transition hover:bg-white/75 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold text-neutral-900">Order Tidak Ditemukan</h2>
          <p className="text-neutral-700">{error}</p>
        </GlassCard>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      {showSuccessBanner && (
        <GlassCard className="p-4 border-green-200 bg-green-50/85 transition hover:bg-green-100/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900">🎉 Checkout Berhasil!</h3>
              <p className="text-sm text-green-700">✨ Order completed! Download source code sekarang di bawah.</p>
            </div>
            <button onClick={() => setShowSuccessBanner(false)} className="rounded-xl px-2 text-green-700 transition hover:bg-white/60 hover:text-green-900" aria-label="Tutup banner sukses">
              ✕
            </button>
          </div>
        </GlassCard>
      )}

      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-3 py-1.5 text-sm text-neutral-800 ring-1 ring-black/5 transition hover:bg-white/90 hover:ring-black/10 hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-1 focus:ring-black/10 active:scale-[0.98]"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Kembali ke Orders
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Order #{order.id.slice(0, 8)}</h1>
              <StatusBadge status={order.status} config={statusConfig} />
            </div>
            <p className="text-sm text-neutral-600">
              Dibuat pada{" "}
              {new Date(order.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <GlassCard className="p-5 transition hover:bg-white/75 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">Items</h2>
            <div className="space-y-3">
              {order.order_items?.map((item) => {
                const qty = Number(item.quantity) || 0;
                const unit = Number(item.unit_price) || 0;
                return (
                  <div key={item.id} className="flex items-start justify-between rounded-2xl border border-white/60 bg-white/60 p-3 ring-1 ring-black/5 transition hover:bg-white/80">
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900">{item.product?.title || "Product"}</p>
                      <p className="text-sm text-neutral-600">Quantity: {qty}</p>
                      <p className="mt-1 text-xs text-neutral-500">{item.delivery === "instant" ? "⚡ Instant Download" : "🎨 Custom Order"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-neutral-900">{formatIDR(unit * qty)}</p>
                      <p className="text-xs text-neutral-600">{formatIDR(unit)}/unit</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Instant Downloads */}
          {(order.status === "COMPLETED" || order.status === "PAID") && order.order_items?.some((item) => item.delivery === "instant") && (
            <GlassCard className="p-5 transition hover:bg-white/75 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-600">
                  <Download className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">Download Files</h2>
                  <p className="text-sm text-neutral-600">Akses instant untuk produk digital</p>
                </div>
              </div>

              <div className="space-y-3">
                {order.order_items
                  ?.filter((i) => i.delivery === "instant")
                  .map((item) => (
                    <div key={item.id} className="rounded-2xl border border-white/60 bg-white/60 p-4 ring-1 ring-black/5 transition hover:bg-white/80">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-neutral-900">{item.product?.title || "Product"}</p>
                          <p className="mt-1 text-xs text-neutral-600">Downloaded {item.download_count || 0} times</p>
                          {item.download_path ? <p className="mt-1 text-xs text-green-600">✓ Ready to download</p> : <p className="mt-1 text-xs text-orange-600">⚠️ File not available</p>}
                        </div>
                      </div>

                      {item.download_path ? (
                        <a
                          href={orderService.downloadInstant(order.id, item.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-1 focus:ring-black/10"
                        >
                          <Download className="h-4 w-4" />
                          Download {item.product?.title || "Product"}
                        </a>
                      ) : (
                        <button disabled className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-400 px-4 py-2.5 text-sm font-medium text-white opacity-60">
                          <Download className="h-4 w-4" />
                          File Not Available
                        </button>
                      )}

                      <p className="mt-2 text-center text-xs text-neutral-500">Link berlaku selamanya • Akses kapan saja</p>
                    </div>
                  ))}
              </div>

              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/80 p-3">
                <p className="text-xs text-blue-800">
                  💡 <strong>Tips:</strong> Simpan file di tempat aman. Kamu bisa download ulang kapan saja dari halaman ini.
                </p>
              </div>
            </GlassCard>
          )}

          {/* Custom Deliverables */}
          {order.order_items?.some((item) => item.delivery === "custom" && item.custom_status === "delivered") && (
            <GlassCard className="p-5 transition hover:bg-white/70 hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400/20 to-pink-400/20 text-purple-600 ring-1 ring-white/50">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">Custom Order Deliverables</h2>
                  <p className="text-sm text-neutral-600">File hasil custom order dari seller</p>
                </div>
              </div>

              <div className="space-y-3">
                {order.order_items
                  ?.filter((item) => item.delivery === "custom" && item.custom_status === "delivered")
                  .map((item) => (
                    <CustomDeliverable key={item.id} orderId={order.id} item={item} />
                  ))}
              </div>

              <div className="mt-4 rounded-xl border border-white/60 bg-white/60 p-3 ring-1 ring-purple-100/40 backdrop-blur-xl">
                <p className="text-xs text-neutral-700">
                  🎨 <strong>Custom Order:</strong> File ini dibuat khusus untuk kamu oleh seller.
                  <br />
                  <span className="text-neutral-600">Download link berlaku selama 1 jam setelah diklik.</span>
                </p>
              </div>
            </GlassCard>
          )}
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <GlassCard className="p-5 transition hover:bg-white/75 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900">Ringkasan</h3>
            <div className="space-y-2">
              <Row label="Subtotal" value={formatIDR(order.subtotal)} />
              <Row label="Platform Fee" value={formatIDR(order.platform_fee)} />
              <Row label="PPN" value={formatIDR(order.tax)} />
              <div className="my-3 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
              <div className="flex items-baseline justify-between">
                <span className="font-semibold text-neutral-800">Total</span>
                <span className="text-xl font-semibold text-neutral-900">{formatIDR(order.grand_total)}</span>
              </div>
            </div>

            <div className="mt-4 border-t border-white/60 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-700">Status</span>
                <span className="flex items-center gap-1 font-medium">
                  {order.status === "COMPLETED" ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      <span className="text-green-600">Siap Download</span>
                    </>
                  ) : order.status === "PAID" ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                      <span className="text-blue-600">Paid</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-3.5 w-3.5 text-neutral-600" />
                      <span className="text-neutral-700">Memproses</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5 transition hover:bg-white/75 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
            <h3 className="mb-3 font-semibold text-neutral-900">Aksi</h3>
            <div className="space-y-2">
              <button className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-4 py-2 text-sm font-medium text-neutral-800 ring-1 ring-black/5 transition hover:bg-white/80 focus:outline-none focus:ring-1 focus:ring-black/10">
                <FileText className="h-4 w-4" />
                Download Invoice
              </button>
              <button className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-4 py-2 text-sm font-medium text-neutral-800 ring-1 ring-black/5 transition hover:bg-white/80 focus:outline-none focus:ring-1 focus:ring-black/10">
                <Package className="h-4 w-4" />
                Hubungi Support
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

/* ========= Subcomponents ========= */

function CustomDeliverable({ orderId, item }: { orderId: string; item: any }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [deliverable, setDeliverable] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDeliverable = async () => {
      try {
        const result = await orderService.getDeliverable(orderId, item.id);
        if (result.ok && result.deliverable) {
          setDeliverable(result.deliverable);
        }
      } catch (err) {
        console.error("Failed to fetch deliverable:", err);
      }
    };
    fetchDeliverable();
  }, [orderId, item.id]);

  const handleDownload = async () => {
    setIsDownloading(true);
    setError("");
    try {
      const result = await orderService.downloadDeliverable(orderId, item.id);
      if (result.ok && result.deliverable?.download_url) {
        window.open(result.deliverable.download_url, "_blank");
      } else {
        setError(result.message || "Gagal mendapatkan download link");
      }
    } catch (err) {
      console.error("Download error:", err);
      setError("Terjadi kesalahan saat download");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="relative rounded-2xl border border-white/60 bg-white/60 p-4 backdrop-blur-xl ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.05)] transition hover:bg-white/70">
      <div className="pointer-events-none absolute inset-0 rounded-[16px] ring-1 ring-black/5" />

      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <p className="font-medium text-neutral-800">{item.product?.title || "Product"}</p>

          {deliverable && (
            <>
              <p className="mt-1 text-xs text-neutral-600">📁 {deliverable.file_name}</p>
              <p className="text-xs text-neutral-600">
                📤 Uploaded{" "}
                {new Date(deliverable.uploaded_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>

              {deliverable.note && (
                <div className="mt-2 rounded-xl border border-white/60 bg-white/60 p-2 ring-1 ring-black/5">
                  <p className="text-xs text-neutral-700">
                    <strong>Catatan dari seller:</strong>
                  </p>
                  <p className="mt-1 text-xs text-neutral-600">{deliverable.note}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-xl border border-red-200 bg-red-50/70 p-2 ring-1 ring-red-100/30">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      <button
        onClick={handleDownload}
        disabled={isDownloading}
        aria-busy={isDownloading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-black/90 px-4 py-2.5 text-sm font-medium text-white shadow-[0_3px_10px_rgba(0,0,0,0.06)] transition hover:bg-black focus:outline-none focus:ring-1 focus:ring-black/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Download className={`h-4 w-4 ${isDownloading ? "animate-bounce" : ""}`} />
        {isDownloading ? "Memuat..." : `Download ${item.product?.title || "Deliverable"}`}
      </button>

      <p className="mt-2 text-center text-xs text-neutral-500">Link download berlaku selama 1 jam • File disimpan aman di server</p>
    </div>
  );
}

function StatusBadge({ status, config }: { status: string; config: ReturnType<typeof getStatusConfig> }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}>
      {config.icon}
      {config.label}
    </span>
  );
}

function getStatusConfig(status: string) {
  // label/icon sesuai, hanya styling dibuat soft
  const configs: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
    pending: {
      label: "Memproses",
      icon: <Clock className="h-3 w-3" />,
      className: "border border-yellow-200 bg-yellow-50 text-yellow-800",
    },
    PAID: {
      label: "Paid",
      icon: <CheckCircle2 className="h-3 w-3" />,
      className: "border border-blue-200 bg-blue-50 text-blue-800",
    },
    COMPLETED: {
      label: "✓ Siap Download",
      icon: <Download className="h-3 w-3" />,
      className: "border border-green-200 bg-green-50 text-green-800",
    },
    cancelled: {
      label: "Cancelled",
      icon: <XCircle className="h-3 w-3" />,
      className: "border border-red-200 bg-red-50 text-red-800",
    },
    completed: {
      // fallback ke completed lowercase (kalau backend kirim lowercase)
      label: "✓ Siap Download",
      icon: <Download className="h-3 w-3" />,
      className: "border border-green-200 bg-green-50 text-green-800",
    },
  };

  return configs[status] || configs.completed;
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-neutral-700">{label}</span>
      <span className="font-medium text-neutral-900">{value}</span>
    </div>
  );
}

function GlassCard({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`relative rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)] ${className}`} {...props}>
      <div className="pointer-events-none absolute inset-0 rounded-[16px] ring-1 ring-black/5" />
      {children}
    </div>
  );
}
