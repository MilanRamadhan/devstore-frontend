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
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [approvingMilestone, setApprovingMilestone] = useState<string | null>(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      const result = await orderService.getOrderDetail(id);

      if (result.ok && result.order) {
        setOrder(result.order);

        // Check if order was created in the last 30 seconds (likely just checked out)
        const createdAt = new Date(result.order.created_at).getTime();
        const now = Date.now();
        const thirtySeconds = 30 * 1000;

        if (now - createdAt < thirtySeconds) {
          setShowSuccessBanner(true);
          // Auto-hide after 5 seconds
          setTimeout(() => setShowSuccessBanner(false), 5000);
        }
      } else {
        setError(result.message || "Order tidak ditemukan");
      }

      setIsLoading(false);
    };

    fetchOrder();
  }, [id]);

  // Remove approveMilestone - not used in dual delivery mode
  // const handleApproveMilestone = async (milestoneId: string) => { ... }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-neutral-600">Memuat order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900">
          <ChevronLeft className="h-4 w-4" />
          Kembali
        </button>
        <GlassCard className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">Order Tidak Ditemukan</h2>
          <p className="text-neutral-700">{error}</p>
        </GlassCard>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);

  return (
    <div className="space-y-6">
      {/* Success Banner - shown for new orders */}
      {showSuccessBanner && (
        <GlassCard className="p-4 bg-green-50/90 border-green-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900">🎉 Checkout Berhasil!</h3>
              <p className="text-sm text-green-700">✨ Order completed! Download source code sekarang di bawah.</p>
            </div>
            <button onClick={() => setShowSuccessBanner(false)} className="text-green-700 hover:text-green-900">
              ✕
            </button>
          </div>
        </GlassCard>
      )}

      {/* Header */}
      <div>
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-4">
          <ChevronLeft className="h-4 w-4" />
          Kembali ke Orders
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold tracking-tight">Order #{order.id.slice(0, 8)}</h1>
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
        {/* Left: Items & Milestones */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <GlassCard className="p-5">
            <h2 className="text-lg font-semibold mb-4">Items</h2>
            <div className="space-y-3">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex items-start justify-between p-3 rounded-xl border border-white/60 bg-white/60 ring-1 ring-black/5">
                  <div className="flex-1">
                    <p className="font-medium">{item.product?.title || "Product"}</p>
                    <p className="text-sm text-neutral-600">Quantity: {item.quantity}</p>
                    <p className="text-xs text-neutral-500 mt-1">{item.delivery === "instant" ? "⚡ Instant Download" : "🎨 Custom Order"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatIDR(item.unit_price * item.quantity)}</p>
                    <p className="text-xs text-neutral-600">{formatIDR(item.unit_price)}/unit</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* INSTANT DELIVERY: Download Section */}
          {(order.status === "COMPLETED" || order.status === "PAID") && order.order_items?.some((item) => item.delivery === "instant") && (
            <GlassCard className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-600">
                  <Download className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Download Files</h2>
                  <p className="text-sm text-neutral-600">Akses instant untuk produk digital</p>
                </div>
              </div>

              <div className="space-y-3">
                {order.order_items
                  ?.filter((item) => item.delivery === "instant")
                  .map((item) => (
                    <div key={item.id} className="p-4 rounded-xl border border-white/60 bg-white/60 ring-1 ring-black/5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-medium">{item.product?.title || "Product"}</p>
                          <p className="text-xs text-neutral-600 mt-1">Downloaded {item.download_count || 0} times</p>
                          {item.download_path && <p className="text-xs text-green-600 mt-1">✓ Ready to download</p>}
                          {!item.download_path && <p className="text-xs text-orange-600 mt-1">⚠️ File not available</p>}
                        </div>
                      </div>

                      {item.download_path ? (
                        <a
                          href={orderService.downloadInstant(order.id, item.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:from-green-600 hover:to-emerald-700"
                        >
                          <Download className="h-4 w-4" />
                          Download {item.product?.title || "Product"}
                        </a>
                      ) : (
                        <button disabled className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gray-400 px-4 py-2.5 text-sm font-medium text-white cursor-not-allowed opacity-60">
                          <Download className="h-4 w-4" />
                          File Not Available
                        </button>
                      )}

                      <p className="text-xs text-neutral-500 mt-2 text-center">Link berlaku selamanya • Akses kapan saja</p>
                    </div>
                  ))}
              </div>

              <div className="mt-4 p-3 rounded-xl bg-blue-50/80 border border-blue-200">
                <p className="text-xs text-blue-800">
                  💡 <strong>Tips:</strong> Simpan file di tempat aman. Kamu bisa download ulang kapan saja dari halaman ini.
                </p>
              </div>
            </GlassCard>
          )}

          {/* CUSTOM ORDER: Deliverables Section */}
          {order.order_items?.some((item) => item.delivery === "custom" && item.custom_status === "delivered") && (
            <GlassCard className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-600">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Custom Order Deliverables</h2>
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

              <div className="mt-4 p-3 rounded-xl bg-purple-50/80 border border-purple-200">
                <p className="text-xs text-purple-800">
                  🎨 <strong>Custom Order:</strong> File ini dibuat khusus untuk kamu oleh seller. Download link berlaku selama 1 jam setelah diklik.
                </p>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Right: Summary */}
        <div className="space-y-6">
          <GlassCard className="p-5">
            <h3 className="text-lg font-semibold mb-4">Ringkasan</h3>
            <div className="space-y-2">
              <Row label="Subtotal" value={formatIDR(order.subtotal)} />
              <Row label="Platform Fee" value={formatIDR(order.platform_fee)} />
              <Row label="PPN" value={formatIDR(order.tax)} />
              <div className="my-3 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
              <div className="flex items-baseline justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-semibold">{formatIDR(order.grand_total)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/60">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-700">Status</span>
                <span className="font-medium flex items-center gap-1">
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
                      <Clock className="h-3.5 w-3.5" />
                      Memproses
                    </>
                  )}
                </span>
              </div>
            </div>
          </GlassCard>

          {/* ✅ INSTANT DELIVERY: Updated Actions */}
          <GlassCard className="p-5">
            <h3 className="font-semibold mb-3">Aksi</h3>
            <div className="space-y-2">
              <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/60 bg-white/60 px-4 py-2 text-sm font-medium text-neutral-800 backdrop-blur-xl ring-1 ring-black/5 transition hover:bg-white/70">
                <FileText className="h-4 w-4" />
                Download Invoice
              </button>
              <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/60 bg-white/60 px-4 py-2 text-sm font-medium text-neutral-800 backdrop-blur-xl ring-1 ring-black/5 transition hover:bg-white/70">
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

// Custom Deliverable Download Component
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
        // Open download URL in new tab
        window.open(result.deliverable.download_url, "_blank");
      } else {
        setError(result.message || "Gagal mendapatkan download link");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat download");
      console.error("Download error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="p-4 rounded-xl border border-white/60 bg-white/60 ring-1 ring-black/5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="font-medium">{item.product?.title || "Product"}</p>
          {deliverable && (
            <>
              <p className="text-xs text-neutral-600 mt-1">📁 {deliverable.file_name}</p>
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
                <div className="mt-2 p-2 rounded-lg bg-neutral-50 border border-neutral-200">
                  <p className="text-xs text-neutral-700">
                    <strong>Catatan dari seller:</strong>
                  </p>
                  <p className="text-xs text-neutral-600 mt-1">{deliverable.note}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-3 p-2 rounded-lg bg-red-50 border border-red-200">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 px-4 py-2.5 text-sm font-medium text-white transition hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className={`h-4 w-4 ${isDownloading ? "animate-bounce" : ""}`} />
        {isDownloading ? "Memuat..." : `Download ${item.product?.title || "Deliverable"}`}
      </button>

      <p className="text-xs text-neutral-500 mt-2 text-center">Link download berlaku selama 1 jam • File disimpan aman di server</p>
    </div>
  );
}

// ✅ INSTANT DELIVERY: Removed MilestoneStatusBadge - not needed

function StatusBadge({ status, config }: { status: string; config: ReturnType<typeof getStatusConfig> }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}>
      {config.icon}
      {config.label}
    </span>
  );
}

// ✅ INSTANT DELIVERY: Simplified status config
function getStatusConfig(status: string) {
  const configs: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
    pending: {
      label: "Memproses",
      icon: <Clock className="h-3 w-3" />,
      className: "bg-yellow-500/90 text-white",
    },
    completed: {
      label: "✓ Siap Download",
      icon: <Download className="h-3 w-3" />,
      className: "bg-green-500/90 text-white",
    },
    cancelled: {
      label: "Cancelled",
      icon: <XCircle className="h-3 w-3" />,
      className: "bg-red-500/90 text-white",
    },
  };

  return configs[status] || configs.completed; // Default to completed
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
    <div className={`rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)] ${className}`} {...props}>
      {children}
    </div>
  );
}
