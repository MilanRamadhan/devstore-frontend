"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { orderService } from "@/lib/services/orders";
import { Order } from "@/lib/types";
import { formatIDR } from "@/lib/format";
import { Package, Clock, CheckCircle2, XCircle, AlertCircle, ChevronRight, Download, Zap, Palette } from "lucide-react";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      const result = await orderService.getMyOrders();

      if (result.ok && result.orders) {
        setOrders(result.orders);
      } else {
        setError(result.message || "Gagal mengambil orders");
      }

      setIsLoading(false);
    };

    fetchOrders();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-neutral-600">Memuat orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <GlassCard className="p-8 text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-semibold mb-2">Terjadi Kesalahan</h2>
        <p className="text-neutral-700">{error}</p>
      </GlassCard>
    );
  }

  if (orders.length === 0) {
    return (
      <GlassCard className="p-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/60 bg-white/60 ring-1 ring-black/5">
          <Package className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-semibold">Belum ada order</h2>
        <p className="mt-2 text-neutral-700">Mulai belanja dan order pertamamu akan muncul di sini.</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Orders</h1>
          <p className="text-sm text-neutral-600">Instant downloads & custom work orders</p>
        </div>
        <GlassBadge>
          <Package className="h-3.5 w-3.5" />
          <span>
            {orders.length} order{orders.length > 1 ? "s" : ""}
          </span>
        </GlassBadge>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} onClick={() => router.push(`/orders/${order.id}`)} />
        ))}
      </div>
    </div>
  );
}

function OrderCard({ order, onClick }: { order: Order; onClick: () => void }) {
  const statusConfig = getStatusConfig(order.status);

  return (
    <GlassCard className="p-4 md:p-5 cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-mono text-neutral-600">#{order.id.slice(0, 8)}</span>
            <StatusBadge status={order.status} config={statusConfig} />
          </div>

          <div className="space-y-1">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                {item.delivery === "instant" ? <Zap className="h-3.5 w-3.5 text-blue-500" /> : <Palette className="h-3.5 w-3.5 text-purple-500" />}
                <p className="text-sm text-neutral-700">
                  {item.product?.title || "Product"} × {item.quantity}
                  <span className="ml-2 text-xs text-neutral-500">({item.delivery === "instant" ? "Instant" : "Custom"})</span>
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-4 text-xs text-neutral-600">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {new Date(order.created_at).toLocaleDateString("id-ID")}
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-lg font-semibold">{formatIDR(order.grand_total)}</div>
          <button className="mt-2 inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900">
            Detail
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </GlassCard>
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
  const configs: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
    PENDING_PAYMENT: {
      label: "Waiting Payment",
      icon: <Clock className="h-3 w-3" />,
      className: "bg-yellow-500/90 text-white",
    },
    PAID: {
      label: "Paid",
      icon: <CheckCircle2 className="h-3 w-3" />,
      className: "bg-blue-500/90 text-white",
    },
    REQUIRES_BRIEF: {
      label: "Need Brief",
      icon: <AlertCircle className="h-3 w-3" />,
      className: "bg-orange-500/90 text-white",
    },
    IN_PROGRESS: {
      label: "In Progress",
      icon: <Clock className="h-3 w-3" />,
      className: "bg-indigo-500/90 text-white",
    },
    DELIVERED: {
      label: "Delivered",
      icon: <Package className="h-3 w-3" />,
      className: "bg-teal-500/90 text-white",
    },
    COMPLETED: {
      label: "✓ Completed",
      icon: <CheckCircle2 className="h-3 w-3" />,
      className: "bg-green-500/90 text-white",
    },
    CANCELLED: {
      label: "Cancelled",
      icon: <XCircle className="h-3 w-3" />,
      className: "bg-red-500/90 text-white",
    },
    REFUNDED: {
      label: "Refunded",
      icon: <XCircle className="h-3 w-3" />,
      className: "bg-gray-500/90 text-white",
    },
  };

  return configs[status] || configs.PENDING_PAYMENT;
}

function GlassCard({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)] ${className}`} {...props}>
      {children}
    </div>
  );
}

function GlassBadge({ children }: { children: React.ReactNode }) {
  return <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/60 px-3 py-1 text-xs text-neutral-700 backdrop-blur-xl ring-1 ring-black/5">{children}</div>;
}
