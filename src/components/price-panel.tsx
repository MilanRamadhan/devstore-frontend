import { formatIDR } from "@/lib/format";
import { ShoppingCart, BadgePlus } from "lucide-react";

export default function PricePanel({ base, addOnTotal, total, onAddToCart, disabled }: { base: number; addOnTotal: number; total: number; disabled?: boolean; onAddToCart: () => void }) {
  return (
    <aside className="sticky top-24">
      <div className="relative rounded-2xl border border-white/60 bg-white/60 p-4 md:p-5 backdrop-blur-xl ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
        {/* ring halus di tepi sebagai aksen */}
        <div className="pointer-events-none absolute inset-0 rounded-[16px] ring-1 ring-black/5" />

        <div className="space-y-2">
          <Row label="Harga dasar" value={formatIDR(base)} />
          <Row
            label={
              <span className="inline-flex items-center gap-1.5">
                <BadgePlus className="h-4 w-4 text-neutral-700" />
                Add-on
              </span>
            }
            value={formatIDR(addOnTotal)}
          />

          <div className="my-2 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />

          <div className="flex items-baseline justify-between">
            <span className="font-semibold">Total</span>
            <span className="text-lg font-semibold">{formatIDR(total)}</span>
          </div>

          <button
            onClick={onAddToCart}
            disabled={disabled}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-white transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingCart className="h-4 w-4" />
            Tambah ke Cart
          </button>

          {/* foot hint kecil */}
          <p className="pt-1 text-center text-[11px] text-neutral-600">Total belum termasuk pajak/fee tambahan (jika ada).</p>
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
