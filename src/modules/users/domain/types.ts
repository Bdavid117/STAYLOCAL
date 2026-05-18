// Tipos del dominio del módulo users. No importan Prisma — eso es
// detalle de infraestructura. Los repos en repo/ implementan estas
// interfaces y los services dependen solo de aquí.

export type UserRole = "GUEST" | "HOST" | "ADMIN";

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string | null;
  photoUrl: string | null;
  passwordHash: string;
  createdAt: Date;
};

export type PublicUser = Omit<User, "passwordHash">;

export type PasswordResetToken = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
};

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(input: {
    email: string;
    passwordHash: string;
    name: string;
    role?: UserRole;
  }): Promise<User>;
  updateProfile(
    id: string,
    patch: { name?: string; phone?: string | null; photoUrl?: string | null }
  ): Promise<User>;
  updatePasswordHash(id: string, passwordHash: string): Promise<void>;
}

export interface PasswordResetRepository {
  create(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<PasswordResetToken>;
  findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null>;
  markUsed(id: string): Promise<void>;
  deleteAllForUser(userId: string): Promise<void>;
}
