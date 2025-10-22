"use client";

import React, { useEffect, useState } from "react";

export function ModalRoot({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        startClose();
      }
      if (e.key === "Tab") {
        const root = document.querySelector("[data-modal-root]") as HTMLElement | null;
        if (!root) return;
        const focusables = root.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prev;
    };
  }, [isOpen]);

  function startClose() {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 160);
  }

  if (!isOpen) return null;

  return (
    <div data-modal-root className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* overlay */}
      <div className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${closing ? "opacity-0" : "opacity-100"}`} onClick={startClose} aria-hidden="true" />
      {/* panel wrapper (scale/opacity) */}
      <div className={`relative z-[91] w-full max-w-lg transition ${closing ? "scale-[0.98] translate-y-2 opacity-0" : "scale-100 translate-y-0 opacity-100"}`}>{children}</div>

      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          [data-modal-root] * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={"relative animate-[modalIn_180ms_ease-out] rounded-2xl border border-white/60 bg-white/70 p-6 backdrop-blur-xl ring-1 ring-black/5 shadow-[0_12px_40px_rgba(0,0,0,0.15)] " + className}>
      <div className="pointer-events-none absolute inset-0 rounded-[16px] ring-1 ring-black/5" />
      {children}
      <style jsx>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

/* kecil: tombol ghost glass */
export function BtnGlass({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        "group relative inline-flex items-center justify-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-4 py-2.5 text-sm font-medium text-neutral-900 backdrop-blur-xl ring-1 ring-black/5 transition hover:bg-white/80 hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-1 focus:ring-black/10 disabled:opacity-50 " +
        className
      }
    >
      <span className="relative z-10">{children}</span>
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/5" />
    </button>
  );
}

export function BtnPrimary({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        "group relative inline-flex items-center justify-center gap-2 rounded-2xl border border-white/60 bg-black/90 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-xl ring-1 ring-black/5 transition hover:bg-black hover:shadow-[0_6px_24px_rgba(0,0,0,0.15)] focus:outline-none focus:ring-1 focus:ring-black/10 disabled:opacity-50 " +
        className
      }
    >
      <span className="relative z-10">{children}</span>
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/5" />
    </button>
  );
}
