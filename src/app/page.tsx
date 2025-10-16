import Link from "next/link";
import ProductCard from "@/components/product-card";
import { PRODUCTS } from "@/lib/mock";
import { Lock, ShieldCheck, Star, Puzzle, Rocket, FlaskConical, Store, Sparkles } from "lucide-react";

export default function Home() {
  const featured = PRODUCTS.slice(0, 2);

  return (
    <div className="relative -mx-4 px-4 md:mx-0 md:px-0">
      {/* ====== LIQUID BACKGROUND LAYER ====== */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* soft gradient base */}
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_10%_0%,#ffffff_0%,#f7f7f7_40%,#f2f2f2_100%)]" />
        {/* blobs */}
        <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-300/40 to-sky-300/30 blur-3xl" />
        <div className="absolute -right-20 top-32 h-80 w-80 rounded-full bg-gradient-to-br from-rose-300/40 to-amber-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-300/30 to-teal-200/30 blur-3xl" />
        {/* noise overlay halus */}
        <div
          className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
          style={{
            backgroundImage:
              "url('data:image/svg+xml;utf8,\
<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2248%22 height=%2248%22 viewBox=%220 0 48 48%22>\
<filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter>\
<rect width=%2248%22 height=%2248%22 filter=%22url(%23n)%22 opacity=%220.35%22/></svg>')",
          }}
        />
      </div>

      <div className="space-y-20">
        {/* ====== HERO ====== */}
        <section className="grid items-center gap-10 md:grid-cols-2">
          <div className="space-y-6">
            <GlassBadge className="inline-flex">
              <span className="inline-flex items-center gap-1">
                <Lock className="h-3.5 w-3.5" /> Escrow & Milestone
              </span>
              <span className="mx-2 h-1 w-1 rounded-full bg-neutral-300/70" />
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Add-on transparan
              </span>
            </GlassBadge>

            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Bangun lebih cepat. <span className="text-neutral-500">Tanpa drama.</span>
            </h1>
            <p className="max-w-xl text-neutral-600">Pilih template, centang add-on, cek total otomatis. Pembayaran aman pakai escrow, rilis bertahap per milestone. Semua serba jelas, tinggal gas.</p>

            <div className="grid gap-4 sm:grid-cols-2 md:max-w-md">
              {/* tombol 1: Lihat Katalog */}
              <Link
                href="/products"
                className="group relative flex items-center justify-center rounded-2xl border border-white/60 bg-white/60 px-5 py-3 text-sm font-medium text-neutral-800 backdrop-blur-xl ring-1 ring-black/5 transition hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] hover:bg-white/70"
              >
                <span className="relative z-10 flex items-center gap-2">Lihat Katalog</span>
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/5" />
              </Link>

              {/* tombol 2: Lihat Fitur */}
              <a
                href="#fitur"
                className="group relative flex items-center justify-center rounded-2xl border border-white/60 bg-white/60 px-5 py-3 text-sm font-medium text-neutral-800 backdrop-blur-xl ring-1 ring-black/5 transition hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] hover:bg-white/70"
              >
                <span className="relative z-10 flex items-center gap-2">Lihat Fitur</span>
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/5" />
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-neutral-600">
              <span className="inline-flex items-center gap-2">
                <Star className="h-4 w-4" /> Review terverifikasi
              </span>
              <span className="inline-flex items-center gap-2">
                <Puzzle className="h-4 w-4" /> Add-on fleksibel
              </span>
              <span className="inline-flex items-center gap-2">
                <Rocket className="h-4 w-4" /> Siap deploy
              </span>
            </div>
          </div>

          {/* mock visual dalam glass card */}
          <GlassCard className="relative h-64 w-full md:h-[420px] p-4">
            <div className="h-8 w-28 rounded-full bg-white/50" />
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="h-24 rounded-xl border border-white/50 bg-white/60" />
              <div className="h-24 rounded-xl border border-white/50 bg-white/60" />
              <div className="h-24 rounded-xl border border-white/50 bg-white/60" />
            </div>
            <div className="mt-6 h-10 w-40 rounded-xl bg-black/90" />
            {/* kecilin glass ring di pinggir sebagai aksen */}
            <div className="pointer-events-none absolute inset-0 rounded-[20px] ring-1 ring-black/5" />
          </GlassCard>
        </section>

        {/* ====== FITUR ====== */}
        <section id="fitur" className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Kenapa DevStore?</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <GlassCard className="p-5 hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] transition">
              <FeatureItem icon={<Puzzle className="h-5 w-5 text-neutral-700" />} title="Add-on Transparan" desc="Branding, payment, deploy, i18n—tinggal centang. Harga & SLA langsung ke-update." />
            </GlassCard>
            <GlassCard className="p-5 hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] transition">
              <FeatureItem icon={<Lock className="h-5 w-5 text-neutral-700" />} title="Escrow & Milestone" desc="Bayar aman. Dana dirilis bertahap setelah kamu approve tiap milestone." />
            </GlassCard>
            <GlassCard className="p-5 hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] transition">
              <FeatureItem icon={<FlaskConical className="h-5 w-5 text-neutral-700" />} title="Live Demo & Review" desc="Lihat demo dulu, baca review terverifikasi, cek changelog sebelum beli." />
            </GlassCard>
          </div>
        </section>

        {/* ====== TRENDING ====== */}
        <section className="space-y-6">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Lagi trending</h2>
            <Link href="/products" className="text-sm text-neutral-600 hover:underline">
              Lihat semua →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
            {/* CTA */}
            <GlassCard className="hidden p-6 sm:block">
              <div className="text-sm text-neutral-700">Butuh kustom lain?</div>
              <div className="mt-2 text-lg font-semibold">Request add-on spesifik</div>
              <p className="mt-2 text-sm text-neutral-600">Kirim kebutuhanmu, seller kami siap bantu.</p>
              <Link href="/products" className="mt-4 inline-flex rounded-xl border border-white/60 bg-white/60 px-4 py-2 text-sm hover:bg-white/80">
                Jelajahi dulu
              </Link>
            </GlassCard>
          </div>
        </section>

        {/* ====== STATS / TRUST ====== */}
        <GlassCard className="p-6 md:p-8">
          <div className="grid gap-6 text-center sm:grid-cols-3">
            <Stat number="4.8/5" label="Rata-rata rating" />
            <Stat number="100+" label="Template siap pakai" />
            <Stat number="3–7 hari" label="Rata-rata delivery" />
          </div>
        </GlassCard>

        {/* ====== CTA BAWAH ====== */}
        <GlassCard className="p-8 text-center">
          <h3 className="text-2xl font-semibold tracking-tight">Siap mulai cepat tanpa nyusun dari nol?</h3>
          <p className="mx-auto mt-3 max-w-2xl text-neutral-700">Pilih template, centang add-on, dan biarkan kami handle sisanya. Kamu fokus ke launching.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 md:max-w-md mx-auto">
            {/* Primary (Katalog) */}
            <Link
              href="/products"
              className="group relative flex items-center justify-center rounded-2xl border border-white/60 bg-white/70 px-5 py-3 text-sm font-medium text-neutral-900 backdrop-blur-xl ring-1 ring-black/5 transition hover:bg-white/80 hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)]"
            >
              <span className="relative z-10">Mulai dari katalog</span>
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/5" />
            </Link>

            {/* Secondary (Fitur) */}
            <a
              href="#fitur"
              className="group relative flex items-center justify-center rounded-2xl border border-white/60 bg-white/50 px-5 py-3 text-sm font-medium text-neutral-700 backdrop-blur-xl ring-1 ring-black/5 transition hover:bg-white/65 hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)]"
            >
              <span className="relative z-10">Lihat fitur</span>
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/5" />
            </a>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

/* ====== helper components (scoped) ====== */

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={"rounded-2xl border border-white/50 bg-white/40 backdrop-blur-xl ring-1 ring-black/5 " + className}>{children}</div>;
}

function GlassBadge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={"rounded-full border border-white/60 bg-white/60 px-3 py-1 text-xs text-neutral-700 backdrop-blur-xl shadow-sm ring-1 ring-black/5 " + className}>{children}</div>;
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/60 bg-white/60">{icon}</div>
      <div className="space-y-1">
        <div className="font-medium">{title}</div>
        <p className="text-sm text-neutral-700">{desc}</p>
      </div>
    </div>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="space-y-1">
      <div className="text-3xl font-semibold">{number}</div>
      <div className="text-sm text-neutral-700">{label}</div>
    </div>
  );
}
