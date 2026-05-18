import { z } from "zod";

// Acepta Date o string ISO/parseable. Útil para inputs que llegan desde
// FormData (siempre string) o desde tests (Date o string). Salida: Date.
export const dateInput = z
  .union([z.date(), z.string().min(1)])
  .transform((v) => (v instanceof Date ? v : new Date(v)))
  .refine((d) => !Number.isNaN(d.getTime()), { message: "Fecha inválida" });
