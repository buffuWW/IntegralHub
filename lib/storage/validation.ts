import path from "node:path";

const allowedExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]);
const mimeByExtension: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml"
};

export function isSafeFileName(fileName: string): boolean {
  return fileName === path.basename(fileName) && !fileName.includes("..") && !/[\\/]/.test(fileName);
}

export function getImageMimeType(fileName: string): string | null {
  const ext = path.extname(fileName).toLowerCase();
  return allowedExtensions.has(ext) ? mimeByExtension[ext] : null;
}

export function validateSvgContent(content: string): string | null {
  const lower = content.toLowerCase();
  if (/<script|on\w+=|href=["']https?:|xlink:href=["']https?:|<iframe|<foreignobject/.test(lower)) {
    return "SVG содержит потенциально опасный код или внешние ресурсы";
  }
  return null;
}
