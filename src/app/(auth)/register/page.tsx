// src/app/(auth)/register/page.tsx
"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/store/auth";

export default function RegisterPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") ?? "/";

  const { register, hydrate } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!name.trim() || !email.includes("@") || pass.length < 4) {
      setErr("Lengkapi nama, email valid, dan password ≥ 4 karakter.");
      return;
    }
    register({ id: crypto.randomUUID(), name, email });
    hydrate();
    router.replace(next);
  }

  return (
    <AuthShell title="Daftar DevStore" subtitle="Bikin akun gratis. Mulai cepat tanpa drama.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nama">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama kamu"
            className="w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm outline-none ring-1 ring-black/5 placeholder:text-neutral-400 focus:bg-white/90"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="kamu@email.com"
            className="w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm outline-none ring-1 ring-black/5 placeholder:text-neutral-400 focus:bg-white/90"
          />
        </Field>
        <Field label="Password">
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm outline-none ring-1 ring-black/5 placeholder:text-neutral-400 focus:bg-white/90"
          />
        </Field>

        {err && <p className="text-sm text-red-600">{err}</p>}

        <button type="submit" className="w-full rounded-2xl bg-black px-4 py-2.5 text-white transition hover:bg-neutral-900">
          Daftar
        </button>

        <p className="text-center text-sm text-neutral-600">
          Sudah punya akun?{" "}
          <Link href="/login" className="underline">
            Masuk
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

/* --- small components --- */
function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-white/60 bg-white/60 p-6 md:p-8 backdrop-blur-xl ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
      <main className="mx-auto max-w-6xl px-4 py-10 flex-1">
        <div className="max-w-md">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-neutral-700">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm text-neutral-700">{label}</span>
      {children}
    </label>
  );
}
