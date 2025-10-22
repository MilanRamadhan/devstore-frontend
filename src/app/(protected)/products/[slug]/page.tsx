"use client";

import { getProductBySlug } from "@/lib/mock";
import { notFound, useRouter } from "next/navigation";
import DemoFrame from "@/components/demo-frame";
import AddOnList from "@/components/addon-list";
import PricePanel from "@/components/price-panel";
import { calcLineSubtotal } from "@/lib/pricing";
import { useState, useEffect, use } from "react";
import { useCart } from "@/store/cart";
import { Product } from "@/lib/types";
import { productService } from "@/lib/services/products";
import { Store as StoreIcon } from "lucide-react";

interface SellerInfo {
  id: string;
  display_name: string;
  store_name: string;
  email: string;
}

export default function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [p, setP] = useState<Product | null>(null);
  const [seller, setSeller] = useState<SellerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const add = useCart((state) => state.add);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      const result = await productService.getProductBySlug(slug);

      if (result.ok && result.product) {
        setP(result.product as any);

        if ((result.product as any).seller_id) {
          try {
            const sellerResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/${(result.product as any).seller_id}`);
            if (sellerResponse.ok) {
              const sellerData = await sellerResponse.json();
              if (sellerData.ok && sellerData.data) setSeller(sellerData.data);
            }
          } catch {
            // ignore
          }
        }
      } else {
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

  const handleStoreClick = () => {
    if (seller?.id) router.push(`/store/${seller.id}`);
  };

  const { base, addOnTotal, total } = p ? calcLineSubtotal(p, selected) : { base: 0, addOnTotal: 0, total: 0 };
  const coverUrl = p ? (p as any).cover_url || (p as any).coverUrl || null : null;

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-neutral-600">Memuat produk...</p>
      </div>
    );
  }

  if (!p) return notFound();

  return (
    <div className="relative">
      {/* success toast */}
      {showSuccess && (
        <div className="fixed right-4 top-4 z-50 animate-slide-in">
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

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* title + stack */}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{p.title}</h1>
            <p className="text-neutral-600">{(p.stack || []).join(" • ")}</p>
          </div>

          {/* cover */}
          {coverUrl && (
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/60 bg-white/50 ring-1 ring-black/5 shadow-sm">
              <img src={coverUrl} alt={p.title} className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
            </div>
          )}

          {/* ===== Store Card (pindah ke bawah gambar) ===== */}
          {seller && (
            <GlassCard className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/60 bg-white/70 ring-1 ring-black/5">
                  <StoreIcon className="h-6 w-6 text-neutral-800" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">Toko</div>
                  <div className="text-base font-semibold text-neutral-900">{seller.store_name || seller.display_name}</div>
                  <div className="text-sm text-neutral-600">{seller.display_name}</div>
                </div>
                <button onClick={handleStoreClick} className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm font-medium text-neutral-900 ring-1 ring-black/5 transition hover:bg-white/80">
                  Kunjungi Toko
                </button>
              </div>
            </GlassCard>
          )}

          {/* demo */}
          <DemoFrame url={(p as any).demo_url || (p as any).demoUrl} />

          {/* description */}
          <section>
            <h3 className="mb-2 font-semibold">Deskripsi</h3>
            <p className="text-neutral-700">{p.description}</p>
          </section>

          {/* add-ons */}
          <section>
            <h3 className="mb-2 font-semibold">Add-on</h3>
            <AddOnList addons={(p as any).addOns || (p as any).addons || []} selected={selected} onChange={setSelected} />
          </section>
        </div>

        <div>
          <PricePanel base={base} addOnTotal={addOnTotal} total={total} onAddToCart={handleAddToCart} />
        </div>
      </div>
    </div>
  );
}

/* ===== scoped helper ===== */
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)] ${className}`}>
      <div className="pointer-events-none absolute inset-0 rounded-[16px] ring-1 ring-black/5" />
      {children}
    </div>
  );
}
