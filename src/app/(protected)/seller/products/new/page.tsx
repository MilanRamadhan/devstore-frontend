// src/app/(protected)/seller/products/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sellerService } from "@/lib/services/seller";

export default function NewProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    base_price: "",
    stack: "",
    features: "",
    published: false,
    cover_url: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const payload = {
      title: formData.title,
      description: formData.description,
      base_price: parseFloat(formData.base_price),
      stack: formData.stack
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      features: formData.features
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      published: formData.published,
      cover_url: formData.cover_url || null,
    };

    const result = await sellerService.createProduct(payload);
    setIsLoading(false);

    if (result.ok) {
      router.push("/seller");
    } else {
      setError(result.message || "Gagal membuat produk");
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("File harus berupa gambar");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Ukuran file maksimal 5MB");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData({ ...formData, cover_url: result });
      };
      reader.readAsDataURL(file);
    }
  }

  function removeImage() {
    setImagePreview(null);
    setFormData({ ...formData, cover_url: "" });
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Buat Produk Baru</h1>
      <p className="mt-2 text-neutral-600">Isi detail produk yang ingin Anda jual</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Foto Produk</label>
          {imagePreview ? (
            <div className="relative inline-block">
              <img src={imagePreview} alt="Preview" className="h-48 w-auto rounded-xl border border-neutral-300 object-cover" />
              <button type="button" onClick={removeImage} className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <label className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 transition hover:bg-neutral-100">
              <svg className="h-12 w-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="mt-2 text-sm text-neutral-600">Klik untuk upload foto</span>
              <span className="mt-1 text-xs text-neutral-500">PNG, JPG, WEBP (Max 5MB)</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">Nama Produk *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Contoh: Website Landing Page Premium"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">Deskripsi</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Jelaskan produk Anda..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">Harga Dasar (Rp) *</label>
          <input
            type="number"
            value={formData.base_price}
            onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
            required
            min="0"
            step="1000"
            className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="500000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Tech Stack
            <span className="ml-2 text-xs text-neutral-500">(pisahkan dengan koma)</span>
          </label>
          <input
            type="text"
            value={formData.stack}
            onChange={(e) => setFormData({ ...formData, stack: e.target.value })}
            className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="React, Next.js, TailwindCSS, TypeScript"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Fitur
            <span className="ml-2 text-xs text-neutral-500">(satu fitur per baris)</span>
          </label>
          <textarea
            value={formData.features}
            onChange={(e) => setFormData({ ...formData, features: e.target.value })}
            rows={6}
            className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Responsive design&#10;SEO optimized&#10;Dark mode support"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="published"
            checked={formData.published}
            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
            className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-2 focus:ring-blue-100"
          />
          <label htmlFor="published" className="text-sm text-neutral-700">
            Publikasikan sekarang
          </label>
        </div>

        <div className="flex gap-4">
          <button type="button" onClick={() => router.back()} className="flex-1 rounded-xl border border-neutral-300 bg-white px-6 py-2.5 font-medium transition hover:bg-neutral-50">
            Batal
          </button>
          <button type="submit" disabled={isLoading} className="flex-1 rounded-xl bg-black px-6 py-2.5 font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50">
            {isLoading ? "Menyimpan..." : "Buat Produk"}
          </button>
        </div>
      </form>
    </main>
  );
}
