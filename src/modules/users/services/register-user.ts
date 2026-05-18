// CU-01 Registrarse
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { PublicUser, UserRepository } from "@/modules/users/domain/types";
import { EmailAlreadyRegisteredError } from "./errors";

export const registerUserSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;

export async function registerUser(
  input: RegisterUserInput,
  deps: { users: UserRepository }
): Promise<PublicUser> {
  const data = registerUserSchema.parse(input);

  const existing = await deps.users.findByEmail(data.email);
  if (existing) throw new EmailAlreadyRegisteredError();

  const passwordHash = await bcrypt.hash(data.password, 12);

  const created = await deps.users.create({
    email: data.email,
    name: data.name,
    passwordHash,
  });

  const { passwordHash: _ph, ...publicUser } = created;
  return publicUser;
}
