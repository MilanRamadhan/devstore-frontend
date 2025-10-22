"use client";

import { AddOn } from "@/lib/types";
import { formatIDR } from "@/lib/format";

type Props = {
  addons: AddOn[];
  selected: string[];
  onChange: (ids: string[]) => void;
};

export default function AddOnList({ addons, selected, onChange }: Props) {
  const toggle = (id: string) => {
    const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
    onChange(next);
  };

  // Handle empty or undefined addons
  if (!addons || addons.length === 0) {
    return <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">Tidak ada add-on tersedia untuk produk ini.</div>;
  }

  return (
    <div className="space-y-2">
      {addons.map((a) => (
        <label key={a.id} className="flex items-start gap-3 p-3 border rounded-xl hover:bg-gray-50 cursor-pointer">
          <input type="checkbox" checked={selected.includes(a.id)} onChange={() => toggle(a.id)} className="mt-1" />
          <div className="flex-1">
            <div className="font-medium">{a.name}</div>
            {a.description && <div className="text-sm text-gray-600">{a.description}</div>}
            <div className="text-sm mt-1">{formatIDR(a.price)}</div>
          </div>
        </label>
      ))}
    </div>
  );
}
