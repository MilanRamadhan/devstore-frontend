import Link from "next/link";
import { Product } from "@/lib/types";
import { formatIDR } from "@/lib/format";
import RatingStars from "./rating-stars";

// glass card helper (mini versi)
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/50 bg-white/40 backdrop-blur-xl ring-1 ring-black/5 transition hover:shadow-[0_8px_32px_rgba(0,0,0,0.05)] ${className}`}>{children}</div>;
}

export default function ProductCard({ p }: { p: Product }) {
  return (
    <Link href={`/products/${p.slug}`} className="block transition-transform hover:scale-[1.01]">
      <GlassCard className="p-4 relative overflow-hidden">
        {/* cover (sementara placeholder) */}
        <div className="h-40 rounded-xl mb-3 border border-white/50 bg-white/50 flex items-center justify-center text-gray-400">cover</div>

        <h3 className="font-semibold text-neutral-900">{p.title}</h3>
        <div className="text-sm text-neutral-600">{p.stack.join(" • ")}</div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-neutral-700">Mulai</span>
          <span className="font-semibold text-neutral-900">{formatIDR(p.basePrice)}</span>
        </div>

        <div className="mt-2">
          <RatingStars value={p.ratingAvg ?? 0} count={p.ratingCount ?? 0} />
        </div>

        {/* subtle ring accent */}
        <div className="pointer-events-none absolute inset-0 rounded-[16px] ring-1 ring-black/5" />
      </GlassCard>
    </Link>
  );
}
