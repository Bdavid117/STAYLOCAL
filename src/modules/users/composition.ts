// Composition root del módulo users — instancia repos cableados a Prisma y
// el mailer real. Las páginas/server actions importan estos helpers en vez
// de armar dependencias en cada lugar.

import { prisma } from "@/shared/db";
import { getMailer } from "@/shared/mailer";
import { PrismaUserRepository } from "@/modules/users/repo/user-repository";
import { PrismaPasswordResetRepository } from "@/modules/users/repo/password-reset-repository";

export function usersDeps() {
  return {
    users: new PrismaUserRepository(prisma),
    tokens: new PrismaPasswordResetRepository(prisma),
    mailer: getMailer(),
    db: prisma,
  };
}
