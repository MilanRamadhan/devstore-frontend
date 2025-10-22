"use client";

import { useState } from "react";
import { X, Upload, File, AlertCircle } from "lucide-react";

type UploadDeliverableModalProps = {
  isOpen: boolean;
  onClose: () => void;
  orderItemId: string;
  orderId: string;
  productTitle: string;
  onSuccess: () => void;
};

export function UploadDeliverableModal({ isOpen, onClose, orderItemId, orderId, productTitle, onSuccess }: UploadDeliverableModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file size (max 50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError("File terlalu besar. Maksimal 50MB.");
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Pilih file terlebih dahulu");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const token = localStorage.getItem("devstore_token");
      if (!token) {
        setError("Anda belum login");
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("note", note);

      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/items/${orderItemId}/deliverable`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert("✅ File berhasil diupload!");
        onSuccess();
        onClose();
        // Reset form
        setFile(null);
        setNote("");
      } else {
        const data = await response.json();
        setError(data.message || "Gagal upload file");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Terjadi kesalahan saat upload");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-white/60 bg-white/95 p-6 shadow-2xl ring-1 ring-black/5">
        {/* Close button */}
        <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1 transition hover:bg-black/5" disabled={isUploading}>
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-green-600">
            <Upload className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Upload Deliverable</h2>
          </div>
          <p className="mt-1 text-sm text-neutral-600">{productTitle}</p>
        </div>

        {/* File input */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-neutral-700">File Hasil Pekerjaan</label>
          <div className="relative">
            <input
              type="file"
              onChange={handleFileChange}
              disabled={isUploading}
              className="w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm outline-none ring-1 ring-black/5 file:mr-4 file:rounded-lg file:border-0 file:bg-black/90 file:px-3 file:py-1 file:text-xs file:text-white hover:file:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              accept=".zip,.rar,.7z,.pdf,.docx,.xlsx" // Common file types
            />
          </div>
          {file && (
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
              <File className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">{file.name}</span>
              <span className="ml-auto text-xs text-green-600">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          )}
          <p className="mt-1 text-xs text-neutral-500">Format: ZIP, RAR, 7Z, PDF, DOCX, XLSX (Max 50MB)</p>
        </div>

        {/* Note input */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-neutral-700">Catatan (Opsional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isUploading}
            rows={3}
            placeholder="Contoh: File sudah include dokumentasi setup dan demo video"
            className="w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm outline-none ring-1 ring-black/5 placeholder:text-neutral-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={onClose} disabled={isUploading} className="flex-1 rounded-xl border border-white/60 bg-white/70 px-4 py-2 text-sm font-medium transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50">
            Batal
          </button>
          <button onClick={handleUpload} disabled={!file || isUploading} className="flex-1 rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50">
            {isUploading ? "Mengupload..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
