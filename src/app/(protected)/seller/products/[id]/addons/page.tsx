// src/app/(protected)/seller/products/[id]/addons/page.tsx
"use client";

import * as React from "react";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { sellerService, Addon } from "@/lib/services/seller";
import { formatIDR } from "@/lib/format";

export default function ManageAddonsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: productId } = use(params);
  const router = useRouter();

  const [addons, setAddons] = useState<Addon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
  });

  useEffect(() => {
    loadAddons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function loadAddons() {
    setIsLoading(true);
    const result = await sellerService.getMyAddons(productId);
    if (result.ok && result.addons) {
      setAddons(result.addons);
    } else {
      setError(result.message || "Gagal memuat addons");
    }
    setIsLoading(false);
  }

  function resetForm() {
    setFormData({ name: "", price: "", description: "" });
    setEditingId(null);
    setShowForm(false);
  }

  function handleEdit(addon: Addon) {
    setFormData({
      name: addon.name,
      price: String(addon.price),
      description: addon.description || "",
    });
    setEditingId(addon.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const payload = {
      name: formData.name,
      price: parseFloat(formData.price),
      description: formData.description,
    };

    const result = editingId ? await sellerService.updateAddon(productId, editingId, payload) : await sellerService.createAddon(productId, payload);

    if (result.ok) {
      resetForm();
      loadAddons();
    } else {
      setError(result.message || "Gagal menyimpan addon");
    }
  }

  async function handleDelete(addonId: string) {
    if (!confirm("Yakin ingin menghapus addon ini?")) return;
    const result = await sellerService.deleteAddon(productId, addonId);
    if (result.ok) loadAddons();
    else alert(result.message);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <GlassCard className="p-8 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-neutral-300 border-t-black" />
          <p className="mt-4 text-neutral-600">Memuat addons...</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kelola Add-ons</h1>
          <p className="mt-1 text-neutral-600">Tambah atau edit add-on untuk produk ini</p>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center justify-center rounded-2xl border border-white/60 bg-white/70 px-4 py-2 text-sm text-neutral-900 ring-1 ring-black/5 transition hover:bg-white/80 hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-1 focus:ring-black/10"
        >
          Kembali
        </button>
      </div>

      {error && (
        <GlassCard className="mb-6 border-red-200 bg-red-50/80 p-4 ring-red-100" role="alert" aria-live="assertive">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </GlassCard>
      )}

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 inline-flex items-center justify-center rounded-2xl bg-black/90 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-black focus:outline-none focus:ring-1 focus:ring-black/10"
        >
          + Tambah Add-on Baru
        </button>
      ) : (
        <GlassCard className="mb-8 p-6 hover:bg-white/70 hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
          <form onSubmit={handleSubmit}>
            <h3 className="mb-4 text-lg font-semibold">{editingId ? "Edit Add-on" : "Add-on Baru"}</h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="addon-name" className="mb-1 block text-sm font-medium text-neutral-700">
                  Nama Add-on *
                </label>
                <input
                  id="addon-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Contoh: Extra Page"
                  className="w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm outline-none ring-1 ring-black/5 placeholder:text-neutral-400 transition focus:bg-white/90 focus:ring-1 focus:ring-black/10"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="addon-price" className="mb-1 block text-sm font-medium text-neutral-700">
                    Harga (Rp) *
                  </label>
                  <input
                    id="addon-price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    min="0"
                    step="1000"
                    className="w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm outline-none ring-1 ring-black/5 placeholder:text-neutral-400 transition focus:bg-white/90 focus:ring-1 focus:ring-black/10"
                  />
                  <p className="mt-1 text-xs text-neutral-500">Preview: {formatIDR(parseFloat(formData.price) || 0)}</p>
                </div>
              </div>

              <div>
                <label htmlFor="addon-desc" className="mb-1 block text-sm font-medium text-neutral-700">
                  Deskripsi
                </label>
                <textarea
                  id="addon-desc"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Optional: Jelaskan detail fitur tambahan ini..."
                  className="w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm outline-none ring-1 ring-black/5 placeholder:text-neutral-400 transition focus:bg-white/90 focus:ring-1 focus:ring-black/10"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 rounded-2xl border border-white/60 bg-white/70 px-4 py-2 text-sm text-neutral-900 ring-1 ring-black/5 transition hover:bg-white/80 hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-1 focus:ring-black/10"
              >
                Batal
              </button>
              <button type="submit" className="flex-1 rounded-2xl bg-black/90 px-4 py-2 text-sm font-medium text-white transition hover:bg-black focus:outline-none focus:ring-1 focus:ring-black/10">
                {editingId ? "Simpan Perubahan" : "Tambah Add-on"}
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      <div className="space-y-4">
        {addons.length === 0 ? (
          <GlassCard className="p-12 text-center hover:bg-white/70 hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
            <p className="text-neutral-700">Belum ada add-on.</p>
          </GlassCard>
        ) : (
          addons.map((addon) => (
            <GlassCard key={addon.id} className="p-6 transition hover:bg-white/70 hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold">{addon.name}</h4>
                  {addon.description && <p className="mt-1 text-sm text-neutral-600">{addon.description}</p>}
                  <div className="mt-3 flex items-center gap-4 text-sm text-neutral-700">
                    <span className="font-semibold">{formatIDR(addon.price)}</span>
                  </div>
                </div>

                <div className="ml-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(addon)}
                    className="rounded-2xl border border-white/60 bg-white/70 px-3 py-1.5 text-sm text-neutral-900 ring-1 ring-black/5 transition hover:bg-white/80 hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-1 focus:ring-black/10"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(addon.id)}
                    className="rounded-2xl border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100 hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-1 focus:ring-black/10"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </main>
  );
}

/* === Fixed GlassCard dengan hover bawaan + role-friendly === */
type GlassCardProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children: React.ReactNode;
};

function GlassCard({ children, className = "", ...rest }: GlassCardProps) {
  const base = "relative rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl ring-1 ring-black/5 transition hover:bg-white/70 hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] shadow-[0_2px_8px_rgba(0,0,0,0.03)]";
  return (
    <div className={`${base} ${className}`} {...rest}>
      <div className="pointer-events-none absolute inset-0 rounded-[16px] ring-1 ring-black/5" />
      {children}
    </div>
  );
}
