// CU-04 Editar Perfil
import { z } from "zod";
import type { PublicUser, UserRepository } from "@/modules/users/domain/types";
import { UserNotFoundError } from "./errors";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2),
  phone: z
    .string()
    .trim()
    .regex(/^\+?\d{7,15}$/, "Teléfono inválido")
    .nullish()
    .or(z.literal("").transform(() => null)),
  photoUrl: z.string().url("URL inválida").nullish().or(z.literal("").transform(() => null)),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
  deps: { users: UserRepository }
): Promise<PublicUser> {
  const data = updateProfileSchema.parse(input);

  const existing = await deps.users.findById(userId);
  if (!existing) throw new UserNotFoundError();

  const updated = await deps.users.updateProfile(userId, {
    name: data.name,
    phone: data.phone ?? null,
    photoUrl: data.photoUrl ?? null,
  });

  const { passwordHash: _ph, ...publicUser } = updated;
  return publicUser;
}
