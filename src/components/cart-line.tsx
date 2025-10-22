"use client";

import { useCart } from "@/store/cart";
import { calcLineSubtotal } from "@/lib/pricing";
import { formatIDR } from "@/lib/format";
import { useState } from "react";
import { FileText } from "lucide-react";

export default function CartLine({ productId }: { productId: string }) {
  const { lines, setQty, remove, setBrief } = useCart();
  const line = lines.find((l) => l.product.id === productId);
  const [briefText, setBriefText] = useState(line?.brief || "");

  if (!line) return null;

  const { base, addOnTotal, total } = calcLineSubtotal(line.product, line.selectedAddOnIds);

  // Check if this is a custom product that requires brief
  const isCustomProduct = line.product.delivery === "custom";
  const requiresBrief = line.product.requires_brief === true;

  const handleBriefChange = (value: string) => {
    setBriefText(value);
    setBrief(line.product.id, value);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">img</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="font-medium">{line.product.title}</div>
            {isCustomProduct && (
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 border border-purple-200 px-2 py-0.5 text-xs text-purple-700">
                <FileText className="h-3 w-3" />
                Custom Order
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600">{(line.product.stack || []).join(" • ")}</div>
          <div className="text-xs mt-1 text-gray-500">Add-on: {line.selectedAddOnIds.length || 0}</div>
          {isCustomProduct && <div className="text-xs mt-1 text-purple-600">Estimasi pengerjaan: {line.product.custom_eta_days || 7} hari</div>}
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

      {/* Brief input for custom products */}
      {isCustomProduct && (
        <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-3">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-600" />
              <span>
                Brief / Requirement
                {requiresBrief && <span className="text-red-500 ml-1">*</span>}
              </span>
            </div>
          </label>
          <textarea
            value={briefText}
            onChange={(e) => handleBriefChange(e.target.value)}
            placeholder={requiresBrief ? "Wajib: Jelaskan kebutuhan kamu (fitur, desain, dll)..." : "Opsional: Jelaskan kebutuhan kamu..."}
            className="w-full rounded-md border border-purple-300 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            rows={3}
          />
          {requiresBrief && !briefText && <p className="mt-1 text-xs text-red-600">⚠️ Brief wajib diisi untuk produk custom ini</p>}
          <p className="mt-1 text-xs text-gray-600">Brief membantu seller memahami kebutuhan kamu dengan lebih baik</p>
        </div>
      )}
    </div>
  );
}
