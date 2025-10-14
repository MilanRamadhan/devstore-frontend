import { Product } from "./types";

export const PRODUCTS: Product[] = [
  {
    id: "p1",
    slug: "nextjs-saas-starter",
    title: "Next.js SaaS Starter",
    category: "Web",
    stack: ["Next.js", "Tailwind", "Prisma"],
    cover: "/logo.svg",
    basePrice: 1500000,
    baseSlaDays: 3,
    ratingAvg: 4.8,
    ratingCount: 124,
    demoUrl: "https://example.com/demo",
    description: "Starter SaaS siap deploy: auth, billing stub, dashboard, komponen UI dasar.",
    addOns: [
      { id: "a1", name: "Branding (Logo + Palet)", price: 500000, extraSlaDays: 2 },
      { id: "a2", name: "Integrasi Payment (Midtrans)", price: 900000, extraSlaDays: 2 },
      { id: "a3", name: "Deployment (Vercel + DB)", price: 600000, extraSlaDays: 1 },
      { id: "a4", name: "Multi-bahasa (i18n)", price: 400000, extraSlaDays: 1 },
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
    basePrice: 1200000,
    baseSlaDays: 4,
    ratingAvg: 4.5,
    ratingCount: 62,
    description: "Kit platformer 2D: movement, enemy AI dasar, level loader.",
    addOns: [
      { id: "b1", name: "Reskin Asset", price: 700000, extraSlaDays: 2 },
      { id: "b2", name: "Level Pack +5", price: 800000, extraSlaDays: 2 },
    ],
  },
];

export const getProductBySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
