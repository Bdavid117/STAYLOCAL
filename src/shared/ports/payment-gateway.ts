// Puerto de pagos (EIF-01). Implementaciones: fake (default) y stripe.
// Los casos de uso NUNCA importan SDKs de pago; dependen solo de este puerto.

export type PaymentChargeInput = {
  bookingId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  description: string;
};

export type PaymentChargeResult = {
  providerRef: string;
  status: "PAID" | "FAILED";
};

export interface PaymentGatewayPort {
  charge(input: PaymentChargeInput): Promise<PaymentChargeResult>;
}
