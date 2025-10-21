"use client";

import React, { useMemo, useState } from "react";
import { useAuth } from "@/store/auth";
import { LogOut, User2, Mail, Globe, ShieldCheck, Bell, CreditCard, Download, FileText, Lock, Check, X, Pencil } from "lucide-react";

/* ================== Page ================== */

type Session = { id: string; device: string; location: string; lastActive: string; current?: boolean };
type Purchase = { id: string; item: string; date: string; total: string; status: "completed" | "refunded" };

export default function ProfilePage() {
  const { user, logout } = useAuth();

  // --- mock state (ganti ke API nanti)
  const [displayName, setDisplayName] = useState(user?.name ?? "");
  const [email] = useState(user?.email ?? "");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");

  const [company, setCompany] = useState("");
  const [taxId, setTaxId] = useState("");
  const [billingEmail, setBillingEmail] = useState(email);
  const [address, setAddress] = useState("");

  // Track editing state & changes
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Original values untuk compare
  const [originalData, setOriginalData] = useState({
    displayName: user?.name ?? "",
    bio: "",
    website: "",
    company: "",
    taxId: "",
    billingEmail: email,
    address: "",
  });

  // Check for changes
  React.useEffect(() => {
    const changed =
      displayName !== originalData.displayName ||
      bio !== originalData.bio ||
      website !== originalData.website ||
      company !== originalData.company ||
      taxId !== originalData.taxId ||
      billingEmail !== originalData.billingEmail ||
      address !== originalData.address;

    setHasChanges(changed);
  }, [displayName, bio, website, company, taxId, billingEmail, address, originalData]);

  const sessions: Session[] = useMemo(
    () => [
      { id: "s1", device: "Chrome • Windows", location: "ID • Bandung", lastActive: "Barusan", current: true },
      { id: "s2", device: "Safari • iPhone", location: "ID • Jakarta", lastActive: "Kemarin 14:21" },
    ],
    []
  );

  const purchases: Purchase[] = useMemo(
    () => [
      { id: "ORD-12091", item: "Next.js SaaS Starter", date: "12 Feb 2025", total: "Rp 1.500.000", status: "completed" },
      { id: "ORD-12034", item: "Unity 2D Platformer Kit", date: "04 Feb 2025", total: "Rp 1.200.000", status: "completed" },
    ],
    []
  );

  function toggleEdit() {
    if (isEditing && hasChanges) {
      // Simpan perubahan
      const newData = {
        displayName,
        bio,
        website,
        company,
        taxId,
        billingEmail,
        address,
      };
      setOriginalData(newData);
      alert("Profil disimpan (mock). Sambungkan ke API untuk persist.");
      setHasChanges(false);
    }
    setIsEditing(!isEditing);
  }

  function revokeSession(id: string) {
    alert(`Session ${id} dihapus (mock).`);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Profil</h1>
            {isEditing && <span className="rounded-full bg-blue-500/90 px-2.5 py-0.5 text-xs font-medium text-white">Mode Edit</span>}
          </div>
          <p className="text-sm text-neutral-600">{isEditing ? "Ubah informasi profil kamu, lalu klik Simpan perubahan." : "Atur info akun, preferensi, keamanan, dan billing kamu."}</p>
        </div>
        <div className="flex gap-2">
          {isEditing && (
            <button
              onClick={() => {
                // Reset ke nilai original
                setDisplayName(originalData.displayName);
                setBio(originalData.bio);
                setWebsite(originalData.website);
                setCompany(originalData.company);
                setTaxId(originalData.taxId);
                setBillingEmail(originalData.billingEmail);
                setAddress(originalData.address);
                setIsEditing(false);
                setHasChanges(false);
              }}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-4 py-2 text-sm font-medium text-neutral-900 backdrop-blur-xl ring-1 ring-black/5 transition hover:bg-white/80"
            >
              <X className="h-4 w-4" />
              Batal
            </button>
          )}
          <button
            onClick={toggleEdit}
            disabled={isEditing && !hasChanges}
            className={[
              "group relative inline-flex items-center gap-2 justify-center rounded-2xl border border-white/60 px-4 py-2 text-sm font-medium backdrop-blur-xl ring-1 ring-black/5 transition",
              isEditing && hasChanges
                ? "bg-black/90 text-white hover:bg-black hover:shadow-[0_6px_24px_rgba(0,0,0,0.15)]"
                : isEditing && !hasChanges
                ? "bg-white/40 text-neutral-400 cursor-not-allowed"
                : "bg-white/70 text-neutral-900 hover:bg-white/80 hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)]",
            ].join(" ")}
          >
            {isEditing ? (
              <>
                <Check className="h-4 w-4" />
                {hasChanges ? "Simpan perubahan" : "Tidak ada perubahan"}
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4" />
                Edit Profil
              </>
            )}
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/5" />
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/90 text-white text-base">{getInitials(user?.name ?? user?.email ?? "U")}</div>
              <div>
                <div className="font-medium">{displayName || user?.name || "User"}</div>
                <div className="text-sm text-neutral-600">{email}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2">
              <button className="group relative rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-sm font-medium text-neutral-800 backdrop-blur-xl ring-1 ring-black/5 transition hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] hover:bg-white/70">
                <span className="relative z-10">Ganti avatar</span>
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-black/5" />
              </button>
              <button
                className="group relative inline-flex items-center justify-center gap-2 rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-sm font-medium text-neutral-800 backdrop-blur-xl ring-1 ring-black/5 transition hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] hover:bg-white/70"
                onClick={() => alert("Keluar dari semua sesi (mock)")}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Keluar
                </span>
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-black/5" />
              </button>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="mb-3 font-medium">Keamanan cepat</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-neutral-700">
                <ShieldCheck className="h-4 w-4" /> 2FA <span className="ml-auto rounded-full bg-black/90 px-2 text-[10px] leading-5 text-white">Soon</span>
              </li>
              <li className="flex items-center gap-2 text-neutral-700">
                <Bell className="h-4 w-4" /> Login alert <span className="ml-auto text-neutral-500">Aktif</span>
              </li>
            </ul>
          </GlassCard>
        </div>

        {/* Main */}
        <div className="space-y-6">
          {/* Akun (Inline edit) */}
          <GlassCard className="p-6">
            <SectionTitle icon={<User2 className="h-4 w-4" />} title="Akun" desc="Nama tampilan, bio, dan tautan publikmu." />

            <div className="mt-4 grid gap-5 md:grid-cols-2">
              {/* Nama tampilan */}
              <Field label="Nama tampilan">
                {isEditing ? (
                  <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Nama kamu" />
                ) : (
                  <div className="min-h-[40px] w-full rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-sm ring-1 ring-black/5 text-neutral-800">{displayName || "—"}</div>
                )}
              </Field>

              {/* Email utama (read-only) */}
              <Field label="Email (utama)">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-neutral-500" />
                  <span className="inline-flex min-h-[40px] items-center rounded-xl border border-white/60 bg-white/60 px-3 text-sm ring-1 ring-black/5 text-neutral-700">{email}</span>
                </div>
                <p className="mt-1 text-xs text-neutral-500">Email ini dipakai untuk login & notifikasi.</p>
              </Field>

              {/* Bio singkat */}
              <Field className="md:col-span-2" label="Bio singkat">
                {isEditing ? (
                  <div>
                    <Textarea
                      rows={4}
                      value={bio}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v.length <= 160) setBio(v);
                      }}
                      placeholder="Cerita singkat tentang kamu sebagai pembeli/developer…"
                    />
                    <div className="mt-1 text-xs text-neutral-500 text-right">{bio?.length ?? 0}/160</div>
                  </div>
                ) : (
                  <div className="min-h-[40px] w-full rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-sm ring-1 ring-black/5 text-neutral-800">
                    {bio ? <span className="whitespace-pre-wrap break-words">{bio}</span> : <span className="text-neutral-400">—</span>}
                  </div>
                )}
              </Field>

              {/* Website */}
              <Field label="Website">
                {isEditing ? (
                  <InputIcon icon={<Globe className="h-4 w-4 text-neutral-500" />}>
                    <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://contoh.com" />
                  </InputIcon>
                ) : (
                  <div className="min-h-[40px] w-full rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-sm ring-1 ring-black/5 text-neutral-800">{website || "—"}</div>
                )}
              </Field>
            </div>
          </GlassCard>

          {/* Keamanan */}
          <GlassCard className="p-6">
            <SectionTitle icon={<ShieldCheck className="h-4 w-4" />} title="Keamanan" desc="Ganti password & kelola sesi aktif." />

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Field label="Password sekarang">
                <Input type="password" placeholder="••••••••" />
              </Field>
              <Field label="Password baru">
                <Input type="password" placeholder="••••••••" />
              </Field>
              <Field label="Ulangi password baru">
                <Input type="password" placeholder="••••••••" />
              </Field>
            </div>

            <div className="mt-3">
              <button
                onClick={() => alert("Ganti password (mock).")}
                className="group relative inline-flex items-center justify-center rounded-2xl border border-white/60 bg-white/60 px-5 py-2.5 text-sm font-medium text-neutral-800 backdrop-blur-xl ring-1 ring-black/5 transition hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] hover:bg-white/70"
              >
                <span className="relative z-10">Ganti password</span>
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/5" />
              </button>
            </div>
          </GlassCard>

          {/* Billing */}
          <GlassCard className="p-6">
            <SectionTitle icon={<CreditCard className="h-4 w-4" />} title="Billing" desc="Data invoice kamu (opsional)." />
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Perusahaan / Nama legal">
                {isEditing ? (
                  <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="PT/CV..." />
                ) : (
                  <div className="min-h-[40px] w-full rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-sm ring-1 ring-black/5 text-neutral-800">{company || "—"}</div>
                )}
              </Field>
              <Field label="NPWP / Tax ID">
                {isEditing ? (
                  <Input value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="XX.XXX.XXX.X-XXX.XXX" />
                ) : (
                  <div className="min-h-[40px] w-full rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-sm ring-1 ring-black/5 text-neutral-800">{taxId || "—"}</div>
                )}
              </Field>
              <Field label="Email invoice">
                {isEditing ? (
                  <Input value={billingEmail} onChange={(e) => setBillingEmail(e.target.value)} placeholder="billing@..." />
                ) : (
                  <div className="min-h-[40px] w-full rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-sm ring-1 ring-black/5 text-neutral-800">{billingEmail || "—"}</div>
                )}
              </Field>
              <Field className="md:col-span-2" label="Alamat penagihan">
                {isEditing ? (
                  <Textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} placeholder="Alamat lengkap..." />
                ) : (
                  <div className="min-h-[40px] w-full rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-sm ring-1 ring-black/5 text-neutral-800">
                    {address ? <span className="whitespace-pre-wrap break-words">{address}</span> : <span className="text-neutral-400">—</span>}
                  </div>
                )}
              </Field>
            </div>
          </GlassCard>

          {/* Pembelian */}
          <GlassCard className="p-6">
            <SectionTitle icon={<FileText className="h-4 w-4" />} title="Pembelian" desc="Download & invoice belanjaanmu." />
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/60 bg-white/60 ring-1 ring-black/5">
              <table className="w-full text-sm">
                <thead className="text-left text-neutral-600">
                  <tr className="[&>th]:px-4 [&>th]:py-2">
                    <th>ID</th>
                    <th>Item</th>
                    <th>Tanggal</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th className="text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {purchases.map((o) => (
                    <tr key={o.id} className="[&>td]:px-4 [&>td]:py-3">
                      <td className="font-mono text-xs">{o.id}</td>
                      <td className="font-medium">{o.item}</td>
                      <td>{o.date}</td>
                      <td>{o.total}</td>
                      <td>
                        <span className="rounded-full bg-emerald-500/90 px-2 text-[10px] leading-5 text-white">{o.status === "completed" ? "Selesai" : "Refund"}</span>
                      </td>
                      <td className="text-right">
                        <div className="inline-flex gap-2">
                          <button className="group relative inline-flex items-center gap-1.5 rounded-xl border border-white/60 bg-white/60 px-3 py-1.5 text-xs font-medium text-neutral-800 backdrop-blur-xl ring-1 ring-black/5 transition hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] hover:bg-white/70">
                            <span className="relative z-10 flex items-center gap-1.5">
                              <Download className="h-3.5 w-3.5" /> Download
                            </span>
                            <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-black/5" />
                          </button>
                          <button className="group relative inline-flex items-center gap-1.5 rounded-xl border border-white/60 bg-white/60 px-3 py-1.5 text-xs font-medium text-neutral-800 backdrop-blur-xl ring-1 ring-black/5 transition hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] hover:bg-white/70">
                            <span className="relative z-10 flex items-center gap-1.5">
                              <FileText className="h-3.5 w-3.5" /> Invoice
                            </span>
                            <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-black/5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!purchases.length && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-neutral-600">
                        Belum ada pembelian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* Danger zone */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-red-700">Hapus akun</h4>
                <p className="text-sm text-neutral-600">Aksi ini permanen dan tidak bisa dibatalkan.</p>
              </div>
              <button
                className="group relative inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 hover:shadow-[0_6px_24px_rgba(220,38,38,0.25)]"
                onClick={() => alert("Hapus akun (mock).")}
              >
                <span className="relative z-10">Hapus</span>
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

/* ================== Helpers & small components ================== */

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={"rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl ring-1 ring-black/5 " + className}>{children}</div>;
}

function SectionTitle({ icon, title, desc }: { icon: React.ReactNode; title: string; desc?: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/60 bg-white/60 ring-1 ring-black/5">{icon}</div>
      <div>
        <div className="font-medium">{title}</div>
        {desc && <div className="text-sm text-neutral-600">{desc}</div>}
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={"block space-y-1 " + className}>
      <span className="text-sm text-neutral-700">{label}</span>
      {children}
    </label>
  );
}

function Chip({ active, children, onClick, disabled }: { active?: boolean; children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "rounded-full px-3 py-1.5 text-sm transition",
        active ? "bg-white/80 text-neutral-900 ring-1 ring-black/5" : "border border-white/60 bg-white/60 text-neutral-700 ring-1 ring-black/5",
        disabled ? "cursor-not-allowed opacity-60" : "hover:bg-white/75",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Toggle({ label, checked, onChange, disabled }: { label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={["flex w-full items-center justify-between rounded-xl border border-white/60 bg-white/60 px-3 py-2 ring-1 ring-black/5", disabled ? "cursor-not-allowed opacity-60" : "hover:bg-white/70"].join(" ")}
    >
      <span className="text-sm text-neutral-800">{label}</span>
      <span className={["inline-flex h-5 w-9 items-center rounded-full transition", checked ? "bg-black/90" : "bg-black/10"].join(" ")}>
        <span className={["h-4 w-4 rounded-full bg-white transition", checked ? "translate-x-4" : "translate-x-1"].join(" ")} />
      </span>
    </button>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return <input {...rest} className={["w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm", "outline-none ring-1 ring-black/5 placeholder:text-neutral-400 focus:bg-white/90", className].join(" ")} />;
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return <textarea {...rest} className={["w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm", "outline-none ring-1 ring-black/5 placeholder:text-neutral-400 focus:bg-white/90 resize-none", className].join(" ")} />;
}

/* merge class helper */
function cx(...parts: Array<string | undefined | false | null>) {
  return parts.filter(Boolean).join(" ");
}

/** Anak wajib element yang punya className (input/textarea) */
function InputIcon({ icon, children }: { icon: React.ReactNode; children: React.ReactElement<any> }) {
  const childWithPadding = React.cloneElement(children, {
    className: cx(children.props.className, "pl-9"),
  } as any);
  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>
      {childWithPadding}
    </div>
  );
}

/** Inline-edit: tampilan teks → klik Edit → jadi input/textarea */
function EditableField({
  value,
  onSave,
  placeholder,
  multiline,
  prefixIcon,
  maxLength,
  helperRight,
}: {
  value: string;
  onSave: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  prefixIcon?: React.ReactNode;
  maxLength?: number;
  helperRight?: React.ReactNode;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value ?? "");

  React.useEffect(() => setDraft(value ?? ""), [value]);

  const submit = () => {
    onSave(draft.trim());
    setEditing(false);
  };
  const cancel = () => {
    setDraft(value ?? "");
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="flex items-center justify-between gap-2">
        <div className="min-h-[40px] w-full rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-sm ring-1 ring-black/5 text-neutral-800">
          {value ? <span className="whitespace-pre-wrap break-words">{value}</span> : <span className="text-neutral-400">{placeholder ?? "—"}</span>}
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="group relative ml-2 inline-flex items-center gap-1.5 rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-sm font-medium text-neutral-800 backdrop-blur-xl ring-1 ring-black/5 transition hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] hover:bg-white/70"
        >
          <span className="relative z-10 flex items-center gap-1.5">
            <Pencil className="h-4 w-4" />
            Edit
          </span>
          <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-black/5" />
        </button>
      </div>
    );
  }

  return (
    <div>
      {multiline ? (
        <Textarea
          rows={4}
          value={draft}
          onChange={(e) => {
            const v = e.target.value;
            if (typeof maxLength === "number" && v.length > maxLength) return;
            setDraft(v);
          }}
          placeholder={placeholder}
        />
      ) : prefixIcon ? (
        <InputIcon icon={prefixIcon}>
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={placeholder} />
        </InputIcon>
      ) : (
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={placeholder} />
      )}

      <div className="mt-2 flex items-center justify-between">
        <div className="text-xs text-neutral-500">{helperRight ? <span>{helperRight}</span> : <span>&nbsp;</span>}</div>
        <div className="inline-flex gap-2">
          <button
            type="button"
            onClick={cancel}
            className="group relative inline-flex items-center gap-1.5 rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-sm font-medium text-neutral-800 backdrop-blur-xl ring-1 ring-black/5 transition hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] hover:bg-white/70"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <X className="h-4 w-4" />
              Batal
            </span>
            <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-black/5" />
          </button>
          <button
            type="button"
            onClick={submit}
            className="group relative inline-flex items-center gap-1.5 rounded-2xl border border-white/60 bg-white/70 px-3 py-2 text-sm font-medium text-neutral-900 backdrop-blur-xl ring-1 ring-black/5 transition hover:bg-white/80 hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)]"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <Check className="h-4 w-4" />
              Simpan
            </span>
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/** toggle helper untuk chips */
function toggleValue<T>(v: T, _list: T[], set: React.Dispatch<React.SetStateAction<T[]>>) {
  set((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
}

function getInitials(str: string) {
  return str
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

/* ====== tiny button styles (utility) ====== */
function BtnGhost({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="btn-ghost">
      {children}
    </button>
  );
}
