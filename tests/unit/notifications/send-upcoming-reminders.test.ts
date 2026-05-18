import { describe, it, expect } from "vitest";
import { Prisma } from "@prisma/client";
import { sendUpcomingReminders } from "@/modules/notifications/services/send-upcoming-reminders";
import { PrismaNotificationRepository } from "@/modules/notifications/repo/notification-repository";
import { InMemoryMailer } from "../users/fakes";
import { FakePrismaClient, asPrisma } from "../bookings/fake-prisma";

const GUEST = "guest-a";
const STAY = "stay-1";
const HOST = "host-1";

function setup() {
  const db = new FakePrismaClient();
  db.seedUser({ id: HOST, name: "Anfitrión", email: "h@demo" });
  db.seedUser({ id: GUEST, name: "Alice", email: "alice@demo" });
  db.seedStay({ id: STAY, hostId: HOST, pricePerNight: 100, title: "Cabaña Salento", locationText: "Salento" });
  const mailer = new InMemoryMailer();
  const deps = {
    db: asPrisma(db),
    notifications: new PrismaNotificationRepository(asPrisma(db)),
    mailer,
  };
  return { db, deps, mailer };
}

function pushBooking(
  db: FakePrismaClient,
  id: string,
  daysFromNow: number,
  status: "CONFIRMED" | "CANCELLED" | "PENDING" | "COMPLETED" = "CONFIRMED"
) {
  const checkIn = new Date(Date.now() + daysFromNow * 86_400_000);
  const checkOut = new Date(checkIn.getTime() + 86_400_000);
  db.data.bookings.push({
    id,
    guestId: GUEST,
    stayId: STAY,
    checkIn,
    checkOut,
    totalAmount: new Prisma.Decimal("100"),
    status,
    createdAt: new Date(),
  });
}

describe("CU-27 sendUpcomingReminders", () => {
  it("envía recordatorios para bookings dentro de la ventana de 2 días", async () => {
    const { db, deps, mailer } = setup();
    pushBooking(db, "b-tomorrow", 1);
    pushBooking(db, "b-in-2-days", 2);
    pushBooking(db, "b-in-5-days", 5);

    const result = await sendUpcomingReminders({ daysAhead: 2 }, deps);

    expect(result.considered).toBe(2);
    expect(result.sent).toBe(2);
    expect(db.data.notifications).toHaveLength(2);
    expect(mailer.sent).toHaveLength(2);
    expect(
      db.data.notifications.every((n) => n.type === "REMINDER" && (n.payload as { bookingId: string }).bookingId)
    ).toBe(true);
  });

  it("dedupe: corrida 2 no crea duplicados", async () => {
    const { db, deps, mailer } = setup();
    pushBooking(db, "b-1", 1);

    await sendUpcomingReminders({ daysAhead: 2 }, deps);
    const second = await sendUpcomingReminders({ daysAhead: 2 }, deps);

    expect(second.sent).toBe(0);
    expect(second.skipped).toBe(1);
    expect(db.data.notifications).toHaveLength(1);
    expect(mailer.sent).toHaveLength(1);
  });

  it("ignora bookings cancelados, pendientes o pasados", async () => {
    const { db, deps } = setup();
    pushBooking(db, "b-cancelled", 1, "CANCELLED");
    pushBooking(db, "b-pending", 1, "PENDING");
    pushBooking(db, "b-past", -2);

    const result = await sendUpcomingReminders({ daysAhead: 2 }, deps);

    expect(result.considered).toBe(0);
    expect(result.sent).toBe(0);
    expect(db.data.notifications).toHaveLength(0);
  });

  it("payload incluye daysUntil correctamente", async () => {
    const { db, deps } = setup();
    pushBooking(db, "b-3-days", 3);

    await sendUpcomingReminders({ daysAhead: 5 }, deps);

    const n = db.data.notifications[0];
    expect((n.payload as { daysUntil: number }).daysUntil).toBe(3);
    expect((n.payload as { stayTitle: string }).stayTitle).toBe("Cabaña Salento");
  });
});
