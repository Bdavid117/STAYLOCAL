import { randomUUID } from "node:crypto";
import { writeFile, unlink, mkdir } from "node:fs/promises";
import path from "node:path";
import type { StoragePort, StoredFile } from "@/shared/ports/storage";

// Escribe a /public/uploads/<uuid>.<ext>. Devuelve URL pública /uploads/...
export class LocalStorage implements StoragePort {
  private readonly uploadsDir = path.join(process.cwd(), "public", "uploads");

  async upload(input: {
    filename: string;
    content: Buffer;
    contentType: string;
  }): Promise<StoredFile> {
    await mkdir(this.uploadsDir, { recursive: true });
    const ext = pickExtension(input.filename, input.contentType);
    const stored = `${randomUUID()}${ext}`;
    const dest = path.join(this.uploadsDir, stored);
    await writeFile(dest, input.content);
    return { url: `/uploads/${stored}`, bytes: input.content.byteLength };
  }

  async delete(url: string): Promise<void> {
    if (!url.startsWith("/uploads/")) return;
    const file = url.replace(/^\/uploads\//, "");
    if (file.includes("/") || file.includes("..")) return;
    try {
      await unlink(path.join(this.uploadsDir, file));
    } catch {
      // Idempotente: si ya no existe, ok.
    }
  }
}

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

function pickExtension(filename: string, contentType: string): string {
  const fromType = EXT_BY_TYPE[contentType];
  if (fromType) return fromType;
  const ext = path.extname(filename).toLowerCase();
  return ext && ext.length <= 5 ? ext : ".bin";
}
