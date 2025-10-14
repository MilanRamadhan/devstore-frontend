"use client";

import { useCart } from "@/store/cart";
import { calcLineSubtotal } from "@/lib/pricing";
import { formatIDR } from "@/lib/format";

export default function CartLine({ productId }: { productId: string }) {
  const { lines, setQty, remove } = useCart();
  const line = lines.find((l) => l.product.id === productId);
  if (!line) return null;

  const { base, addOnTotal, total } = calcLineSubtotal(line.product, line.selectedAddOnIds);

  return (
    <div className="flex items-start gap-4 p-4 border rounded-2xl">
      <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">img</div>
      <div className="flex-1">
        <div className="font-medium">{line.product.title}</div>
        <div className="text-sm text-gray-600">{line.product.stack.join(" • ")}</div>
        <div className="text-xs mt-1 text-gray-500">Add-on: {line.selectedAddOnIds.length || 0}</div>
        <div className="mt-2 flex gap-2 items-center">
          <input type="number" className="w-16 border rounded-md px-2 py-1" value={line.quantity} min={1} onChange={(e) => setQty(line.product.id, Number(e.target.value))} />
          <button onClick={() => remove(line.product.id)} className="text-sm text-red-600 hover:underline">
            Hapus
          </button>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm text-gray-600">Base {formatIDR(base)}</div>
        <div className="text-sm text-gray-600">Add-on {formatIDR(addOnTotal)}</div>
        <div className="font-semibold mt-1">{formatIDR(total * line.quantity)}</div>
      </div>
    </div>
  );
}
