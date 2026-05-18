import { randomUUID } from "node:crypto";
import type {
  PaymentChargeInput,
  PaymentChargeResult,
  PaymentGatewayPort,
} from "@/shared/ports/payment-gateway";

// Gateway controlable para tests. Por defecto cobra OK; configurable
// para fallar (rechazo) o lanzar (timeout/red).
export class ControllableGateway implements PaymentGatewayPort {
  outcome: "ok" | "declined" | "throws" = "ok";
  charges: PaymentChargeInput[] = [];

  async charge(input: PaymentChargeInput): Promise<PaymentChargeResult> {
    this.charges.push(input);
    if (this.outcome === "throws") throw new Error("Gateway no responde");
    if (this.outcome === "declined") {
      return { providerRef: `decline_${randomUUID()}`, status: "FAILED" };
    }
    return { providerRef: `ok_${randomUUID()}`, status: "PAID" };
  }
}
