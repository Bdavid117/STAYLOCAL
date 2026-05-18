import type { PrismaClient } from "@prisma/client";
import type {
  PasswordResetRepository,
  PasswordResetToken,
} from "@/modules/users/domain/types";

export class PrismaPasswordResetRepository implements PasswordResetRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<PasswordResetToken> {
    return this.db.passwordResetToken.create({ data: input });
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null> {
    return this.db.passwordResetToken.findUnique({ where: { tokenHash } });
  }

  async markUsed(id: string): Promise<void> {
    await this.db.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  async deleteAllForUser(userId: string): Promise<void> {
    await this.db.passwordResetToken.deleteMany({ where: { userId } });
  }
}
