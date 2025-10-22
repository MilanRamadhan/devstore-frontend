"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/store/auth";
import { formatIDR } from "@/lib/format";
import { Package, Clock, CheckCircle2, AlertCircle, FileText, Download, Upload, MessageSquare } from "lucide-react";
import ConfirmModal from "@/components/modals/confirm-modal";
import { UploadDeliverableModal } from "@/components/modals/upload-deliverable-modal";

/* ====================== TYPES ====================== */
type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  delivery: "instant" | "custom";
  quantity: number;
  unit_price: number;
  brief?: string;
  custom_status?: string;
  download_path?: string;
  product?: { id: string; title: string; delivery: string };
  order?: { id: string; buyer_id: string; status: string; created_at: string; grand_total: number };
};

/* ====================== PAGE ====================== */
export default function SellerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "instant" | "custom">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "in_progress" | "delivered">("all");

  // modal states
  const [startTarget, setStartTarget] = useState<OrderItem | null>(null);
  const [startLoading, setStartLoading] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<OrderItem | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("devstore_token");
      if (!token) return setIsLoading(false);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_URL}/orders/seller/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setOrders(json?.data?.items || []);
      }
    } catch (err) {
      console.error("❌ Load orders error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter((i) => {
    if (filter !== "all" && i.delivery !== filter) return false;
    if (statusFilter !== "all" && i.custom_status !== statusFilter) return false;
    return true;
  });

  const customOrders = orders.filter((o) => o.delivery === "custom");
  const pendingCount = customOrders.filter((o) => o.custom_status === "pending" || o.custom_status === "waiting_brief").length;
  const inProgressCount = customOrders.filter((o) => o.custom_status === "in_progress").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="mt-1 text-neutral-600">Manage orders dari buyer untuk produk kamu</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatsCard icon={<Package />} label="Total Orders" value={orders.length} />
        <StatsCard icon={<Clock />} label="Pending Custom Orders" value={pendingCount} />
        <StatsCard icon={<CheckCircle2 />} label="In Progress" value={inProgressCount} />
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <FilterButton active={filter === "all"} onClick={() => setFilter("all")} label="All Orders" />
          <FilterButton active={filter === "custom"} onClick={() => setFilter("custom")} label="Custom Orders" icon={<FileText className="h-3.5 w-3.5" />} />
          <FilterButton active={filter === "instant"} onClick={() => setFilter("instant")} label="Instant Products" icon={<Download className="h-3.5 w-3.5" />} />

          <div className="mx-2 h-6 w-px bg-neutral-300/60" />

          <FilterButton active={statusFilter === "all"} onClick={() => setStatusFilter("all")} label="All Status" />
          <FilterButton active={statusFilter === "pending"} onClick={() => setStatusFilter("pending")} label="Pending" />
          <FilterButton active={statusFilter === "in_progress"} onClick={() => setStatusFilter("in_progress")} label="In Progress" />
          <FilterButton active={statusFilter === "delivered"} onClick={() => setStatusFilter("delivered")} label="Delivered" />
        </div>
      </GlassCard>

      {/* List */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <Package className="mx-auto mb-3 h-12 w-12 text-neutral-400" />
          <p className="text-neutral-700">Belum ada order yang masuk</p>
          <p className="mt-1 text-sm text-neutral-600">Order akan muncul di sini setelah buyer checkout</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((item) => (
            <OrderItemCard key={item.id} item={item} onUpdate={loadOrders} onAskStart={() => setStartTarget(item)} onAskUpload={() => setUploadTarget(item)} />
          ))}
        </div>
      )}

      {/* Modal: Start Working */}
      <ConfirmModal
        open={!!startTarget}
        title="Mulai mengerjakan order ini?"
        description={startTarget ? `Order: ${startTarget.product?.title ?? "Product"}` : undefined}
        confirmText="Mulai Sekarang"
        cancelText="Batal"
        loading={startLoading}
        onClose={() => setStartTarget(null)}
        onConfirm={async () => {
          if (!startTarget) return;
          setStartLoading(true);
          try {
            const token = localStorage.getItem("devstore_token");
            if (!token) return;
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
            await fetch(`${API_URL}/orders/${startTarget.order_id}/items/${startTarget.id}/start`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            });
            setStartTarget(null);
            await loadOrders();
          } catch (e) {
            // optional: tampilkan toast
          } finally {
            setStartLoading(false);
          }
        }}
      />

      {/* Modal: Upload Deliverable */}
      <UploadDeliverableModal
        isOpen={!!uploadTarget}
        onClose={() => setUploadTarget(null)}
        onSuccess={async () => {
          setUploadTarget(null);
          await loadOrders();
        }}
        orderItemId={uploadTarget?.id ?? ""}
        orderId={uploadTarget?.order_id ?? ""}
        productTitle={uploadTarget?.product?.title ?? "Product"}
      />
    </div>
  );
}

/* ====================== SUBCOMPONENTS ====================== */

function StatsCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <GlassCard className="p-4 transition hover:bg-white/75 hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-white/60 bg-white/70 p-2.5 ring-1 ring-black/5">{icon}</div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-neutral-600">{label}</p>
        </div>
      </div>
    </GlassCard>
  );
}

function FilterButton({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-1 focus:ring-black/10 ${
        active ? "bg-black/90 text-white hover:bg-black" : "border border-white/60 bg-white/70 text-neutral-800 ring-1 ring-black/5 hover:bg-white/85 hover:shadow-[0_6px_20px_rgba(0,0,0,0.04)]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* glass primitives (local) */
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl ring-1 ring-black/5 transition shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] hover:bg-white/75 ${className}`}>
      <div className="pointer-events-none absolute inset-0 rounded-[16px] ring-1 ring-black/5" />
      {children}
    </div>
  );
}

function GlassBadge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs text-neutral-700 backdrop-blur-xl ring-1 ring-black/5 ${className}`}>{children}</div>;
}

function CardSkeleton() {
  return (
    <GlassCard className="p-4 animate-pulse">
      <div className="mb-3 h-24 w-full rounded-xl bg-neutral-200/60" />
      <div className="h-4 w-2/3 rounded bg-neutral-200/60" />
      <div className="mt-2 h-3 w-1/3 rounded bg-neutral-200/60" />
      <div className="mt-3 h-8 w-24 rounded-2xl bg-neutral-200/60" />
    </GlassCard>
  );
}

function OrderItemCard({ item, onUpdate, onAskStart, onAskUpload }: { item: OrderItem; onUpdate: () => void; onAskStart: () => void; onAskUpload: () => void }) {
  const [showBrief, setShowBrief] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const isCustom = item.delivery === "custom";
  const needsAction = isCustom && (item.custom_status === "pending" || item.custom_status === "waiting_brief");

  const qty = Number(item.quantity) || 0;
  const total = qty * (Number(item.unit_price) || 0);
  const dateStr = item.order?.created_at ? new Date(item.order.created_at).toLocaleDateString("id-ID") : "—";

  return (
    <GlassCard className="p-5 transition hover:bg-white/75 hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold">{item.product?.title}</h3>
            {isCustom ? (
              <GlassBadge>
                <FileText className="h-3 w-3" /> Custom Order
              </GlassBadge>
            ) : (
              <GlassBadge>
                <Download className="h-3 w-3" /> Instant
              </GlassBadge>
            )}
            <StatusBadge status={item.custom_status || item.order?.status} />
          </div>

          <div className="space-y-1 text-sm text-neutral-600">
            <p>
              Order ID: <span className="font-mono text-xs">{item.order_id?.slice(0, 8) || ""}...</span>
            </p>
            <p>
              Quantity: {qty}x • {formatIDR(total)}
            </p>
            <p>Date: {dateStr}</p>
          </div>
        </div>

        {needsAction && (
          <div className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800 ring-1 ring-black/5">
            <AlertCircle className="h-4 w-4" />
            Action Needed
          </div>
        )}
      </div>

      {/* brief buyer */}
      {isCustom && item.brief && (
        <div className="mb-4">
          <button
            onClick={() => setShowBrief(!showBrief)}
            className="inline-flex items-center gap-2 rounded-xl px-2 py-1 text-sm font-medium text-purple-700 transition hover:text-purple-800 focus:outline-none focus:ring-1 focus:ring-black/10"
          >
            <MessageSquare className="h-4 w-4" />
            {showBrief ? "Hide" : "View"} Brief dari Buyer
          </button>

          {showBrief && (
            <div className="mt-2 rounded-xl border border-white/60 bg-white/70 p-3 text-sm ring-1 ring-black/5">
              <p className="whitespace-pre-wrap text-neutral-700">{item.brief}</p>
            </div>
          )}
        </div>
      )}

      {/* actions */}
      <div className="flex flex-wrap items-center gap-3 border-t border-neutral-200 pt-4">
        <Link
          href={`/orders/${item.order_id}`}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-4 py-2 text-sm font-medium text-neutral-800 ring-1 ring-black/5 transition hover:bg-white/85 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-1 focus:ring-black/10"
        >
          View Full Order
        </Link>

        {isCustom && item.custom_status === "pending" && (
          <button
            onClick={onAskStart}
            disabled={isUpdating}
            className="ml-auto inline-flex items-center gap-2 rounded-2xl bg-black/90 px-4 py-2 text-sm font-medium text-white transition hover:bg-black focus:outline-none focus:ring-1 focus:ring-black/10 disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" /> Start Working
          </button>
        )}

        {isCustom && item.custom_status === "in_progress" && (
          <button
            onClick={onAskUpload}
            disabled={isUpdating}
            className="ml-auto inline-flex items-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-800 ring-1 ring-black/5 transition hover:bg-sky-100 hover:shadow-[0_6px_20px_rgba(56,189,248,0.12)] focus:outline-none focus:ring-1 focus:ring-black/10"
          >
            <Upload className="h-4 w-4" /> Upload Deliverable
          </button>
        )}
      </div>
    </GlassCard>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-50 border-amber-200 text-amber-800",
    waiting_brief: "bg-orange-50 border-orange-200 text-orange-800",
    in_progress: "bg-sky-50 border-sky-200 text-sky-800",
    delivered: "bg-emerald-50 border-emerald-200 text-emerald-800",
    approved: "bg-emerald-50 border-emerald-200 text-emerald-800",
    PENDING_PAYMENT: "bg-gray-50 border-gray-200 text-gray-800",
    PAID: "bg-emerald-50 border-emerald-200 text-emerald-800",
    COMPLETED: "bg-emerald-50 border-emerald-200 text-emerald-800",
  };
  const cls = map[status || "pending"] || map.pending;
  const label = (status || "pending").replaceAll("_", " ");
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${cls}`}>{label}</span>;
}
