// src/app/(protected)/seller/products/[id]/addons/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { sellerService, Addon } from "@/lib/services/seller";

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
    eta_days: "7",
    sla_days: "14",
  });

  useEffect(() => {
    loadAddons();
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
    setFormData({
      name: "",
      price: "",
      description: "",
      eta_days: "7",
      sla_days: "14",
    });
    setEditingId(null);
    setShowForm(false);
  }

  function handleEdit(addon: Addon) {
    setFormData({
      name: addon.name,
      price: String(addon.price),
      description: addon.description || "",
      eta_days: String(addon.eta_days),
      sla_days: String(addon.sla_days || 14),
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
      eta_days: parseInt(formData.eta_days),
      sla_days: parseInt(formData.sla_days),
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

    if (result.ok) {
      loadAddons();
    } else {
      alert(result.message);
    }
  }

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-black"></div>
        <p className="mt-4 text-neutral-600">Memuat addons...</p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kelola Add-ons</h1>
          <p className="mt-1 text-neutral-600">Tambah atau edit add-on untuk produk ini</p>
        </div>
        <button onClick={() => router.back()} className="rounded-xl border border-neutral-300 px-4 py-2 transition hover:bg-neutral-50">
          ← Kembali
        </button>
      </div>

      {error && <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>}

      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="mb-6 rounded-xl bg-blue-600 px-6 py-2.5 font-medium text-white transition hover:bg-blue-700">
          + Tambah Add-on Baru
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-neutral-200 bg-white/60 p-6 backdrop-blur">
          <h3 className="mb-4 text-lg font-semibold">{editingId ? "Edit Add-on" : "Add-on Baru"}</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700">Nama Add-on *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2 outline-none focus:border-blue-500"
                placeholder="Contoh: Extra Page"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-700">Harga (Rp) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  min="0"
                  step="1000"
                  className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700">ETA (hari)</label>
                <input
                  type="number"
                  value={formData.eta_days}
                  onChange={(e) => setFormData({ ...formData, eta_days: e.target.value })}
                  min="0"
                  className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">Deskripsi</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button type="button" onClick={resetForm} className="flex-1 rounded-xl border border-neutral-300 px-4 py-2 transition hover:bg-neutral-50">
              Batal
            </button>
            <button type="submit" className="flex-1 rounded-xl bg-black px-4 py-2 text-white transition hover:bg-neutral-800">
              {editingId ? "Simpan Perubahan" : "Tambah Add-on"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {addons.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white/60 p-12 text-center">
            <p className="text-neutral-600">Belum ada add-on.</p>
          </div>
        ) : (
          addons.map((addon) => (
            <div key={addon.id} className="rounded-2xl border border-neutral-200 bg-white/60 p-6 backdrop-blur">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold">{addon.name}</h4>
                  {addon.description && <p className="mt-1 text-sm text-neutral-600">{addon.description}</p>}
                  <div className="mt-3 flex items-center gap-4 text-sm text-neutral-600">
                    <span className="font-semibold text-blue-600">Rp {addon.price.toLocaleString("id-ID")}</span>
                    <span>ETA: {addon.eta_days} hari</span>
                  </div>
                </div>

                <div className="ml-4 flex gap-2">
                  <button onClick={() => handleEdit(addon)} className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm transition hover:bg-neutral-50">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(addon.id)} className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-sm text-red-700 transition hover:bg-red-100">
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
