/**
 * Compress image to reduce file size
 * @param file - Image file to compress
 * @param maxWidth - Maximum width (default: 1200px)
 * @param quality - JPEG quality 0-1 (default: 0.8)
 * @returns Promise<string> - Base64 compressed image
 */
export async function compressImage(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG with quality compression
        const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedBase64);
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
  });
}

/**
 * Get file size from base64 string in KB
 */
export function getBase64Size(base64: string): number {
  const base64Length = base64.length - (base64.indexOf(",") + 1);
  const padding = base64.charAt(base64.length - 2) === "=" ? 2 : base64.charAt(base64.length - 1) === "=" ? 1 : 0;
  const fileSize = base64Length * 0.75 - padding;
  return fileSize / 1024; // Return in KB
}
