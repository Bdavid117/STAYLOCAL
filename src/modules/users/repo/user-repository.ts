import type { PrismaClient } from "@prisma/client";
import type { User, UserRepository, UserRole } from "@/modules/users/domain/types";

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { id } }) as Promise<User | null>;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { email } }) as Promise<User | null>;
  }

  async create(input: {
    email: string;
    passwordHash: string;
    name: string;
    role?: UserRole;
  }): Promise<User> {
    return this.db.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        name: input.name,
        role: input.role ?? "GUEST",
      },
    }) as Promise<User>;
  }

  async updateProfile(
    id: string,
    patch: { name?: string; phone?: string | null; photoUrl?: string | null }
  ): Promise<User> {
    return this.db.user.update({
      where: { id },
      data: patch,
    }) as Promise<User>;
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.db.user.update({ where: { id }, data: { passwordHash } });
  }
}
