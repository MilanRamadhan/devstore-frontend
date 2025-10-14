import Link from "next/link";
import { Github, Twitter, Mail, ShieldCheck, Sparkles } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20">
      {/* garis tipis sebagai pemisah, subtle */}
      <div className="mx-auto max-w-6xl px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
      </div>

      {/* glass footer */}
      <div className="mt-6 border-t border-white/60 bg-white/60 backdrop-blur-xl ring-1 ring-black/5">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Brand + tagline */}
            <div className="space-y-3">
              <Link href="/" className="inline-flex items-center gap-2 font-semibold text-lg tracking-tight">
                <Sparkles className="h-5 w-5" />
                DevStore
              </Link>
              <p className="text-sm text-neutral-700">Transparan, fleksibel, aman. Template + add-on dengan escrow & milestone.</p>
              <div className="flex items-center gap-3 pt-1 text-xs text-neutral-600">
                <ShieldCheck className="h-4 w-4" />
                <span>Review terverifikasi • Changelog jelas</span>
              </div>
            </div>

            {/* Nav links */}
            <nav className="grid grid-cols-2 gap-6 text-sm">
              <div className="space-y-2">
                <div className="font-medium text-neutral-900">Jelajah</div>
                <ul className="space-y-1 text-neutral-700">
                  <li>
                    <Link href="/products" className="hover:underline">
                      Katalog
                    </Link>
                  </li>
                  <li>
                    <a href="#fitur" className="hover:underline">
                      Cara kerja
                    </a>
                  </li>
                  <li>
                    <Link href="/cart" className="hover:underline">
                      Cart
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-neutral-900">Legal</div>
                <ul className="space-y-1 text-neutral-700">
                  <li>
                    <a href="#" className="hover:underline">
                      Kebijakan Privasi
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:underline">
                      Syarat Layanan
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:underline">
                      Kebijakan Refund
                    </a>
                  </li>
                </ul>
              </div>
            </nav>

            {/* Contact / Social */}
            <div className="space-y-3">
              <div className="font-medium text-neutral-900">Kontak</div>
              <p className="text-sm text-neutral-700">Ada kebutuhan add-on spesifik? Ngobrol dulu:</p>
              <div className="flex items-center gap-3 pt-1">
                <a href="mailto:hello@devstore.local" className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/60 px-3 py-1.5 text-sm text-neutral-800 ring-1 ring-black/5 hover:bg-white/80 transition">
                  <Mail className="h-4 w-4" />
                  hello@devstore.local
                </a>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <a href="#" aria-label="GitHub" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/60 bg-white/60 ring-1 ring-black/5 hover:bg-white/80 transition">
                  <Github className="h-4 w-4" />
                </a>
                <a href="#" aria-label="Twitter" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/60 bg-white/60 ring-1 ring-black/5 hover:bg-white/80 transition">
                  <Twitter className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* bottom bar */}
          <div className=" flex flex-col items-center justify-between gap-3 border-t border-white/60 pt-6 text-xs text-neutral-600 md:flex-row">
            <div>© {year} DevStore — semua hak dilindungi.</div>
            <div className="flex items-center gap-3">
              <span>Made for builders</span>
              <span className="h-1 w-1 rounded-full bg-neutral-400" />
              <a href="#" className="hover:underline">
                Status
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
