export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  mimeType?: string;
}

export interface CompressedImageResult {
  file: File;
  previewUrl: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number; // e.g. 85 (% saved)
  width: number;
  height: number;
}

/**
 * Format bytes into human readable string (KB / MB)
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Parse project image_url column value into an array of image URLs
 * Handles both JSON arrays ("[\"url1\", \"url2\"]"), single URLs, and comma-separated strings
 */
export function parseProjectImages(imageUrlStr?: string | null): string[] {
  if (!imageUrlStr || !imageUrlStr.trim()) return [];
  const trimmed = imageUrlStr.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item): item is string => typeof item === "string" && item.trim().length > 0
        );
      }
    } catch (e) {
      console.warn("Could not parse image_url JSON array", e);
    }
  }
  if (trimmed.includes(",")) {
    return trimmed
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }
  return [trimmed];
}

/**
 * Convert HEIC / HEIF file to JPEG blob using heic2any if available
 */
async function ensureStandardImageBlob(file: File): Promise<Blob | File> {
  const isHeic =
    file.name.toLowerCase().endsWith(".heic") ||
    file.name.toLowerCase().endsWith(".heif") ||
    file.type === "image/heic" ||
    file.type === "image/heif";

  if (isHeic && typeof window !== "undefined") {
    try {
      const heic2anyModule = await import("heic2any");
      const heic2any = heic2anyModule.default || heic2anyModule;
      const converted = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.85
      });
      return Array.isArray(converted) ? converted[0] : converted;
    } catch (err) {
      console.warn("Could not convert HEIC with heic2any, attempting normal load:", err);
    }
  }
  return file;
}

/**
 * Compress a single image file via HTML5 Canvas
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressedImageResult> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.78,
    mimeType = "image/jpeg"
  } = options;

  const originalSize = file.size;

  // 1. Convert HEIC if needed
  const normalizedBlob = await ensureStandardImageBlob(file);

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(normalizedBlob);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Scale down while maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          maxHeight;
          height = Math.round((img.height * width) / img.width);
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Cannot get 2d context for image compression"));
        return;
      }

      // Smooth resizing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas toBlob failed"));
            return;
          }

          // Clean base file name and ensure .jpg extension
          const originalBaseName = file.name.replace(/\.[^/.]+$/, "");
          const cleanName = `${originalBaseName.replace(/[^a-zA-Z0-9_\u0E00-\u0E7F-]/g, "_")}.jpg`;
          const compressedFile = new File([blob], cleanName, {
            type: "image/jpeg",
            lastModified: Date.now()
          });

          const compressedSize = blob.size;
          const ratio =
            originalSize > 0
              ? Math.max(0, Math.round((1 - compressedSize / originalSize) * 100))
              : 0;

          const previewUrl = URL.createObjectURL(blob);

          resolve({
            file: compressedFile,
            previewUrl,
            originalSize,
            compressedSize,
            compressionRatio: ratio,
            width,
            height
          });
        },
        mimeType,
        quality
      );
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to load image for compression: ${err}`));
    };

    img.src = objectUrl;
  });
}

/**
 * Batch compress multiple images with progress reporting
 */
export async function compressMultipleImages(
  files: File[],
  onProgress?: (current: number, total: number, fileName: string) => void,
  options?: CompressionOptions
): Promise<CompressedImageResult[]> {
  const results: CompressedImageResult[] = [];
  const total = files.length;

  for (let i = 0; i < total; i++) {
    const file = files[i];
    if (onProgress) {
      onProgress(i + 1, total, file.name);
    }
    try {
      const compressed = await compressImage(file, options);
      results.push(compressed);
    } catch (err) {
      console.error(`Error compressing file ${file.name}:`, err);
    }
  }

  return results;
}
