import { describe, it, expect } from "vitest";
import { Prisma } from "@prisma/client";
import { processPayment } from "@/modules/payments/services/process-payment";
import { generateReceipt } from "@/modules/payments/services/generate-receipt";
import {
  BookingNotPayableError,
  PaymentAlreadyExistsError,
  PaymentDeclinedError,
} from "@/modules/payments/services/errors";
import { PrismaPaymentRepository } from "@/modules/payments/repo/payment-repository";
import { HtmlReceiptRenderer } from "@/modules/payments/repo/html-receipt-renderer";
import { InMemoryMailer } from "../users/fakes";
import { FakePrismaClient, asPrisma } from "../bookings/fake-prisma";
import { ControllableGateway } from "./fakes";

const HOST = "host-1";
const GUEST = "guest-a";
const STAY_ID = "stay-1";
const BOOKING_ID = "booking-1";

function seed(amount = 240): {
  db: FakePrismaClient;
  deps: Parameters<typeof processPayment>[2];
  gateway: ControllableGateway;
  mailer: InMemoryMailer;
} {
  const db = new FakePrismaClient();
  db.seedUser({ id: HOST, name: "Anfitrión Demo", email: "host@demo.local" });
  db.seedUser({ id: GUEST, name: "Alice", email: "alice@demo.local" });
  db.seedStay({
    id: STAY_ID,
    hostId: HOST,
    pricePerNight: 120,
    title: "Cabaña editorial",
    locationText: "Salento, Quindío",
  });
  // Inserta una reserva CONFIRMED directamente (saltando createBooking
  // porque acá testeamos solo el flujo de pago).
  db.data.bookings.push({
    id: BOOKING_ID,
    guestId: GUEST,
    stayId: STAY_ID,
    checkIn: new Date(Date.UTC(2099, 7, 1)),
    checkOut: new Date(Date.UTC(2099, 7, 3)),
    totalAmount: new Prisma.Decimal(amount.toString()),
    status: "CONFIRMED",
    createdAt: new Date(),
  });

  const gateway = new ControllableGateway();
  const mailer = new InMemoryMailer();
  const deps = {
    db: asPrisma(db),
    payments: new PrismaPaymentRepository(asPrisma(db)),
    gateway,
    receipts: new HtmlReceiptRenderer(),
    mailer,
  };
  return { db, deps, gateway, mailer };
}

describe("CU-21 processPayment", () => {
  it("ruta feliz: cobra, persiste Payment PAID y envía comprobante", async () => {
    const { db, deps, gateway, mailer } = seed(240);

    const payment = await processPayment(GUEST, BOOKING_ID, deps);

    expect(payment.status).toBe("PAID");
    expect(payment.amount).toBe(240);
    expect(payment.providerRef).toMatch(/^ok_/);
    expect(payment.paidAt).not.toBeNull();

    expect(gateway.charges).toHaveLength(1);
    expect(gateway.charges[0].amount).toBe(240);
    expect(gateway.charges[0].customerEmail).toBe("alice@demo.local");

    expect(db.data.payments).toHaveLength(1);
    expect(db.data.payments[0].status).toBe("PAID");

    expect(mailer.sent).toHaveLength(1);
    expect(mailer.sent[0].to).toBe("alice@demo.local");
    expect(mailer.sent[0].subject).toMatch(/Comprobante StayLocal/);
    expect(mailer.sent[0].html).toContain("Cabaña editorial");
    expect(mailer.sent[0].html).toContain("Pago confirmado");
  });

  it("rechaza si la reserva no pertenece al huésped", async () => {
    const { deps } = seed();
    await expect(
      processPayment("intruso", BOOKING_ID, deps)
    ).rejects.toBeInstanceOf(BookingNotPayableError);
  });

  it("rechaza si la reserva está cancelada", async () => {
    const { db, deps } = seed();
    db.data.bookings[0].status = "CANCELLED";
    await expect(
      processPayment(GUEST, BOOKING_ID, deps)
    ).rejects.toBeInstanceOf(BookingNotPayableError);
  });

  it("rechaza un segundo pago si ya hay uno PAID", async () => {
    const { deps } = seed();
    await processPayment(GUEST, BOOKING_ID, deps);
    await expect(
      processPayment(GUEST, BOOKING_ID, deps)
    ).rejects.toBeInstanceOf(PaymentAlreadyExistsError);
  });

  it("propaga PaymentDeclinedError cuando la pasarela rechaza, marca FAILED y no envía correo", async () => {
    const { db, deps, gateway, mailer } = seed();
    gateway.outcome = "declined";

    await expect(
      processPayment(GUEST, BOOKING_ID, deps)
    ).rejects.toBeInstanceOf(PaymentDeclinedError);

    expect(db.data.payments).toHaveLength(1);
    expect(db.data.payments[0].status).toBe("FAILED");
    expect(mailer.sent).toHaveLength(0);
  });

  it("propaga PaymentDeclinedError cuando la pasarela lanza", async () => {
    const { db, deps, gateway } = seed();
    gateway.outcome = "throws";

    await expect(
      processPayment(GUEST, BOOKING_ID, deps)
    ).rejects.toBeInstanceOf(PaymentDeclinedError);

    expect(db.data.payments[0].status).toBe("FAILED");
  });

  it("permite reintentar tras un FAILED reciclando el mismo Payment", async () => {
    const { db, deps, gateway } = seed();
    gateway.outcome = "declined";
    await expect(
      processPayment(GUEST, BOOKING_ID, deps)
    ).rejects.toBeInstanceOf(PaymentDeclinedError);

    gateway.outcome = "ok";
    const retried = await processPayment(GUEST, BOOKING_ID, deps);

    expect(retried.status).toBe("PAID");
    expect(db.data.payments).toHaveLength(1); // mismo registro, no se duplicó
  });

  it("si el correo falla, el pago igual queda PAID (no se rollbackea)", async () => {
    const { db, deps, mailer } = seed();
    mailer.send = async () => {
      throw new Error("SMTP down");
    };

    const payment = await processPayment(GUEST, BOOKING_ID, deps);

    expect(payment.status).toBe("PAID");
    expect(db.data.payments[0].status).toBe("PAID");
  });
});

describe("CU-22 generateReceipt (aislado)", () => {
  it("envía el HTML al correo del huésped con los datos correctos", async () => {
    const { db, deps, mailer } = seed(300);
    // Crea un Payment PAID a mano para testear generateReceipt aislado.
    const payment = await deps.payments.create({
      bookingId: BOOKING_ID,
      amount: 300,
      currency: "COP",
      provider: "fake",
    });
    await deps.payments.markPaid(payment.id, {
      providerRef: "ok_test_ref",
      paidAt: new Date("2026-08-01T12:00:00Z"),
    });

    const out = await generateReceipt(payment.id, deps);

    expect(out.sentTo).toBe("alice@demo.local");
    expect(out.html).toContain("Cabaña editorial");
    expect(out.html).toContain("Salento, Quindío");
    expect(out.html).toContain("$300");
    expect(out.html).toContain("ok_test_ref");
    expect(out.text).toContain("TOTAL PAGADO: $300");
    expect(mailer.sent).toHaveLength(1);
    expect(mailer.sent[0].subject).toMatch(/Comprobante StayLocal/);

    void db; // referencia inocua para silenciar lint
  });
});
