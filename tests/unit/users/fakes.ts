import { randomUUID } from "node:crypto";
import type {
  PasswordResetRepository,
  PasswordResetToken,
  User,
  UserRepository,
  UserRole,
} from "@/modules/users/domain/types";
import type { MailerPort, SendMailInput } from "@/shared/ports/mailer";

export class InMemoryUserRepository implements UserRepository {
  private store = new Map<string, User>();

  async findById(id: string): Promise<User | null> {
    return this.store.get(id) ?? null;
  }
  async findByEmail(email: string): Promise<User | null> {
    for (const u of this.store.values()) if (u.email === email) return u;
    return null;
  }
  async create(input: {
    email: string;
    passwordHash: string;
    name: string;
    role?: UserRole;
  }): Promise<User> {
    const user: User = {
      id: randomUUID(),
      email: input.email,
      passwordHash: input.passwordHash,
      name: input.name,
      role: input.role ?? "GUEST",
      phone: null,
      photoUrl: null,
      createdAt: new Date(),
    };
    this.store.set(user.id, user);
    return user;
  }
  async updateProfile(
    id: string,
    patch: { name?: string; phone?: string | null; photoUrl?: string | null }
  ): Promise<User> {
    const u = this.store.get(id);
    if (!u) throw new Error("not found");
    const next = { ...u, ...patch };
    this.store.set(id, next);
    return next;
  }
  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    const u = this.store.get(id);
    if (!u) throw new Error("not found");
    this.store.set(id, { ...u, passwordHash });
  }
}

export class InMemoryPasswordResetRepository implements PasswordResetRepository {
  private store = new Map<string, PasswordResetToken>();

  async create(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<PasswordResetToken> {
    const t: PasswordResetToken = {
      id: randomUUID(),
      userId: input.userId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
      usedAt: null,
      createdAt: new Date(),
    };
    this.store.set(t.id, t);
    return t;
  }
  async findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null> {
    for (const t of this.store.values()) if (t.tokenHash === tokenHash) return t;
    return null;
  }
  async markUsed(id: string): Promise<void> {
    const t = this.store.get(id);
    if (!t) throw new Error("not found");
    this.store.set(id, { ...t, usedAt: new Date() });
  }
  async deleteAllForUser(userId: string): Promise<void> {
    for (const [k, v] of this.store.entries()) {
      if (v.userId === userId) this.store.delete(k);
    }
  }
  // Helper para tests:
  list(): PasswordResetToken[] {
    return [...this.store.values()];
  }
}

export class InMemoryMailer implements MailerPort {
  sent: SendMailInput[] = [];
  async send(input: SendMailInput): Promise<void> {
    this.sent.push(input);
  }
}
