// src/components/google-auth-button.tsx
"use client";

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/store/auth";

interface GoogleAuthButtonProps {
  mode: "login" | "register";
}

export function GoogleAuthButton({ mode }: GoogleAuthButtonProps) {
  const router = useRouter();
  const { setUser, hydrate } = useAuth();
  const [error, setError] = useState("");

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      console.log("🔐 Google Login Success:", credentialResponse);
      setError(""); // Clear previous errors

      // Send credential to your backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const result = await response.json();
      console.log("🔐 Backend Response:", result);

      if (result.ok && result.data?.user) {
        const userData = result.data.user;
        const isNewUser = result.data.isNewUser;

        // Check if in register mode but user already exists
        if (mode === "register" && !isNewUser) {
          setError("Akun Google ini sudah terdaftar. Silakan login.");
          console.warn("⚠️ User tried to register with existing Google account");
          return;
        }

        // Set user in store
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name || userData.display_name || userData.email?.split("@")[0] || "User",
          role: userData.role || "buyer",
          store_name: userData.store_name || null,
        });

        // Hydrate to merge profile
        await hydrate();

        // Show success message for new users
        if (isNewUser && mode === "register") {
          console.log("🎉 New user registered via Google");
        }

        // Redirect based on role
        const user = userData;
        let redirectPath = "/products";

        if (user?.role === "admin") {
          redirectPath = "/admin";
        } else if (user?.role === "seller") {
          redirectPath = "/seller";
        }

        router.replace(redirectPath);
      } else {
        setError(result.message || "Login dengan Google gagal");
        console.error("❌ Google auth failed:", result);
      }
    } catch (error) {
      console.error("❌ Google auth error:", error);
      setError("Terjadi kesalahan saat login dengan Google");
    }
  };

  const handleGoogleError = () => {
    console.error("❌ Google Login Failed");
    setError("Login dengan Google gagal. Silakan coba lagi.");
  };

  return (
    <div className="space-y-2">
      <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} useOneTap={false} theme="outline" size="large" text={mode === "login" ? "signin_with" : "signup_with"} shape="rectangular" logo_alignment="left" width="100%" />
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}
    </div>
  );
}
