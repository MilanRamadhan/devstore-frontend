"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/product-card";
import { PRODUCTS } from "@/lib/mock";
import { Search, X, Sparkles, ChevronDown } from "lucide-react";

type SortKey = "relevance" | "price-asc" | "price-desc" | "rating-desc";

export default function ProductsPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const [q, setQ] = useState(sp.get("q") ?? "");
  const [stacks, setStacks] = useState<string[]>(sp.get("stack") ? sp.get("stack")!.split(",") : []);
  const [sort, setSort] = useState<SortKey>((sp.get("sort") as SortKey) ?? "relevance");

  const topStacks = useMemo(() => {
    const freq = new Map<string, number>();
    for (const p of PRODUCTS) {
      for (const s of p.stack ?? []) {
        freq.set(s, (freq.get(s) ?? 0) + 1);
      }
    }
    return [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name]) => name);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (stacks.length) params.set("stack", stacks.join(","));
    if (sort !== "relevance") params.set("sort", sort);
    const qs = params.toString();
    router.replace(qs ? `/products?${qs}` : `/products`);
  }, [q, stacks, sort, router]);

  const filtered = useMemo(() => {
    let rows = PRODUCTS.slice();

    if (q.trim()) {
      const term = q.toLowerCase();
      rows = rows.filter((p) => [p.title, p.description, (p.stack ?? []).join(" ")].join(" ").toLowerCase().includes(term));
    }

    if (stacks.length) {
      rows = rows.filter((p) => stacks.every((s) => p.stack?.includes(s)));
    }

    switch (sort) {
      case "price-asc":
        rows.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case "price-desc":
        rows.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case "rating-desc":
        rows.sort((a, b) => (b.ratingAvg ?? 0) - (a.ratingAvg ?? 0));
        break;
      default:
        break;
    }
    return rows;
  }, [q, stacks, sort]);

  const total = filtered.length;
  const active = q || stacks.length;

  const toggleStack = (s: string) => setStacks((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  const clearAll = () => {
    setQ("");
    setStacks([]);
    setSort("relevance");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-2xl font-semibold tracking-tight">Katalog</h2>
        <div className="flex items-center gap-2">
          <GlassBadge>
            <Sparkles className="h-3.5 w-3.5" />
            <span>{total} hasil</span>
          </GlassBadge>
          {active ? (
            <button onClick={clearAll} className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:underline">
              <X className="h-4 w-4" /> Reset
            </button>
          ) : null}
        </div>
      </div>

      {/* Filter bar */}
      <GlassCard className="w-full p-3 md:p-4">
        <div className="grid gap-3 md:grid-cols-3">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 rounded-xl border border-white/60 bg-white/70 px-3 py-2 ring-1 ring-black/5">
              <Search className="h-4 w-4 text-neutral-500" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari template, stack, fitur…" className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400" />
            </div>
          </div>

          {/* Sort */}
          <Select
            value={sort}
            onChange={(v) => setSort(v as SortKey)}
            options={[
              { value: "relevance", label: "Relevansi" },
              { value: "price-asc", label: "Termurah" },
              { value: "price-desc", label: "Termahal" },
              { value: "rating-desc", label: "Rating tinggi" },
            ]}
          />
        </div>

        {/* Stack chips */}
        <div className="mt-3">
          <FilterGroup title="Stack populer">
            <div className="flex flex-wrap gap-2">
              {topStacks.map((s) => (
                <Chip key={s} active={stacks.includes(s)} onClick={() => toggleStack(s)}>
                  {s}
                </Chip>
              ))}
            </div>
          </FilterGroup>
        </div>

        {/* Active summary */}
        {stacks.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-neutral-500">Aktif:</span>
            {stacks.map((s) => (
              <button key={s} onClick={() => toggleStack(s)} className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-xs ring-1 ring-black/5">
                {s} <X className="h-3 w-3" />
              </button>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Product list */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
        {!filtered.length && <GlassCard className="p-6 text-center text-sm text-neutral-700">Nggak ada hasil cocok. Coba kurangi filter-nya.</GlassCard>}
      </div>
    </div>
  );
}

/* ===== Helpers ===== */

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl ring-1 ring-black/5 ${className}`}>
      <div className="pointer-events-none absolute inset-0 rounded-[16px] ring-1 ring-black/5" />
      {children}
    </div>
  );
}

function GlassBadge({ children }: { children: React.ReactNode }) {
  return <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/60 px-3 py-1 text-xs text-neutral-700 backdrop-blur-xl ring-1 ring-black/5">{children}</div>;
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500">{title}</div>
      {children}
    </div>
  );
}

function Chip({ active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm transition ${active ? "bg-white/80 text-neutral-900 ring-1 ring-black/5" : "border border-white/60 bg-white/60 text-neutral-700 ring-1 ring-black/5 hover:bg-white/75"}`}
    >
      {children}
    </button>
  );
}

/* ===== Custom Glass Dropdown (hover minimalis, tanpa biru) ===== */
function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value) ?? options[0];

  // klik di luar untuk tutup
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!btnRef.current || !listRef.current) return;
      if (btnRef.current.contains(e.target as Node)) return;
      if (listRef.current.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className="relative">
      {/* tombol utama */}
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-left text-sm text-neutral-900
                   backdrop-blur-xl ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.04)] hover:bg-white/80 focus:outline-none focus:ring-1 focus:ring-black/10 transition"
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* daftar opsi */}
      {open && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-40 mt-2 w-full overflow-hidden rounded-2xl border border-white/60 bg-white/80 backdrop-blur-2xl ring-1 ring-black/5
                     shadow-[0_12px_40px_rgba(0,0,0,0.08)] animate-fadeIn"
        >
          {options.map((o) => {
            const active = o.value === value;
            return (
              <li
                key={o.value}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`cursor-pointer px-4 py-2.5 text-sm transition-colors duration-150 
                  ${active ? "bg-white/90 font-medium text-neutral-900" : "text-neutral-700 hover:bg-black/30 hover:text-neutral-900"}`}
              >
                {o.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
