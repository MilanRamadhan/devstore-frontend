"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/store/cart";
import { ShoppingCart, Menu, X } from "lucide-react";

const NAV = [{ href: "/products", label: "Katalog" }];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // ✅ ambil jumlah item langsung dari Zustand (reaktif)
  const items = useCart((s) => s.totals().items);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 supports-[backdrop-filter]:bg-white/70 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="font-semibold text-lg tracking-tight">
            DevStore
          </Link>

          {/* Desktop */}
          <nav className="hidden md:flex items-center gap-2">
            {NAV.map((n) => {
              const active = pathname === n.href || pathname?.startsWith(n.href + "/");
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={["px-3 py-1.5 rounded-full text-sm transition duration-300", active ? "bg-black/90 hover: text-white/90 ring-1 ring-black/5" : "text-neutral-700 hover:bg-black/90 hover:text-white/90"].join(" ")}
                >
                  {n.label}
                </Link>
              );
            })}

            {(() => {
              const active = pathname === "/cart" || pathname?.startsWith("/cart/");
              return (
                <Link
                  href="/cart"
                  className={[
                    "relative ml-2 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition duration-300",
                    active ? "bg-white/80 text-neutral-900 ring-1 ring-black/5" : "text-neutral-700 hover:bg-black/90 hover:text-white/90",
                  ].join(" ")}
                >
                  <ShoppingCart className={`h-4 w-4 transition-transform duration-300 ${active ? "scale-105" : "group-hover:scale-105"}`} />
                  <span>Cart</span>
                  <span className="absolute -right-1 -top-1 rounded-full bg-black px-1 text-[10px] leading-4 text-white">{items}</span>
                </Link>
              );
            })()}
          </nav>

          {/* Mobile toggle */}
          <button className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/60 bg-white/60 ring-1 ring-black/5" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-3">
            <div className="mt-2 rounded-2xl border border-white/60 bg-white/60 p-2 backdrop-blur-xl ring-1 ring-black/5">
              {NAV.map((n) => {
                const active = pathname === n.href || pathname?.startsWith(n.href + "/");
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={["block rounded-xl px-3 py-2 text-sm transition", active ? "bg-white/80 text-neutral-900 ring-1 ring-black/5" : "text-neutral-700 hover:bg-white/70"].join(" ")}
                    onClick={() => setOpen(false)}
                  >
                    {n.label}
                  </Link>
                );
              })}
              <Link href="/cart" className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-neutral-700 hover:bg-white/70" onClick={() => setOpen(false)}>
                <ShoppingCart className="h-4 w-4" />
                <span>Cart</span>
                <span className="ml-auto rounded-full bg-black px-1 text-[10px] leading-4 text-white">{items}</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
