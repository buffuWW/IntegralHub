import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { FileStorageService, StoredFile } from "@/lib/storage/types";
import { getImageMimeType } from "@/lib/storage/validation";

const defaultRoot = path.join(process.cwd(), "storage", "uploads");
const root = process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : defaultRoot;

function resolveStoragePath(storagePath: string): string {
  const resolved = path.join(root, storagePath);
  if (!resolved.startsWith(root)) throw new Error("Storage path is outside upload directory");
  return resolved;
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

function makeStoredName(originalFileName: string): string {
  const ext = path.extname(originalFileName).toLowerCase();
  return `${crypto.randomUUID()}${ext}`;
}

export const localStorageService: FileStorageService = {
  async save(buffer, targetDir, originalFileName): Promise<StoredFile> {
    const storedFileName = makeStoredName(originalFileName);
    const storagePath = path.posix.join(targetDir.replaceAll("\\", "/"), storedFileName);
    const absolute = resolveStoragePath(storagePath);
    await ensureDir(path.dirname(absolute));
    await fs.writeFile(absolute, buffer);
    return {
      originalFileName,
      storedFileName,
      storagePath,
      mimeType: getImageMimeType(originalFileName) ?? "application/octet-stream",
      sizeBytes: buffer.byteLength
    };
  },
  async read(storagePath) {
    return fs.readFile(resolveStoragePath(storagePath));
  },
  async delete(storagePath) {
    await fs.rm(resolveStoragePath(storagePath), { force: true });
  },
  async move(tempPath, targetDir, originalFileName) {
    const buffer = await fs.readFile(tempPath);
    await fs.rm(tempPath, { force: true });
    return this.save(buffer, targetDir, originalFileName);
  },
  async exists(storagePath) {
    try {
      await fs.access(resolveStoragePath(storagePath));
      return true;
    } catch {
      return false;
    }
  }
};
