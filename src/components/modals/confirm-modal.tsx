"use client";

import { ModalRoot, GlassPanel, BtnGlass, BtnPrimary } from "@/components/ui/modal";
import { AlertCircle } from "lucide-react";

export function ConfirmModal({
  open,
  title = "Konfirmasi",
  description,
  confirmText = "Lanjut",
  cancelText = "Batal",
  onConfirm,
  onClose,
  loading = false,
}: {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  loading?: boolean;
}) {
  if (!open) return null;

  return (
    <ModalRoot isOpen={open} onClose={onClose}>
      <GlassPanel>
        {/* header */}
        <div className="mb-3 flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/60 bg-white/70 ring-1 ring-black/5">
            <AlertCircle className="h-5 w-5 text-neutral-900" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            {description && <p className="text-sm text-neutral-600">{description}</p>}
          </div>
        </div>

        {/* footer */}
        <div className="mt-4 flex gap-3">
          <BtnGlass onClick={onClose} disabled={loading}>
            {cancelText}
          </BtnGlass>
          <BtnPrimary
            onClick={async () => {
              await onConfirm();
            }}
            disabled={loading}
          >
            {loading ? "Memproses…" : confirmText}
          </BtnPrimary>
        </div>
      </GlassPanel>
    </ModalRoot>
  );
}

export default ConfirmModal;
