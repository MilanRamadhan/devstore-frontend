// src/app/(protected)/seller/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth";
import { sellerService } from "@/lib/services/seller";
import { Product } from "@/lib/types";
import Link from "next/link";

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && user.role !== "seller") {
      router.push("/");
      return;
    }

    loadProducts();
  }, [user, router]);

  async function loadProducts() {
    setIsLoading(true);
    const result = await sellerService.getMyProducts();

    if (result.ok && result.products) {
      setProducts(result.products);
    } else {
      setError(result.message || "Gagal memuat produk");
    }
    setIsLoading(false);
  }

  async function handlePublishToggle(productId: string, currentStatus: boolean) {
    const result = await sellerService.publishProduct(productId, !currentStatus);

    if (result.ok) {
      loadProducts(); // Refresh
    } else {
      alert(result.message);
    }
  }

  if (!user || user.role !== "seller") {
    return (
      <div className="py-20 text-center">
        <p className="text-neutral-600">Anda tidak memiliki akses ke halaman ini.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-black"></div>
        <p className="mt-4 text-neutral-600">Memuat produk...</p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Seller Dashboard</h1>
          <p className="mt-1 text-neutral-600">Kelola produk dan add-on Anda</p>
        </div>
        <Link href="/seller/products/new" className="rounded-2xl bg-black px-6 py-2.5 text-white transition hover:bg-neutral-800">
          + Produk Baru
        </Link>
      </div>

      {error && <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>}

      {products.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white/60 p-12 text-center">
          <p className="text-lg text-neutral-600">Belum ada produk.</p>
          <p className="mt-2 text-sm text-neutral-500">Mulai dengan membuat produk pertama Anda!</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product: any) => (
            <div key={product.id} className="rounded-2xl border border-neutral-200 bg-white/60 p-6 backdrop-blur transition hover:shadow-lg">
              {/* Product Image */}
              {product.cover_url && (
                <div className="mb-4 h-32 w-full overflow-hidden rounded-xl bg-neutral-100">
                  <img src={product.cover_url} alt={product.title} className="h-full w-full object-cover" />
                </div>
              )}

              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{product.title}</h3>
                  <p className="mt-1 text-sm text-neutral-600 line-clamp-2">{product.description || "Tanpa deskripsi"}</p>
                </div>
                <span className={`ml-2 rounded-full px-3 py-1 text-xs font-medium ${product.published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{product.published ? "Published" : "Draft"}</span>
              </div>

              <div className="mb-4 text-xl font-bold text-blue-600">Rp {(product.base_price || 0).toLocaleString("id-ID")}</div>

              {product.stack && product.stack.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {product.stack.slice(0, 3).map((tech: string) => (
                    <span key={tech} className="rounded-lg bg-neutral-100 px-2 py-1 text-xs text-neutral-700">
                      {tech}
                    </span>
                  ))}
                  {product.stack.length > 3 && <span className="rounded-lg bg-neutral-100 px-2 py-1 text-xs text-neutral-700">+{product.stack.length - 3}</span>}
                </div>
              )}

              <div className="flex gap-2">
                <Link href={`/seller/products/${product.id}/edit`} className="flex-1 rounded-xl border border-neutral-300 bg-white px-4 py-2 text-center text-sm font-medium transition hover:bg-neutral-50">
                  Edit
                </Link>
                <button onClick={() => handlePublishToggle(product.id, product.published)} className="flex-1 rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium transition hover:bg-neutral-50">
                  {product.published ? "Unpublish" : "Publish"}
                </button>
              </div>

              <Link href={`/seller/products/${product.id}/addons`} className="mt-2 block rounded-xl bg-blue-50 px-4 py-2 text-center text-sm font-medium text-blue-700 transition hover:bg-blue-100">
                Kelola Add-ons
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
