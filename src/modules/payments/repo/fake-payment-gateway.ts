import { randomUUID } from "node:crypto";
import type {
  PaymentChargeInput,
  PaymentChargeResult,
  PaymentGatewayPort,
} from "@/shared/ports/payment-gateway";

// Adapter "fake" — siempre cobra OK. Útil para demo académica y tests.
// Cambiar PAYMENT_PROVIDER=stripe en .env para usar Stripe sandbox (a implementar).
export class FakePaymentGateway implements PaymentGatewayPort {
  async charge(_input: PaymentChargeInput): Promise<PaymentChargeResult> {
    return {
      providerRef: `fake_${randomUUID()}`,
      status: "PAID",
    };
  }
}
