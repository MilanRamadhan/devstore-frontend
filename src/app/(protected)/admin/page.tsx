"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/store/auth";
import { useRouter } from "next/navigation";
import { adminService, DashboardStats, SellerApplication, User, Store } from "@/lib/services/admin";
import { Users, Package, ShoppingCart, Clock, CheckCircle, XCircle, Mail, Building, CreditCard, Store as StoreIcon, FileText } from "lucide-react";

type TabType = "dashboard" | "applications" | "users" | "stores";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);

  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingStores, setIsLoadingStores] = useState(false);

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [appStatusFilter, setAppStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === "applications") {
      loadApplications();
    } else if (activeTab === "users") {
      loadUsers();
    } else if (activeTab === "stores") {
      loadStores();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, appStatusFilter]);

  async function loadDashboardData() {
    setIsLoadingStats(true);
    const statsResult = await adminService.getDashboardStats();
    if (statsResult.ok && statsResult.data) {
      setStats(statsResult.data as any);
    }
    setIsLoadingStats(false);
  }

  async function loadApplications() {
    setIsLoadingApps(true);
    const status = appStatusFilter === "all" ? undefined : appStatusFilter;
    const appsResult = await adminService.getSellerApplications(status);
    if (appsResult.ok && appsResult.data) {
      setApplications(appsResult.data as any);
    }
    setIsLoadingApps(false);
  }

  async function loadUsers() {
    setIsLoadingUsers(true);
    const result = await adminService.getAllUsers();
    if (result.ok && result.data) {
      setUsers(result.data as any);
    }
    setIsLoadingUsers(false);
  }

  async function loadStores() {
    setIsLoadingStores(true);
    const result = await adminService.getAllStores();
    if (result.ok && result.data) {
      setStores(result.data as any);
    }
    setIsLoadingStores(false);
  }

  async function handleApprove(applicationId: string) {
    if (!confirm("Approve aplikasi ini menjadi seller?")) return;

    setProcessingId(applicationId);
    const result = await adminService.approveApplication(applicationId);

    if (result.ok) {
      alert("✅ Aplikasi berhasil disetujui!");
      await loadDashboardData();
      await loadApplications();
    } else {
      alert("❌ Gagal approve: " + (result.message || "Unknown error"));
    }
    setProcessingId(null);
  }

  async function handleReject(applicationId: string) {
    if (!confirm("Reject aplikasi ini?")) return;

    setProcessingId(applicationId);
    const result = await adminService.rejectApplication(applicationId);

    if (result.ok) {
      alert("✅ Aplikasi berhasil ditolak!");
      await loadDashboardData();
      await loadApplications();
    } else {
      alert("❌ Gagal reject: " + (result.message || "Unknown error"));
    }
    setProcessingId(null);
  }

  if (user?.role !== "admin") {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="mt-2 text-neutral-600">Kelola platform DevStore</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        <TabButton icon={<Package className="h-4 w-4" />} label="Dashboard" active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} />
        <TabButton icon={<FileText className="h-4 w-4" />} label="Applications" active={activeTab === "applications"} onClick={() => setActiveTab("applications")} badge={stats?.pendingApplications} />
        <TabButton icon={<Users className="h-4 w-4" />} label="Users" active={activeTab === "users"} onClick={() => setActiveTab("users")} />
        <TabButton icon={<StoreIcon className="h-4 w-4" />} label="Stores" active={activeTab === "stores"} onClick={() => setActiveTab("stores")} />
      </div>

      {/* Tab Content */}
      {activeTab === "dashboard" && <DashboardTab stats={stats} isLoadingStats={isLoadingStats} />}

      {activeTab === "applications" && (
        <ApplicationsTab applications={applications} isLoading={isLoadingApps} processingId={processingId} onApprove={handleApprove} onReject={handleReject} statusFilter={appStatusFilter} onStatusFilterChange={setAppStatusFilter} />
      )}

      {activeTab === "users" && <UsersTab users={users} isLoading={isLoadingUsers} />}

      {activeTab === "stores" && <StoresTab stores={stores} isLoading={isLoadingStores} />}
    </div>
  );
}

/* ======================= TAB COMPONENTS ======================= */

function DashboardTab({ stats, isLoadingStats }: { stats: DashboardStats | null; isLoadingStats: boolean }) {
  return (
    <>
      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users className="h-5 w-5" />} label="Total Users" value={stats?.totalUsers || 0} isLoading={isLoadingStats} color="blue" />
        <StatCard icon={<Package className="h-5 w-5" />} label="Total Products" value={stats?.totalProducts || 0} isLoading={isLoadingStats} color="green" />
        <StatCard icon={<ShoppingCart className="h-5 w-5" />} label="Total Orders" value={stats?.totalOrders || 0} isLoading={isLoadingStats} color="purple" />
        <StatCard icon={<Clock className="h-5 w-5" />} label="Pending Apps" value={stats?.pendingApplications || 0} isLoading={isLoadingStats} color="orange" highlight />
      </div>

      {/* Role Distribution */}
      {stats && (
        <GlassCard className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Role Distribution</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <RoleCard label="Buyers" count={stats.roleCounts.buyer} color="bg-blue-600/10 text-blue-800" />
            <RoleCard label="Sellers" count={stats.roleCounts.seller} color="bg-emerald-600/10 text-emerald-800" />
            <RoleCard label="Admins" count={stats.roleCounts.admin} color="bg-purple-600/10 text-purple-800" />
          </div>
        </GlassCard>
      )}
    </>
  );
}

function ApplicationsTab({
  applications,
  isLoading,
  processingId,
  onApprove,
  onReject,
  statusFilter,
  onStatusFilterChange,
}: {
  applications: SellerApplication[];
  isLoading: boolean;
  processingId: string | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  statusFilter: "all" | "pending" | "approved" | "rejected";
  onStatusFilterChange: (filter: "all" | "pending" | "approved" | "rejected") => void;
}) {
  return (
    <GlassCard className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Seller Applications</h2>
        <div className="flex flex-wrap gap-2">
          <PillFilter label="All" active={statusFilter === "all"} onClick={() => onStatusFilterChange("all")} />
          <PillFilter label="Pending" active={statusFilter === "pending"} onClick={() => onStatusFilterChange("pending")} tone="amber" />
          <PillFilter label="Approved" active={statusFilter === "approved"} onClick={() => onStatusFilterChange("approved")} tone="emerald" />
          <PillFilter label="Rejected" active={statusFilter === "rejected"} onClick={() => onStatusFilterChange("rejected")} tone="rose" />
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-neutral-600">Loading applications...</div>
      ) : applications.length === 0 ? (
        <div className="py-12 text-center text-neutral-600">
          <FileText className="mx-auto mb-3 h-12 w-12 text-neutral-400" />
          <p>Tidak ada aplikasi {statusFilter !== "all" ? statusFilter : ""}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <ApplicationCard key={app.id} application={app} onApprove={() => onApprove(app.id)} onReject={() => onReject(app.id)} isProcessing={processingId === app.id} />
          ))}
        </div>
      )}
    </GlassCard>
  );
}

function UsersTab({ users, isLoading }: { users: User[]; isLoading: boolean }) {
  return (
    <GlassCard className="overflow-hidden p-6">
      <h2 className="mb-4 text-lg font-semibold">All Users ({users.length})</h2>

      {isLoading ? (
        <div className="py-12 text-center text-neutral-600">Loading users...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-sm text-neutral-600">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Store Name</th>
                <th className="pb-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {users.map((u) => (
                <tr key={u.id} className="border-b border-neutral-100">
                  <td className="py-3 font-medium">{u.display_name || "Unnamed"}</td>
                  <td className="py-3 text-neutral-600">{u.email}</td>
                  <td className="py-3">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="py-3 text-neutral-600">{u.store_name || "-"}</td>
                  <td className="py-3 text-neutral-600">{new Date(u.created_at).toLocaleDateString("id-ID")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </GlassCard>
  );
}

function StoresTab({ stores, isLoading }: { stores: Store[]; isLoading: boolean }) {
  return (
    <GlassCard className="p-6">
      <h2 className="mb-4 text-lg font-semibold">All Stores ({stores.length})</h2>

      {isLoading ? (
        <div className="py-12 text-center text-neutral-600">Loading stores...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stores.map((s) => (
            <StoreCard key={s.id} store={s} />
          ))}
        </div>
      )}
    </GlassCard>
  );
}

/* ======================= SHARED UI ======================= */

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={[
        "relative rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl ring-1 ring-black/5",
        "shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition",
        "hover:bg-white/80 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]",
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[16px] ring-1 ring-black/5" />
      {children}
    </div>
  );
}

function TabButton({ icon, label, active, onClick, badge }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void; badge?: number }) {
  return (
    <button
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 text-sm font-medium transition",
        "focus:outline-none focus:ring-1 focus:ring-black/10",
        active ? "bg-neutral-800/90 text-white hover:bg-neutral-900/90" : "border border-white/60 bg-white/70 text-neutral-800 ring-1 ring-black/5 hover:bg-white/85 hover:shadow-[0_6px_20px_rgba(0,0,0,0.04)]",
      ].join(" ")}
    >
      {icon}
      {label}
      {badge !== undefined && badge > 0 && <span className="ml-1 rounded-full bg-amber-500/90 px-2 py-0.5 text-[11px] font-medium text-white">{badge}</span>}
    </button>
  );
}

function PillFilter({ label, active, onClick, tone = "neutral" }: { label: string; active: boolean; onClick: () => void; tone?: "neutral" | "amber" | "emerald" | "rose" }) {
  const toneMap: Record<string, string> = {
    neutral: "border border-white/60 bg-white/70 text-neutral-800 ring-1 ring-black/5 hover:bg-white/82",
    amber: "border border-amber-200 bg-amber-50 text-amber-800 ring-1 ring-black/5 hover:bg-amber-100",
    emerald: "border border-emerald-200 bg-emerald-50 text-emerald-800 ring-1 ring-black/5 hover:bg-emerald-100",
    rose: "border border-rose-200 bg-rose-50 text-rose-800 ring-1 ring-black/5 hover:bg-rose-100",
  };
  return (
    <button
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 rounded-2xl px-3 py-1.5 text-sm font-medium transition",
        "focus:outline-none focus:ring-1 focus:ring-black/10",
        active ? "bg-neutral-800/90 text-white hover:bg-neutral-900/90" : toneMap[tone],
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function StatCard({ icon, label, value, isLoading, color, highlight }: { icon: React.ReactNode; label: string; value: number; isLoading: boolean; color: "blue" | "green" | "purple" | "orange"; highlight?: boolean }) {
  const toneMap: Record<string, { iconWrap: string; iconTone: string }> = {
    blue: { iconWrap: "bg-blue-600/10", iconTone: "text-blue-700" },
    green: { iconWrap: "bg-emerald-600/10", iconTone: "text-emerald-700" },
    purple: { iconWrap: "bg-purple-600/10", iconTone: "text-purple-700" },
    orange: { iconWrap: "bg-amber-600/10", iconTone: "text-amber-700" },
  };
  const tone = toneMap[color];

  return (
    <GlassCard className={["p-5", highlight ? "ring-2 ring-amber-200" : ""].join(" ")}>
      <div className="flex items-center gap-4">
        <div className={["flex h-12 w-12 items-center justify-center rounded-xl", tone.iconWrap, tone.iconTone].join(" ")}>{icon}</div>
        <div>
          <p className="text-sm text-neutral-600">{label}</p>
          <p className="text-2xl font-bold">{isLoading ? "—" : value.toLocaleString()}</p>
        </div>
      </div>
    </GlassCard>
  );
}

function RoleCard({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className={["rounded-xl p-4", color].join(" ")}>
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="text-3xl font-bold">{count}</p>
    </div>
  );
}

function ApplicationCard({ application, onApprove, onReject, isProcessing }: { application: SellerApplication; onApprove: () => void; onReject: () => void; isProcessing: boolean }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/60 p-5 ring-1 ring-black/5 transition hover:bg-white/80 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200/70">
              <Users className="h-5 w-5 text-neutral-700" />
            </div>
            <div>
              <h3 className="font-semibold">{application.profiles.display_name || "Unnamed User"}</h3>
              <p className="flex items-center gap-1 text-sm text-neutral-600">
                <Mail className="h-3.5 w-3.5" />
                {application.profiles.email}
              </p>
            </div>
            <StatusBadge status={application.status} />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <InfoRow icon={<Building className="h-4 w-4" />} label="Store Name" value={application.store_name} />
            <InfoRow icon={<CreditCard className="h-4 w-4" />} label="Bank" value={`${application.payout_bank} - ${application.payout_account}`} />
          </div>

          {application.bio && <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">{application.bio}</div>}

          <p className="mt-2 text-xs text-neutral-500">
            Applied:{" "}
            {new Date(application.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {application.status === "pending" && (
          <div className="ml-2 flex flex-col gap-2">
            <button
              onClick={onApprove}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 rounded-2xl bg-neutral-800/90 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-900/90 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-black/10"
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </button>
            <button
              onClick={onReject}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-4 py-2 text-sm font-medium text-rose-700 ring-1 ring-black/5 transition hover:bg-white/85 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-black/10"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StoreCard({ store }: { store: Store }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/60 p-5 ring-1 ring-black/5 transition hover:bg-white/80 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600/10">
          <StoreIcon className="h-6 w-6 text-emerald-700" />
        </div>
        <div>
          <h3 className="font-semibold">{store.store_name}</h3>
          <p className="text-sm text-neutral-600">{store.display_name}</p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-neutral-700">
          <Mail className="h-4 w-4" />
          {store.email}
        </div>
        <div className="flex items-center gap-2 text-neutral-700">
          <Package className="h-4 w-4" />
          {store.products_count} Products
        </div>
        {store.bio && <p className="rounded-lg border border-neutral-200 bg-neutral-50 p-2 text-xs text-neutral-700">{store.bio}</p>}
      </div>

      <p className="mt-3 text-xs text-neutral-500">Joined: {new Date(store.created_at).toLocaleDateString("id-ID")}</p>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const cls: Record<string, string> = {
    buyer: "bg-blue-600/10 text-blue-800",
    seller: "bg-emerald-600/10 text-emerald-800",
    admin: "bg-purple-600/10 text-purple-800",
  };
  return <span className={["rounded-full px-2.5 py-1 text-xs font-medium", cls[role] || "bg-neutral-600/10 text-neutral-800"].join(" ")}>{role}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    pending: "bg-amber-600/10 text-amber-800",
    approved: "bg-emerald-600/10 text-emerald-800",
    rejected: "bg-rose-600/10 text-rose-800",
  };
  return <span className={["rounded-full px-3 py-1 text-xs font-medium", cls[status] || "bg-neutral-600/10 text-neutral-800"].join(" ")}>{status}</span>;
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-neutral-600">{icon}</span>
      <span className="text-neutral-600">{label}:</span>
      <span className="font-medium text-neutral-900">{value}</span>
    </div>
  );
}
