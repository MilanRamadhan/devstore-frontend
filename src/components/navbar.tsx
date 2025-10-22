"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { ShoppingCart, Menu, X, LogOut, User2 } from "lucide-react";

/* ===== helpers ===== */
const getNavItems = (role?: string) => [
  { href: "/products", label: "Katalog" },
  { href: role === "seller" || role === "admin" ? "/seller/orders" : "/orders", label: "Orders" },
  { href: "/seller", label: "Seller Dashboard", sellerOnly: true },
  { href: "/admin", label: "Admin", adminOnly: true },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items = useCart((s) => s.totals().items);
  const { user, logout } = useAuth();

  const navItems = useMemo(() => getNavItems(user?.role), [user?.role]);

  const initials = useMemo(() => {
    const n = user?.name?.trim() || user?.email?.split("@")[0] || "U";
    return n
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("");
  }, [user]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 ring-1 ring-black/5">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Brand */}
          <Link href="/" className="text-lg font-semibold tracking-tight text-neutral-900">
            DevStore
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems
              .filter((n) => {
                if (n.sellerOnly) return user?.role === "seller" || user?.role === "admin";
                if (n.adminOnly) return user?.role === "admin";
                return true;
              })
              .map((n) => {
                const active = pathname === n.href || pathname?.startsWith(n.href + "/");
                return (
                  <Link key={n.href} href={n.href} className={["relative px-3 py-2 text-sm text-neutral-700 transition-colors", "hover:text-neutral-900", active ? "text-neutral-900" : ""].join(" ")}>
                    <span className="font-medium">{n.label}</span>
                    {/* active underline */}
                    <span className={["absolute left-2 right-2 -bottom-[2px] h-[2px] rounded-full transition-all", active ? "bg-neutral-900/80" : "bg-transparent group-hover:bg-neutral-900/40"].join(" ")} />
                  </Link>
                );
              })}

            {/* Cart */}
            {(() => {
              const active = pathname === "/cart" || pathname?.startsWith("/cart/");
              return (
                <Link href="/cart" className={["relative ml-1 inline-flex items-center gap-2 px-3 py-2 text-sm transition-colors", active ? "text-neutral-900" : "text-neutral-700 hover:text-neutral-900"].join(" ")}>
                  <ShoppingCart className="h-4 w-4" />
                  <span className="font-medium">Cart</span>
                  <span className="absolute -right-1 -top-1 rounded-full bg-neutral-900 px-1 text-[10px] leading-4 text-white">{items}</span>
                  {/* underline */}
                  <span className={["absolute left-2 right-2 -bottom-[2px] h-[2px] rounded-full transition-all", active ? "bg-neutral-900/80" : "bg-transparent"].join(" ")} />
                </Link>
              );
            })()}

            {/* Profile (hover dropdown) */}
            <div className="relative ml-2 group/profile">
              {/* trigger pakai anchor biar bukan button */}
              <a href="/profile" className="inline-flex items-center gap-2 rounded-full px-2.5 py-1.5 text-sm text-neutral-900 transition-colors hover:text-neutral-950" aria-haspopup="menu" aria-expanded="false">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-[11px] font-medium text-white">{initials}</span>
                <span className="hidden sm:inline font-medium">{user?.name ?? user?.email ?? "User"}</span>
              </a>

              {/* menu */}
              <div className="invisible absolute right-0 mt-2 w-48 origin-top-right scale-95 rounded-2xl border border-white/60 bg-white/95 p-1.5 opacity-0 shadow-[0_12px_40px_rgba(0,0,0,0.12)] ring-1 ring-black/5 backdrop-blur-2xl transition-all duration-150 ease-out group-hover/profile:visible group-hover/profile:scale-100 group-hover/profile:opacity-100">
                <Link href="/profile" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-neutral-800 transition-colors hover:bg-black/[0.04] hover:text-neutral-900">
                  <User2 className="h-4 w-4" />
                  <span className="font-medium">Profil</span>
                </Link>
                <a
                  href="/login"
                  onClick={(e) => {
                    e.preventDefault();
                    logout();
                    router.replace("/login");
                  }}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-neutral-800 transition-colors hover:bg-rose-50 hover:text-rose-700"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium">Keluar</span>
                </a>
              </div>
            </div>
          </nav>

          {/* Mobile toggle (tanpa <button>, tapi tetap accessible) */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpen((v) => !v)}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/60 bg-white/70 ring-1 ring-black/5 transition hover:bg-white/85"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="pb-3 md:hidden">
            <div className="mt-2 rounded-2xl border border-white/60 bg-white/70 p-2 ring-1 ring-black/5 backdrop-blur-xl shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
              {navItems
                .filter((n) => {
                  if (n.sellerOnly) return user?.role === "seller" || user?.role === "admin";
                  if (n.adminOnly) return user?.role === "admin";
                  return true;
                })
                .map((n) => {
                  const active = pathname === n.href || pathname?.startsWith(n.href + "/");
                  return (
                    <Link
                      key={n.href}
                      href={n.href}
                      className={["block rounded-xl px-3 py-2 text-sm transition-colors", active ? "text-neutral-900 bg-white/80 ring-1 ring-black/5" : "text-neutral-800 hover:bg-white/80"].join(" ")}
                      onClick={() => setOpen(false)}
                    >
                      {n.label}
                    </Link>
                  );
                })}

              <Link href="/cart" className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-neutral-800 transition-colors hover:bg-white/80" onClick={() => setOpen(false)}>
                <ShoppingCart className="h-4 w-4" />
                <span>Cart</span>
                <span className="ml-auto rounded-full bg-neutral-900 px-1 text-[10px] leading-4 text-white">{items}</span>
              </Link>

              <div className="my-2 h-px bg-black/5" />

              <Link href="/profile" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-neutral-800 transition-colors hover:bg-white/80" onClick={() => setOpen(false)}>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-[11px] text-white">{initials}</span>
                <span>Profil</span>
              </Link>

              <a
                href="/login"
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  logout();
                  router.replace("/login");
                }}
                className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-neutral-800 transition-colors hover:bg-white/80"
              >
                <LogOut className="h-4 w-4" />
                <span>Keluar</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
