"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { orderService, Order } from "@/lib/services/orders";
import { formatIDR } from "@/lib/format";
import { Package, Clock, CheckCircle2, XCircle, AlertCircle, ChevronLeft, Download, FileText } from "lucide-react";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [approvingMilestone, setApprovingMilestone] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      const result = await orderService.getOrderDetail(id);

      if (result.ok && result.order) {
        setOrder(result.order);
      } else {
        setError(result.message || "Order tidak ditemukan");
      }

      setIsLoading(false);
    };

    fetchOrder();
  }, [id]);

  const handleApproveMilestone = async (milestoneId: string) => {
    setApprovingMilestone(milestoneId);
    const result = await orderService.approveMilestone({ milestone_id: milestoneId });

    if (result.ok) {
      // Refresh order data
      const refreshResult = await orderService.getOrderDetail(id);
      if (refreshResult.ok && refreshResult.order) {
        setOrder(refreshResult.order);
      }
    } else {
      alert(result.message || "Gagal approve milestone");
    }

    setApprovingMilestone(null);
  };

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
              {new Date(order.createdAt).toLocaleDateString("id-ID", {
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
              {order.lines?.map((line) => (
                <div key={line.productId} className="flex items-start justify-between p-3 rounded-xl border border-white/60 bg-white/60 ring-1 ring-black/5">
                  <div className="flex-1">
                    <p className="font-medium">{line.productTitle}</p>
                    <p className="text-sm text-neutral-600">Quantity: {line.quantity}</p>
                    {line.addOns && line.addOns.length > 0 && <p className="text-xs text-neutral-500 mt-1">{line.addOns.length} addon(s)</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatIDR(line.price * line.quantity)}</p>
                    <p className="text-xs text-neutral-600">{formatIDR(line.price)}/unit</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Milestones */}
          {order.milestones && order.milestones.length > 0 && (
            <GlassCard className="p-5">
              <h2 className="text-lg font-semibold mb-4">Milestones</h2>
              <div className="space-y-3">
                {order.milestones.map((milestone, index) => (
                  <div key={milestone.id} className="p-4 rounded-xl border border-white/60 bg-white/60 ring-1 ring-black/5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold">Milestone {index + 1}</span>
                          <MilestoneStatusBadge status={milestone.status} />
                        </div>
                        <p className="font-medium">{milestone.title}</p>
                      </div>
                      <p className="text-lg font-semibold">{formatIDR(milestone.amount)}</p>
                    </div>

                    {milestone.status === "pending" && (
                      <button
                        onClick={() => handleApproveMilestone(milestone.id)}
                        disabled={approvingMilestone === milestone.id}
                        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-900 disabled:opacity-50"
                      >
                        {approvingMilestone === milestone.id ? "Memproses..." : "Approve Milestone"}
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>

        {/* Right: Summary */}
        <div className="space-y-6">
          <GlassCard className="p-5">
            <h3 className="text-lg font-semibold mb-4">Ringkasan</h3>
            <div className="space-y-2">
              <Row label="Subtotal" value={formatIDR(order.total)} />
              <Row label="Platform Fee" value={formatIDR(order.platformFee)} />
              <Row label="PPN" value={formatIDR(order.tax)} />
              <div className="my-3 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
              <div className="flex items-baseline justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-semibold">{formatIDR(order.grandTotal)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/60">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-700">Estimasi</span>
                <span className="font-medium flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {order.etaDays || 0} hari
                </span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="font-semibold mb-3">Aksi</h3>
            <div className="space-y-2">
              <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/60 bg-white/60 px-4 py-2 text-sm font-medium text-neutral-800 backdrop-blur-xl ring-1 ring-black/5 transition hover:bg-white/70">
                <Download className="h-4 w-4" />
                Download Files
              </button>
              <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/60 bg-white/60 px-4 py-2 text-sm font-medium text-neutral-800 backdrop-blur-xl ring-1 ring-black/5 transition hover:bg-white/70">
                <FileText className="h-4 w-4" />
                Download Invoice
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function MilestoneStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-yellow-500/90 text-white" },
    approved: { label: "Approved", className: "bg-green-500/90 text-white" },
    completed: { label: "Completed", className: "bg-blue-500/90 text-white" },
  };

  const config = configs[status] || configs.pending;

  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${config.className}`}>{config.label}</span>;
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
    pending: {
      label: "Pending",
      icon: <Clock className="h-3 w-3" />,
      className: "bg-yellow-500/90 text-white",
    },
    in_progress: {
      label: "In Progress",
      icon: <AlertCircle className="h-3 w-3" />,
      className: "bg-blue-500/90 text-white",
    },
    completed: {
      label: "Completed",
      icon: <CheckCircle2 className="h-3 w-3" />,
      className: "bg-green-500/90 text-white",
    },
    cancelled: {
      label: "Cancelled",
      icon: <XCircle className="h-3 w-3" />,
      className: "bg-red-500/90 text-white",
    },
  };

  return configs[status] || configs.pending;
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
