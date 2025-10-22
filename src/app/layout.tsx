import type { Metadata } from "next";
import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

export const metadata: Metadata = {
  title: "DevStore",
  description: "Marketplace template & add-on",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "1051456407861-t779cn5b086gqm5et0tgntt2mf4m8fm3.apps.googleusercontent.com";

  return (
    <html lang="id">
      <body className="min-h-dvh bg-white text-neutral-900 antialiased">
        <GoogleOAuthProvider clientId={googleClientId}>{children}</GoogleOAuthProvider>
      </body>
    </html>
  );
}
