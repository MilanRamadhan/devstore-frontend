"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/store/auth";
import { formatIDR } from "@/lib/format";
import { Package, Clock, CheckCircle2, AlertCircle, FileText, Download, Upload, MessageSquare } from "lucide-react";
import { UploadDeliverableModal } from "@/components/upload-deliverable-modal";

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
  product?: {
    id: string;
    title: string;
    delivery: string;
  };
  order?: {
    id: string;
    buyer_id: string;
    status: string;
    created_at: string;
    grand_total: number;
  };
};

export default function SellerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "instant" | "custom">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "in_progress" | "delivered">("all");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("devstore_token"); // ✅ Use correct key
      if (!token) {
        console.error("❌ No token found - user not authenticated");
        setIsLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5000/api/orders/seller/items", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Seller orders loaded:", result);
        console.log("📊 Response structure:", {
          hasData: !!result.data,
          hasItems: !!result.data?.items,
          itemsType: Array.isArray(result.data?.items) ? "array" : typeof result.data?.items,
          itemsLength: result.data?.items?.length,
          itemsPreview: result.data?.items?.slice(0, 2),
          fullResponse: JSON.stringify(result, null, 2),
        });

        // ✅ Backend response structure: { ok: true, data: { items: [...], count: N } }
        const items = result.data?.items || [];
        console.log(`📦 Setting ${items.length} order items to state`);
        setOrders(items);
      } else {
        console.error("❌ Failed to load seller orders:", response.status, response.statusText);
        const errorText = await response.text();
        console.error("❌ Error response:", errorText);
      }
    } catch (error) {
      console.error("❌ Failed to load seller orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter((item) => {
    if (filter !== "all" && item.delivery !== filter) return false;
    if (statusFilter !== "all" && item.custom_status !== statusFilter) return false;
    return true;
  });

  const customOrders = orders.filter((o) => o.delivery === "custom");
  const pendingCount = customOrders.filter((o) => o.custom_status === "pending" || o.custom_status === "waiting_brief").length;
  const inProgressCount = customOrders.filter((o) => o.custom_status === "in_progress").length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-neutral-600 mt-1">Manage orders dari buyer untuk produk kamu</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard icon={<Package className="h-5 w-5 text-blue-600" />} label="Total Orders" value={orders.length} bgColor="bg-blue-50" />
        <StatsCard icon={<Clock className="h-5 w-5 text-orange-600" />} label="Pending Custom Orders" value={pendingCount} bgColor="bg-orange-50" />
        <StatsCard icon={<CheckCircle2 className="h-5 w-5 text-green-600" />} label="In Progress" value={inProgressCount} bgColor="bg-green-50" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <FilterButton active={filter === "all"} onClick={() => setFilter("all")} label="All Orders" />
        <FilterButton active={filter === "custom"} onClick={() => setFilter("custom")} label="Custom Orders" icon={<FileText className="h-3.5 w-3.5" />} />
        <FilterButton active={filter === "instant"} onClick={() => setFilter("instant")} label="Instant Products" icon={<Download className="h-3.5 w-3.5" />} />

        <div className="h-6 w-px bg-neutral-300 mx-2" />

        <FilterButton active={statusFilter === "all"} onClick={() => setStatusFilter("all")} label="All Status" />
        <FilterButton active={statusFilter === "pending"} onClick={() => setStatusFilter("pending")} label="Pending" />
        <FilterButton active={statusFilter === "in_progress"} onClick={() => setStatusFilter("in_progress")} label="In Progress" />
        <FilterButton active={statusFilter === "delivered"} onClick={() => setStatusFilter("delivered")} label="Delivered" />
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-neutral-300 rounded-2xl">
          <Package className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
          <p className="text-neutral-600">Belum ada order yang masuk</p>
          <p className="text-sm text-neutral-500 mt-1">Order akan muncul di sini setelah buyer checkout</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((item) => (
            <OrderItemCard key={item.id} item={item} onUpdate={loadOrders} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatsCard({ icon, label, value, bgColor }: any) {
  return (
    <div className={`${bgColor} rounded-2xl border border-white/60 p-4 ring-1 ring-black/5`}>
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-white p-2.5 ring-1 ring-black/5">{icon}</div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-neutral-600">{label}</p>
        </div>
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, label, icon }: any) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${active ? "bg-black text-white" : "bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50"}`}>
      {icon}
      {label}
    </button>
  );
}

function OrderItemCard({ item, onUpdate }: { item: OrderItem; onUpdate: () => void }) {
  const [showBrief, setShowBrief] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const isCustom = item.delivery === "custom";
  const needsAction = isCustom && (item.custom_status === "pending" || item.custom_status === "waiting_brief");

  const handleStartWork = async () => {
    if (!confirm("Mulai mengerjakan order ini?")) return;

    setIsUpdating(true);
    try {
      const token = localStorage.getItem("devstore_token"); // ✅ Use correct key
      if (!token) {
        alert("❌ Anda belum login. Silakan login terlebih dahulu.");
        setIsUpdating(false);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/orders/${item.order_id}/items/${item.id}/start`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("✅ Status updated to In Progress!");
        onUpdate();
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      alert("Error updating status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUploadDeliverable = () => {
    setUploadModalOpen(true);
  };

  return (
    <>
      {/* Upload Modal */}
      <UploadDeliverableModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        orderItemId={item.id}
        orderId={item.order_id}
        productTitle={item.product?.title || "Product"}
        onSuccess={() => {
          setUploadModalOpen(false);
          onUpdate();
        }}
      />

      <div className="rounded-2xl border border-white/60 bg-white/60 p-5 backdrop-blur-xl ring-1 ring-black/5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-lg">{item.product?.title}</h3>
              {isCustom ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 border border-purple-200 px-2 py-0.5 text-xs text-purple-700">
                  <FileText className="h-3 w-3" />
                  Custom Order
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs text-blue-700">
                  <Download className="h-3 w-3" />
                  Instant
                </span>
              )}
              <StatusBadge status={item.custom_status || item.order?.status} />
            </div>

            <div className="text-sm text-neutral-600 space-y-1">
              <p>
                Order ID: <span className="font-mono text-xs">{item.order_id.slice(0, 8)}...</span>
              </p>
              <p>
                Quantity: {item.quantity}x • {formatIDR(item.unit_price * item.quantity)}
              </p>
              <p>Date: {new Date(item.order?.created_at || "").toLocaleDateString("id-ID")}</p>
            </div>
          </div>

          {needsAction && (
            <div className="flex items-center gap-2 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg px-3 py-1.5">
              <AlertCircle className="h-4 w-4" />
              Action Needed
            </div>
          )}
        </div>

        {/* Brief Section */}
        {isCustom && item.brief && (
          <div className="mb-4">
            <button onClick={() => setShowBrief(!showBrief)} className="flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-800">
              <MessageSquare className="h-4 w-4" />
              {showBrief ? "Hide" : "View"} Brief dari Buyer
            </button>

            {showBrief && (
              <div className="mt-2 rounded-lg border border-purple-200 bg-purple-50/50 p-3 text-sm">
                <p className="text-neutral-700 whitespace-pre-wrap">{item.brief}</p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-neutral-200">
          <Link href={`/orders/${item.order_id}`} className="text-sm text-neutral-600 hover:text-black">
            View Full Order →
          </Link>

          {isCustom && item.custom_status === "pending" && (
            <button onClick={handleStartWork} disabled={isUpdating} className="ml-auto inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">
              <CheckCircle2 className="h-4 w-4" />
              Start Working
            </button>
          )}

          {isCustom && item.custom_status === "in_progress" && (
            <button onClick={handleUploadDeliverable} disabled={isUpdating} className="ml-auto inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              <Upload className="h-4 w-4" />
              Upload Deliverable
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-yellow-50 border-yellow-200 text-yellow-700" },
    waiting_brief: { label: "Waiting Brief", className: "bg-orange-50 border-orange-200 text-orange-700" },
    in_progress: { label: "In Progress", className: "bg-blue-50 border-blue-200 text-blue-700" },
    delivered: { label: "Delivered", className: "bg-green-50 border-green-200 text-green-700" },
    approved: { label: "Approved", className: "bg-green-50 border-green-200 text-green-700" },
    PENDING_PAYMENT: { label: "Pending Payment", className: "bg-gray-50 border-gray-200 text-gray-700" },
    PAID: { label: "Paid", className: "bg-green-50 border-green-200 text-green-700" },
    COMPLETED: { label: "Completed", className: "bg-green-50 border-green-200 text-green-700" },
  };

  const config = statusConfig[status || "pending"] || statusConfig.pending;

  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${config.className}`}>{config.label}</span>;
}
