"use client";

import { getProductBySlug } from "@/lib/mock";
import { notFound } from "next/navigation";
import DemoFrame from "@/components/demo-frame";
import AddOnList from "@/components/addon-list";
import PricePanel from "@/components/price-panel";
import { calcLineSubtotal } from "@/lib/pricing";
import { useState, useEffect, use } from "react";
import { useCart } from "@/store/cart";
import { Product } from "@/lib/types";
import { productService } from "@/lib/services/products";

export default function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [p, setP] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const add = useCart((state) => state.add);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      const result = await productService.getProductBySlug(slug);

      if (result.ok && result.product) {
        setP(result.product);
      } else {
        // Fallback to mock data
        const mockProduct = getProductBySlug(slug);
        setP(mockProduct || null);
      }
      setIsLoading(false);
    };

    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!p) return;
    add(p, selected, 1);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Calculate prices (always call, even if loading/null)
  const { base, addOnTotal, total } = p ? calcLineSubtotal(p, selected) : { base: 0, addOnTotal: 0, total: 0 };
  const coverUrl = p ? (p as any).cover_url || p.cover_url : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-neutral-600">Memuat produk...</p>
      </div>
    );
  }

  if (!p) return notFound();

  return (
    <div className="relative">
      {/* Success notification */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4 shadow-lg backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-green-900">Ditambahkan ke cart!</p>
                <p className="text-sm text-green-700">Produk berhasil ditambahkan</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-2xl font-semibold">{p.title}</h1>
            <p className="text-gray-600">{(p.stack || []).join(" • ")}</p>
          </div>

          {/* Product Image */}
          {coverUrl && (
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/60 bg-white/50 ring-1 ring-black/5 shadow-sm">
              <img src={coverUrl} alt={p.title} className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]" />
              {/* Lapisan gradasi halus biar teks di atas (kalau nanti ada) tetap terbaca */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
            </div>
          )}

          <DemoFrame url={p.demoUrl} />

          <section>
            <h3 className="font-semibold mb-2">Deskripsi</h3>
            <p className="text-gray-700">{p.description}</p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">Add-on</h3>
            <AddOnList addons={p.addOns || []} selected={selected} onChange={setSelected} />
          </section>
        </div>

        <div>
          <PricePanel base={base} addOnTotal={addOnTotal} total={total} onAddToCart={handleAddToCart} />
        </div>
      </div>
    </div>
  );
}
