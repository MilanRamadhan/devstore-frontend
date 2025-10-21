import { AddOn, CheckoutPreview, Product } from "./types";

const PLATFORM_FEE_RATE = 0.1; // 10% (dummy)
const TAX_RATE = 0.11; // 11% PPN (opsional; bisa 0 kalau belum butuh)

export function calcLineSubtotal(
  product: Product,
  selectedAddOnIds: string[]
): {
  total: number;
  addOnTotal: number;
  base: number;
  extraSla: number;
} {
  // Handle both camelCase and snake_case from backend
  const base = product.basePrice ?? (product as any).base_price ?? 0;
  const addOns: AddOn[] = (product.addOns || []).filter((a) => selectedAddOnIds.includes(a.id));
  const addOnTotal = addOns.reduce((sum, a) => sum + (a.price ?? 0), 0);
  const extraSla = addOns.reduce((sum, a) => sum + (a.extraSlaDays ?? (a as any).extra_sla_days ?? 0), 0);

  console.log("💰 Price calculation:", {
    product: product.title,
    base,
    addOnsCount: addOns.length,
    addOnTotal,
    total: base + addOnTotal,
  });

  return { total: base + addOnTotal, addOnTotal, base, extraSla };
}

export function checkoutPreview(lines: { total: number }[], baseEtaDays: number): CheckoutPreview {
  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const platformFee = Math.round(subtotal * PLATFORM_FEE_RATE);
  const tax = Math.round((subtotal + platformFee) * TAX_RATE);
  const grandTotal = subtotal + platformFee + tax;
  const etaDays = baseEtaDays; // untuk MVP bisa dihitung dari max(baseSla + extraSla) antar item
  return { subtotal, platformFee, tax, grandTotal, etaDays };
}
