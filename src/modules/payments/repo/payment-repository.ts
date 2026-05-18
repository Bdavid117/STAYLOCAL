import type { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import type {
  Payment,
  PaymentRepository,
  PaymentStatus,
} from "@/modules/payments/domain/types";

function toPayment(row: {
  id: string;
  bookingId: string;
  amount: { toNumber(): number } | number;
  currency: string;
  provider: string;
  providerRef: string | null;
  status: string;
  paidAt: Date | null;
}): Payment {
  return {
    ...row,
    amount: typeof row.amount === "number" ? row.amount : row.amount.toNumber(),
    status: row.status as PaymentStatus,
  };
}

export class PrismaPaymentRepository implements PaymentRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByBookingId(bookingId: string): Promise<Payment | null> {
    const row = await this.db.payment.findUnique({ where: { bookingId } });
    return row ? toPayment(row) : null;
  }

  async create(input: {
    bookingId: string;
    amount: number;
    currency: string;
    provider: string;
  }): Promise<Payment> {
    const row = await this.db.payment.create({
      data: {
        bookingId: input.bookingId,
        amount: new Prisma.Decimal(input.amount.toString()),
        currency: input.currency,
        provider: input.provider,
        status: "PENDING",
      },
    });
    return toPayment(row);
  }

  async markPaid(
    id: string,
    patch: { providerRef: string; paidAt: Date }
  ): Promise<Payment> {
    const row = await this.db.payment.update({
      where: { id },
      data: { status: "PAID", providerRef: patch.providerRef, paidAt: patch.paidAt },
    });
    return toPayment(row);
  }

  async markFailed(id: string, providerRef: string | null): Promise<Payment> {
    const row = await this.db.payment.update({
      where: { id },
      data: { status: "FAILED", providerRef: providerRef ?? undefined },
    });
    return toPayment(row);
  }

  async markRefunded(id: string): Promise<Payment> {
    const row = await this.db.payment.update({
      where: { id },
      data: { status: "REFUNDED" },
    });
    return toPayment(row);
  }
}
