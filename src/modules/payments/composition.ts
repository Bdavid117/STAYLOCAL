import { prisma } from "@/shared/db";
import { getMailer } from "@/shared/mailer";
import type { PaymentGatewayPort } from "@/shared/ports/payment-gateway";
import { FakePaymentGateway } from "@/modules/payments/repo/fake-payment-gateway";
import { PrismaPaymentRepository } from "@/modules/payments/repo/payment-repository";
import { HtmlReceiptRenderer } from "@/modules/payments/repo/html-receipt-renderer";

function pickGateway(): PaymentGatewayPort {
  const provider = process.env.PAYMENT_PROVIDER ?? "fake";
  // Solo "fake" implementado por ahora. Stripe sandbox iría aquí
  // detrás del mismo puerto cuando se necesite.
  switch (provider) {
    case "fake":
    default:
      return new FakePaymentGateway();
  }
}

export function paymentsDeps() {
  return {
    db: prisma,
    payments: new PrismaPaymentRepository(prisma),
    gateway: pickGateway(),
    receipts: new HtmlReceiptRenderer(),
    mailer: getMailer(),
  };
}
