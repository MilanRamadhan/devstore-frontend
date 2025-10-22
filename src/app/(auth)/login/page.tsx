// src/app/(auth)/login/page.tsx
"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/store/auth";
import { GoogleAuthButton } from "@/components/google-auth-button";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") ?? "/";
  const registered = sp.get("registered") === "true";
  const expired = sp.get("expired") === "true";
  const registeredEmail = sp.get("email") || "";

  const { login, hydrate } = useAuth();

  const [email, setEmail] = useState(registeredEmail);
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(registered ? "🎉 Registrasi berhasil! Silakan login dengan akun Anda." : "");
  const [expiredMsg, setExpiredMsg] = useState(expired ? "⏱️ Sesi Anda telah berakhir. Silakan login kembali." : "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setExpiredMsg(""); // Clear expired message on new login attempt

    // Validasi minimal
    if (!email.includes("@") || pass.length < 4) {
      setErr("Email/password tidak valid.");
      return;
    }

    setIsLoading(true);
    const result = await login(email, pass);
    setIsLoading(false);

    if (result.ok) {
      hydrate();

      // Check if there's a redirect URL stored
      let redirectPath = next;
      if (typeof window !== "undefined") {
        const storedRedirect = localStorage.getItem("devstore_redirect_after_login");
        if (storedRedirect && storedRedirect !== "/login" && storedRedirect !== "/register") {
          redirectPath = storedRedirect;
          localStorage.removeItem("devstore_redirect_after_login");
        }
      }

      // Redirect based on user role if no specific redirect
      const user = result.user;
      if (redirectPath === "/") {
        if (user?.role === "admin") {
          redirectPath = "/admin";
        } else if (user?.role === "seller") {
          redirectPath = "/seller";
        } else {
          redirectPath = "/products";
        }
      }

      router.replace(redirectPath);
    } else {
      setErr(result.message || "Login gagal. Silakan coba lagi.");
    }
  }

  return (
    <AuthShell title="Masuk ke DevStore" subtitle="Akses katalog, add-on, dan milestone dengan aman.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {successMsg && <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">{successMsg}</div>}
        {expiredMsg && (
          <div className="rounded-lg bg-orange-50 border border-orange-200 p-3 text-sm text-orange-800">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {expiredMsg}
            </div>
          </div>
        )}

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

        <button type="submit" disabled={isLoading} className="w-full rounded-2xl bg-black px-4 py-2.5 text-white transition hover:bg-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed">
          {isLoading ? "Memproses..." : "Masuk"}
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white/60 px-2 text-neutral-500">atau</span>
          </div>
        </div>

        {/* Google Auth Button */}
        <GoogleAuthButton mode="login" />

        <p className="text-center text-sm text-neutral-600">
          Belum punya akun?{" "}
          <Link href="/register" className="underline">
            Daftar sekarang
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
