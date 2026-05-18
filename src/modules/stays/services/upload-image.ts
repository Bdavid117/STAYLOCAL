// CU-08 Subir Imágenes. Valida tipo y tamaño antes de pasar al storage.

import type {
  StayImage,
  StayImageRepository,
  StayRepository,
} from "@/modules/stays/domain/types";
import type { StoragePort } from "@/shared/ports/storage";
import {
  InvalidImageError,
  NotHostError,
  StayNotFoundError,
} from "./errors";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export type UploadStayImageInput = {
  filename: string;
  contentType: string;
  content: Buffer;
};

export async function uploadStayImage(
  actorId: string,
  stayId: string,
  input: UploadStayImageInput,
  deps: {
    stays: StayRepository;
    images: StayImageRepository;
    storage: StoragePort;
  }
): Promise<StayImage> {
  if (!ALLOWED_TYPES.has(input.contentType)) {
    throw new InvalidImageError("Solo se aceptan imágenes JPG, PNG o WEBP.");
  }
  if (input.content.byteLength === 0) {
    throw new InvalidImageError("El archivo está vacío.");
  }
  if (input.content.byteLength > MAX_BYTES) {
    throw new InvalidImageError("La imagen excede el tamaño máximo de 5 MB.");
  }

  const stay = await deps.stays.findById(stayId);
  if (!stay || stay.status === "DELETED") throw new StayNotFoundError();
  if (stay.hostId !== actorId) throw new NotHostError();

  const stored = await deps.storage.upload(input);
  return deps.images.append(stayId, stored.url);
}
