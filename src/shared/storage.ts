import type { StoragePort } from "@/shared/ports/storage";
import { LocalStorage } from "@/modules/stays/repo/local-storage";

let cached: StoragePort | null = null;

export function getStorage(): StoragePort {
  if (cached) return cached;
  cached = new LocalStorage();
  return cached;
}
