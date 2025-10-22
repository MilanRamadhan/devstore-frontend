// src/app/auth/callback/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/store/auth";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://eahpxkqxqfaszscgbaur.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhaHB4a3F4cWZhc3pzY2diYXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNDE1ODcsImV4cCI6MjA3NjYxNzU4N30.Ddz981dlT6ndsUUNVF6SeYDBVyG_A-mg5dc9q9H2ot8"
);

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, hydrate } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    async function handleCallback() {
      try {
        // Exchange the code for a session using Supabase
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);

        if (error) {
          console.error("Exchange code error:", error);
          setError(error.message);
          return;
        }

        if (data?.session) {
          // Save token
          localStorage.setItem("token", data.session.access_token);

          // Save user
          const user = {
            id: data.user.id,
            email: data.user.email || "",
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split("@")[0] || "User",
          };

          setUser(user);
          localStorage.setItem("user", JSON.stringify(user));

          // Sync profile to backend
          try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
            await fetch(`${API_URL}/profile`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${data.session.access_token}`,
              },
              body: JSON.stringify({
                display_name: user.name,
                avatar_url: data.user.user_metadata?.avatar_url,
              }),
            });
          } catch (e) {
            console.warn("Failed to sync profile to backend:", e);
          }

          // Hydrate auth state
          hydrate();

          // Redirect to home
          setTimeout(() => {
            router.replace("/");
          }, 500);
        } else {
          setError("Tidak ada session yang ditemukan");
        }
      } catch (err) {
        console.error("Callback error:", err);
        setError("Terjadi kesalahan saat autentikasi");
      }
    }

    handleCallback();
  }, [searchParams, router, setUser, hydrate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-semibold text-neutral-800 mb-2">Autentikasi Gagal</h1>
          <p className="text-neutral-600 mb-6">{error}</p>
          <button onClick={() => router.push("/login")} className="w-full rounded-2xl bg-black px-4 py-2.5 text-white transition hover:bg-neutral-800">
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full text-center">
        <div className="h-16 w-16 mx-auto mb-4 animate-spin rounded-full border-4 border-neutral-200 border-t-blue-600" />
        <h1 className="text-2xl font-semibold text-neutral-800 mb-2">Memproses Autentikasi</h1>
        <p className="text-neutral-600">Mohon tunggu sebentar...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full text-center">
            <div className="h-16 w-16 mx-auto mb-4 animate-spin rounded-full border-4 border-neutral-200 border-t-blue-600" />
            <h1 className="text-2xl font-semibold text-neutral-800 mb-2">Loading...</h1>
          </div>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
