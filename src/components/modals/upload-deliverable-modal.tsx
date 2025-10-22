"use client";

import React, { useState } from "react";
import { ModalRoot, GlassPanel, BtnGlass, BtnPrimary } from "@/components/ui/modal";

export function UploadDeliverableModal({ isOpen, onClose, onSuccess, orderItemId, orderId, productTitle }: { isOpen: boolean; onClose: () => void; onSuccess?: () => void; orderItemId: string; orderId: string; productTitle: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Pilih file terlebih dahulu.");
      return;
    }

    try {
      setIsUploading(true);

      const token = localStorage.getItem("devstore_token");
      if (!token) {
        setIsUploading(false);
        setError("Anda belum login.");
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const form = new FormData();
      form.append("file", file);
      if (note.trim()) form.append("note", note.trim());

      const res = await fetch(`${API_URL}/orders/${orderId}/items/${orderItemId}/deliverables`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "Gagal mengupload deliverable");
      }

      onSuccess?.();
    } catch (err: any) {
      setError(err?.message || "Upload gagal.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ModalRoot isOpen={isOpen} onClose={onClose}>
      <GlassPanel>
        {/* header */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold tracking-tight">Upload Deliverable</h2>
          <p className="text-sm text-neutral-600">{productTitle}</p>
        </div>

        {/* form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-1">
            <span className="text-sm text-neutral-700">File*</span>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm outline-none ring-1 ring-black/5 file:mr-3 file:rounded-lg file:border-0 file:bg-white/80 file:px-3 file:py-1.5 file:text-sm hover:bg-white/80"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm text-neutral-700">Catatan (opsional)</span>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tambahkan catatan untuk buyer…"
              className="w-full resize-none rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm outline-none ring-1 ring-black/5 placeholder:text-neutral-400 focus:bg-white/90"
            />
          </label>

          {error && <div className="rounded-xl border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</div>}

          <div className="mt-2 flex gap-3">
            <BtnGlass type="button" onClick={onClose} disabled={isUploading}>
              Batal
            </BtnGlass>
            <BtnPrimary type="submit" disabled={!file || isUploading}>
              {isUploading ? "Mengupload…" : "Upload"}
            </BtnPrimary>
          </div>
        </form>
      </GlassPanel>
    </ModalRoot>
  );
}

export default UploadDeliverableModal;
