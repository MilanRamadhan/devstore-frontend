import { formatIDR } from "@/lib/format";
import { ShoppingCart, BadgePlus } from "lucide-react";

export default function PricePanel({ base, addOnTotal, total, onAddToCart, disabled }: { base: number; addOnTotal: number; total: number; disabled?: boolean; onAddToCart: () => void }) {
  return (
    <aside className="sticky top-24">
      <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-5 backdrop-blur-xl ring-1 ring-black/5 shadow-[0_8px_32px_rgba(0,0,0,0.04)] transition">
        {/* aksen ring lembut */}
        <div className="pointer-events-none absolute inset-0 rounded-[16px] ring-1 ring-black/5" />

        <div className="space-y-3">
          <Row label="Harga dasar" value={formatIDR(Number(base) || 0)} />
          <Row
            label={
              <span className="inline-flex items-center gap-1.5">
                <BadgePlus className="h-4 w-4 text-neutral-700" />
                Add-on
              </span>
            }
            value={formatIDR(Number(addOnTotal) || 0)}
          />

          <div className="my-3 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />

          <div className="flex items-baseline justify-between">
            <span className="font-semibold text-neutral-800">Total</span>
            <span className="text-lg font-bold text-neutral-900">{formatIDR(Number(total) || 0)}</span>
          </div>

          <button
            onClick={onAddToCart}
            disabled={disabled}
            className="group mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-white transition-all hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingCart className="h-4 w-4 transition-transform group-hover:scale-110" />
            Tambah ke Cart
          </button>

          <p className="pt-2 text-center text-[11px] text-neutral-600/80">Total belum termasuk pajak/fee tambahan (jika ada)</p>
        </div>
      </div>
    </aside>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-neutral-700">{label}</span>
      <span className="font-medium text-neutral-900">{value}</span>
    </div>
  );
}
