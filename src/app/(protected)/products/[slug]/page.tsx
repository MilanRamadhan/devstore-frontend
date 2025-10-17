"use client";

import { getProductBySlug } from "@/lib/mock";
import { notFound } from "next/navigation";
import DemoFrame from "@/components/demo-frame";
import AddOnList from "@/components/addon-list";
import PricePanel from "@/components/price-panel";
import { calcLineSubtotal } from "@/lib/pricing";
import { useState } from "react";
import { useCart } from "@/store/cart";

export default function ProductDetail({ params }: { params: { slug: string } }) {
  const p = getProductBySlug(params.slug);
  if (!p) return notFound();

  const [selected, setSelected] = useState<string[]>([]);
  const { base, addOnTotal, total } = calcLineSubtotal(p, selected);
  const add = useCart((state) => state.add);

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{p.title}</h1>
          <p className="text-gray-600">{p.stack.join(" • ")}</p>
        </div>

        <DemoFrame url={p.demoUrl} />

        <section>
          <h3 className="font-semibold mb-2">Deskripsi</h3>
          <p className="text-gray-700">{p.description}</p>
        </section>

        <section>
          <h3 className="font-semibold mb-2">Add-on</h3>
          <AddOnList addons={p.addOns} selected={selected} onChange={setSelected} />
        </section>
      </div>

      <div>
        <PricePanel base={base} addOnTotal={addOnTotal} total={total} onAddToCart={() => add(p, selected, 1)} />
      </div>
    </div>
  );
}
