"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/store/auth";
import { useRouter } from "next/navigation";
import { adminService, DashboardStats, SellerApplication, User, Store } from "@/lib/services/admin";
import { Users, Package, ShoppingCart, Clock, CheckCircle, XCircle, Mail, Building, CreditCard, Store as StoreIcon, UserCog, FileText } from "lucide-react";

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
      await loadDashboardData(); // Reload stats
      await loadApplications(); // Reload applications
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
      await loadDashboardData(); // Reload stats
      await loadApplications(); // Reload applications
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

      {/* Tabs Navigation */}
      <div className="mb-6 flex gap-2 border-b border-neutral-200">
        <TabButton icon={<Package />} label="Dashboard" active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} />
        <TabButton icon={<FileText />} label="Applications" active={activeTab === "applications"} onClick={() => setActiveTab("applications")} badge={stats?.pendingApplications} />
        <TabButton icon={<Users />} label="Users" active={activeTab === "users"} onClick={() => setActiveTab("users")} />
        <TabButton icon={<StoreIcon />} label="Stores" active={activeTab === "stores"} onClick={() => setActiveTab("stores")} />
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

/* ========== TAB COMPONENTS ========== */

function DashboardTab({ stats, isLoadingStats }: { stats: DashboardStats | null; isLoadingStats: boolean }) {
  return (
    <>
      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users />} label="Total Users" value={stats?.totalUsers || 0} isLoading={isLoadingStats} color="blue" />
        <StatCard icon={<Package />} label="Total Products" value={stats?.totalProducts || 0} isLoading={isLoadingStats} color="green" />
        <StatCard icon={<ShoppingCart />} label="Total Orders" value={stats?.totalOrders || 0} isLoading={isLoadingStats} color="purple" />
        <StatCard icon={<Clock />} label="Pending Apps" value={stats?.pendingApplications || 0} isLoading={isLoadingStats} color="orange" highlight={true} />
      </div>

      {/* Role Distribution */}
      {stats && (
        <GlassCard className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Role Distribution</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <RoleCard label="Buyers" count={stats.roleCounts.buyer} color="bg-blue-100 text-blue-700" />
            <RoleCard label="Sellers" count={stats.roleCounts.seller} color="bg-green-100 text-green-700" />
            <RoleCard label="Admins" count={stats.roleCounts.admin} color="bg-purple-100 text-purple-700" />
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
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Seller Applications</h2>
        <div className="flex gap-2">
          <FilterButton label="All" active={statusFilter === "all"} onClick={() => onStatusFilterChange("all")} />
          <FilterButton label="Pending" active={statusFilter === "pending"} onClick={() => onStatusFilterChange("pending")} color="orange" />
          <FilterButton label="Approved" active={statusFilter === "approved"} onClick={() => onStatusFilterChange("approved")} color="green" />
          <FilterButton label="Rejected" active={statusFilter === "rejected"} onClick={() => onStatusFilterChange("rejected")} color="red" />
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
              {users.map((user) => (
                <tr key={user.id} className="border-b border-neutral-100">
                  <td className="py-3 font-medium">{user.display_name || "Unnamed"}</td>
                  <td className="py-3 text-neutral-600">{user.email}</td>
                  <td className="py-3">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="py-3 text-neutral-600">{user.store_name || "-"}</td>
                  <td className="py-3 text-neutral-600">{new Date(user.created_at).toLocaleDateString("id-ID")}</td>
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
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      )}
    </GlassCard>
  );
}

/* ========== SHARED COMPONENTS ========== */

function TabButton({ icon, label, active, onClick, badge }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void; badge?: number }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${active ? "border-blue-500 text-blue-600" : "border-transparent text-neutral-600 hover:text-neutral-900"}`}>
      {icon}
      {label}
      {badge !== undefined && badge > 0 && <span className="ml-1 rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white">{badge}</span>}
    </button>
  );
}

function FilterButton({ label, active, onClick, color = "blue" }: { label: string; active: boolean; onClick: () => void; color?: string }) {
  const colors = {
    blue: "bg-blue-500 text-white",
    orange: "bg-orange-500 text-white",
    green: "bg-green-500 text-white",
    red: "bg-red-500 text-white",
  };

  return (
    <button onClick={onClick} className={`rounded-lg px-3 py-1 text-sm font-medium transition ${active ? colors[color as keyof typeof colors] : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}>
      {label}
    </button>
  );
}

function StatCard({ icon, label, value, isLoading, color, highlight }: { icon: React.ReactNode; label: string; value: number; isLoading: boolean; color: string; highlight?: boolean }) {
  const colors = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
  };

  const bgColor = colors[color as keyof typeof colors] || "bg-neutral-500";

  return (
    <GlassCard className={`p-5 ${highlight ? "ring-2 ring-orange-500" : ""}`}>
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bgColor} text-white`}>{icon}</div>
        <div>
          <p className="text-sm text-neutral-600">{label}</p>
          <p className="text-2xl font-bold">{isLoading ? "-" : value.toLocaleString()}</p>
        </div>
      </div>
    </GlassCard>
  );
}

function RoleCard({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="text-3xl font-bold">{count}</p>
    </div>
  );
}

function ApplicationCard({ application, onApprove, onReject, isProcessing }: { application: SellerApplication; onApprove: () => void; onReject: () => void; isProcessing: boolean }) {
  return (
    <div className="rounded-xl border border-white/60 bg-white/60 p-5 ring-1 ring-black/5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200">
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
            <InfoRow icon={<Building />} label="Store Name" value={application.store_name} />
            <InfoRow icon={<CreditCard />} label="Bank" value={`${application.payout_bank} - ${application.payout_account}`} />
          </div>

          {application.bio && (
            <div className="mt-3 rounded-lg bg-neutral-50 p-3">
              <p className="text-sm text-neutral-700">{application.bio}</p>
            </div>
          )}

          <p className="mt-2 text-xs text-neutral-500">Applied: {new Date(application.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>

        {application.status === "pending" && (
          <div className="ml-4 flex flex-col gap-2">
            <button onClick={onApprove} disabled={isProcessing} className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-600 disabled:opacity-50">
              <CheckCircle className="h-4 w-4" />
              Approve
            </button>
            <button onClick={onReject} disabled={isProcessing} className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50">
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
    <div className="rounded-xl border border-white/60 bg-white/60 p-5 ring-1 ring-black/5">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <StoreIcon className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold">{store.store_name}</h3>
          <p className="text-sm text-neutral-600">{store.display_name}</p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-neutral-600">
          <Mail className="h-4 w-4" />
          {store.email}
        </div>
        <div className="flex items-center gap-2 text-neutral-600">
          <Package className="h-4 w-4" />
          {store.products_count} Products
        </div>
        {store.bio && <p className="rounded-lg bg-neutral-50 p-2 text-xs text-neutral-700">{store.bio}</p>}
      </div>

      <p className="mt-3 text-xs text-neutral-500">Joined: {new Date(store.created_at).toLocaleDateString("id-ID")}</p>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const colors = {
    buyer: "bg-blue-100 text-blue-700",
    seller: "bg-green-100 text-green-700",
    admin: "bg-purple-100 text-purple-700",
  };

  return <span className={`rounded-full px-2 py-1 text-xs font-medium ${colors[role as keyof typeof colors] || "bg-neutral-100 text-neutral-700"}`}>{role}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    pending: "bg-orange-100 text-orange-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${colors[status as keyof typeof colors] || "bg-neutral-100 text-neutral-700"}`}>{status}</span>;
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-neutral-500">{icon}</span>
      <span className="text-neutral-600">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`relative rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)] ${className}`}>{children}</div>;
}
