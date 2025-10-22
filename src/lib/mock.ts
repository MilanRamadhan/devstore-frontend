import { Product } from "./types";

// Mock data - deprecated, now using Supabase database
export const PRODUCTS: Product[] = [
  {
    id: "p1",
    slug: "nextjs-saas-starter",
    title: "Next.js SaaS Starter",
    category: "Web",
    stack: ["Next.js", "Tailwind", "Prisma"],
    cover: "/logo.svg",
    base_price: 1500000,
    rating_avg: 4.8,
    rating_count: 124,
    demo_url: "https://example.com/demo",
    description: "Starter SaaS siap deploy: auth, billing stub, dashboard, komponen UI dasar.",
    delivery: "instant", // DUAL DELIVERY MODE
    asset_path: "assets/nextjs-saas-starter.zip",
    addOns: [
      { id: "a1", name: "Branding (Logo + Palet)", price: 500000 },
      { id: "a2", name: "Integrasi Payment (Midtrans)", price: 900000 },
      { id: "a3", name: "Deployment (Vercel + DB)", price: 600000 },
      { id: "a4", name: "Multi-bahasa (i18n)", price: 400000 },
    ],
    changelog: [
      { version: "1.1.0", notes: "Tambah komponen Billing, perbaikan auth.", releasedAt: "2025-09-10" },
      { version: "1.0.0", notes: "Rilis awal", releasedAt: "2025-08-01" },
    ],
  },
  {
    id: "p2",
    slug: "unity-2d-platformer",
    title: "Unity 2D Platformer Kit",
    category: "Game",
    stack: ["Unity", "C#"],
    cover: "/logo.svg",
    base_price: 1200000,
    rating_avg: 4.5,
    rating_count: 62,
    description: "Kit platformer 2D: movement, enemy AI dasar, level loader.",
    delivery: "custom", // DUAL DELIVERY MODE
    custom_eta_days: 7,
    requires_brief: true,
    addOns: [
      { id: "b1", name: "Reskin Asset", price: 700000 },
      { id: "b2", name: "Level Pack +5", price: 800000 },
    ],
  },
];

export const getProductBySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
