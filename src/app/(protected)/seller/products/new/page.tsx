// src/app/(protected)/seller/products/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sellerService } from "@/lib/services/seller";
import { compressImage, getBase64Size } from "@/lib/imageCompression";

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
    // 🔄 DUAL DELIVERY MODE
    delivery: "instant" as "instant" | "custom",
    asset_path: "",
    license: "",
    requires_brief: true,
    custom_eta_days: "7",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validasi - asset_path tidak wajib untuk instant, bisa diupload nanti
    // if (formData.delivery === "instant" && !formData.asset_path) {
    //   setError("Produk instant harus upload file terlebih dahulu");
    //   return;
    // }

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
      // 🔄 DUAL DELIVERY MODE
      delivery: formData.delivery,
      asset_path: formData.delivery === "instant" && formData.asset_path ? formData.asset_path : null,
      license: formData.delivery === "instant" && formData.license ? formData.license : null,
      requires_brief: formData.delivery === "custom" ? formData.requires_brief : false,
      custom_eta_days: formData.delivery === "custom" ? parseInt(formData.custom_eta_days) || 7 : null,
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
      // Validate file size (max 10MB before compression)
      if (file.size > 10 * 1024 * 1024) {
        setError("Ukuran file maksimal 10MB");
        return;
      }

      // Compress image before upload
      setError("Mengompress gambar...");
      compressImage(file, 1200, 0.8)
        .then((compressedBase64) => {
          const sizeKB = getBase64Size(compressedBase64);
          console.log(`📸 Image compressed: ${(file.size / 1024).toFixed(0)}KB → ${sizeKB.toFixed(0)}KB`);

          setImagePreview(compressedBase64);
          setFormData({ ...formData, cover_url: compressedBase64 });
          setError(""); // Clear loading message
        })
        .catch((err) => {
          setError("Gagal mengompress gambar: " + err.message);
        });
    }
  }

  function removeImage() {
    setImagePreview(null);
    setFormData({ ...formData, cover_url: "" });
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (ZIP only)
    if (!file.name.endsWith(".zip")) {
      setError("File harus berupa ZIP");
      return;
    }

    // Validate file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      setError("Ukuran file maksimal 500MB");
      return;
    }

    setError("Uploading file...");

    // TODO: Upload ke Supabase Storage
    // For now, just simulate with a fake path
    const fakeProductId = crypto.randomUUID();
    const assetPath = `products/${fakeProductId}/${file.name}`;

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setFormData({ ...formData, asset_path: assetPath });
    setError(""); // Clear message

    console.log("📦 File uploaded:", file.name, "→", assetPath);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Buat Produk Baru</h1>
      <p className="mt-2 text-neutral-600">Isi detail produk yang ingin Anda jual</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>}

        {/* 🔄 DELIVERY MODE SELECTOR */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-3">Tipe Produk *</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, delivery: "instant" })}
              className={`p-4 rounded-xl border-2 transition ${formData.delivery === "instant" ? "border-blue-500 bg-blue-50" : "border-neutral-200 bg-white hover:border-neutral-300"}`}
            >
              <div className="text-2xl mb-2">⚡</div>
              <div className="font-semibold">Instant Digital</div>
              <div className="text-xs text-neutral-600 mt-1">Buyer langsung download file setelah bayar</div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, delivery: "custom" })}
              className={`p-4 rounded-xl border-2 transition ${formData.delivery === "custom" ? "border-blue-500 bg-blue-50" : "border-neutral-200 bg-white hover:border-neutral-300"}`}
            >
              <div className="text-2xl mb-2">🎨</div>
              <div className="font-semibold">Custom Order</div>
              <div className="text-xs text-neutral-600 mt-1">Dikerjakan sesuai brief dari buyer</div>
            </button>
          </div>
        </div>

        {/* INSTANT DELIVERY FIELDS */}
        {formData.delivery === "instant" && (
          <>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Upload File Produk (ZIP)
                <span className="ml-2 text-xs text-neutral-500">(Opsional - bisa diupload nanti)</span>
              </label>
              {formData.asset_path ? (
                <div className="p-4 rounded-xl border border-green-200 bg-green-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">📦</div>
                    <div>
                      <div className="font-medium text-green-900">File terupload</div>
                      <div className="text-xs text-green-700">{formData.asset_path.split("/").pop()}</div>
                    </div>
                  </div>
                  <button type="button" onClick={() => setFormData({ ...formData, asset_path: "" })} className="text-red-600 hover:text-red-800 text-sm">
                    Hapus
                  </button>
                </div>
              ) : (
                <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 transition hover:bg-neutral-100">
                  <svg className="h-10 w-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="mt-2 text-sm text-neutral-600">Upload file ZIP produk (opsional)</span>
                  <span className="mt-1 text-xs text-neutral-500">Max 500MB - Bisa diupload nanti</span>
                  <input type="file" className="hidden" accept=".zip" onChange={handleFileUpload} />
                </label>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">License Info</label>
              <textarea
                value={formData.license}
                onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                rows={3}
                className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Contoh: MIT License - Unlimited personal & commercial use"
              />
            </div>
          </>
        )}

        {/* CUSTOM ORDER FIELDS */}
        {formData.delivery === "custom" && (
          <>
            <div>
              <label className="block text-sm font-medium text-neutral-700">Estimasi Waktu Pengerjaan (Hari) *</label>
              <input
                type="number"
                value={formData.custom_eta_days}
                onChange={(e) => setFormData({ ...formData, custom_eta_days: e.target.value })}
                required
                min="1"
                max="365"
                className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="7"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="requires_brief"
                checked={formData.requires_brief}
                onChange={(e) => setFormData({ ...formData, requires_brief: e.target.checked })}
                className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-2 focus:ring-blue-100"
              />
              <label htmlFor="requires_brief" className="text-sm text-neutral-700">
                Wajibkan buyer mengisi brief/requirement
              </label>
            </div>
          </>
        )}

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
