import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevStore",
  description: "Marketplace template & add-on",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-dvh bg-white text-neutral-900 antialiased">{children}</body>
    </html>
  );
}
