// Tipos de dominio del módulo payments. Los services dependen de las
// interfaces; los repos las implementan con Prisma.

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type Payment = {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  provider: string;
  providerRef: string | null;
  status: PaymentStatus;
  paidAt: Date | null;
};

export interface PaymentRepository {
  findByBookingId(bookingId: string): Promise<Payment | null>;
  create(input: {
    bookingId: string;
    amount: number;
    currency: string;
    provider: string;
  }): Promise<Payment>;
  markPaid(
    id: string,
    patch: { providerRef: string; paidAt: Date }
  ): Promise<Payment>;
  markFailed(id: string, providerRef: string | null): Promise<Payment>;
  markRefunded(id: string): Promise<Payment>;
}

// Datos enriquecidos que necesita el renderer del comprobante para CU-22.
export type ReceiptInput = {
  payment: Payment;
  booking: {
    id: string;
    checkIn: Date;
    checkOut: Date;
    nights: number;
  };
  stay: {
    title: string;
    locationText: string;
    pricePerNight: number;
  };
  guest: {
    name: string;
    email: string;
  };
  hostName: string;
};

export interface ReceiptRenderer {
  /** Renderiza un comprobante imprimible (HTML rich). */
  toHtml(input: ReceiptInput): string;
  /** Versión texto plano para fallback de correo. */
  toText(input: ReceiptInput): string;
}
