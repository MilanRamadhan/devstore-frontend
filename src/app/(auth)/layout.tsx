// src/app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="min-h-dvh grid place-items-center px-4">{children}</main>;
}
