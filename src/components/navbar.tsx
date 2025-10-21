"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useMemo } from "react";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { ShoppingCart, Menu, X, LogOut, User2 } from "lucide-react";

const NAV = [{ href: "/products", label: "Katalog" }];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // totals cart (reaktif)
  const items = useCart((s) => s.totals().items);

  // auth
  const { user, logout } = useAuth();

  // inisial avatar (fallback)
  const initials = useMemo(() => {
    const n = user?.name?.trim() || user?.email?.split("@")[0] || "U";
    return n
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("");
  }, [user]);

  return (
    <header data-aos="fade-down" data-aos-duration="700" className="sticky top-0 z-50 border-b bg-white/80 supports-[backdrop-filter]:bg-white/70 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Brand */}
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
                  className={["px-3 py-1.5 rounded-full text-sm transition duration-300", active ? "bg-black/90 text-white ring-1 ring-black/5" : "text-neutral-700 hover:bg-black/90 hover:text-white/90"].join(" ")}
                >
                  {n.label}
                </Link>
              );
            })}

            {/* Cart */}
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
                  <ShoppingCart className="h-4 w-4" />
                  <span>Cart</span>
                  <span className="absolute -right-1 -top-1 rounded-full bg-black px-1 text-[10px] leading-4 text-white">{items}</span>
                </Link>
              );
            })()}

            {/* Profile dropdown (hover) */}
            <div className="relative ml-2 group/profile">
              <button
                className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1.5 text-sm text-neutral-900 ring-1 ring-black/5 transition-all duration-200 hover:bg-white hover:shadow-sm"
                aria-haspopup="menu"
                aria-expanded="false"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black/90 text-white text-[11px] font-medium">{initials}</div>
                <span className="hidden sm:inline font-medium">{user?.name ?? user?.email ?? "User"}</span>
              </button>

              {/* Menu */}
              <div className="invisible opacity-0 scale-95 group-hover/profile:visible group-hover/profile:opacity-100 group-hover/profile:scale-100 transition-all duration-200 ease-out absolute right-0 mt-2 w-48 rounded-2xl border border-white/60 bg-white/95 backdrop-blur-2xl ring-1 ring-black/5 shadow-[0_12px_40px_rgba(0,0,0,0.12)] origin-top-right">
                <div className="p-1.5">
                  <Link href="/profile" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-neutral-800 transition-colors hover:bg-black/5 hover:text-neutral-900">
                    <User2 className="h-4 w-4" />
                    <span className="font-medium">Profil</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      router.replace("/login");
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-neutral-800 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="font-medium">Keluar</span>
                  </button>
                </div>
              </div>
            </div>
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

              {/* Cart (mobile) */}
              <Link href="/cart" className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-neutral-700 hover:bg-white/70" onClick={() => setOpen(false)}>
                <ShoppingCart className="h-4 w-4" />
                <span>Cart</span>
                <span className="ml-auto rounded-full bg-black px-1 text-[10px] leading-4 text-white">{items}</span>
              </Link>

              {/* Divider */}
              <div className="my-2 h-px bg-black/5" />

              {/* Profile + Logout (mobile) */}
              <Link href="/profile" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-neutral-700 hover:bg-white/70" onClick={() => setOpen(false)}>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black/90 text-white text-[11px]">{initials}</div>
                <span>Profil</span>
              </Link>
              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                  router.replace("/login");
                }}
                className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-neutral-700 hover:bg-white/70"
              >
                <LogOut className="h-4 w-4" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
