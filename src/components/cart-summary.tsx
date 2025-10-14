import { formatIDR } from "@/lib/format";

export default function CartSummary({ subtotal, platformFee, tax, grandTotal, action }: { subtotal: number; platformFee: number; tax: number; grandTotal: number; action?: React.ReactNode }) {
  return (
    <div className="border rounded-2xl p-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span>Subtotal</span>
        <span>{formatIDR(subtotal)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Platform Fee</span>
        <span>{formatIDR(platformFee)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>PPN</span>
        <span>{formatIDR(tax)}</span>
      </div>
      <div className="border-t my-2" />
      <div className="flex justify-between font-semibold">
        <span>Total</span>
        <span>{formatIDR(grandTotal)}</span>
      </div>
      {action}
    </div>
  );
}
