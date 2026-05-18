import { describe, it, expect } from "vitest";
import {
  sendNotification,
  notifyQuiet,
} from "@/modules/notifications/services/send-notification";
import { markAllRead } from "@/modules/notifications/services/mark-read";
import { PrismaNotificationRepository } from "@/modules/notifications/repo/notification-repository";
import { InMemoryMailer } from "../users/fakes";
import { FakePrismaClient, asPrisma } from "../bookings/fake-prisma";

const USER = "user-1";

function setup(): {
  db: FakePrismaClient;
  deps: Parameters<typeof sendNotification>[1];
  mailer: InMemoryMailer;
} {
  const db = new FakePrismaClient();
  db.seedUser({ id: USER, name: "Alice", email: "alice@demo" });
  const mailer = new InMemoryMailer();
  return {
    db,
    deps: {
      db: asPrisma(db),
      notifications: new PrismaNotificationRepository(asPrisma(db)),
      mailer,
    },
    mailer,
  };
}

describe("CU-26 sendNotification", () => {
  it("crea la notificación en DB sin enviar correo si email=false", async () => {
    const { db, deps, mailer } = setup();
    const n = await sendNotification(
      {
        userId: USER,
        type: "BOOKING_CREATED",
        payload: { bookingId: "b1", stayTitle: "Cabaña", checkIn: "2026-08-01" },
      },
      deps
    );
    expect(n.type).toBe("BOOKING_CREATED");
    expect(n.readAt).toBeNull();
    expect(db.data.notifications).toHaveLength(1);
    expect(mailer.sent).toHaveLength(0);
  });

  it("envía correo cuando email=true", async () => {
    const { mailer, deps } = setup();
    await sendNotification(
      {
        userId: USER,
        type: "REMINDER",
        payload: { bookingId: "b1", stayTitle: "Cabaña Salento", daysUntil: 2 },
        email: true,
      },
      deps
    );
    expect(mailer.sent).toHaveLength(1);
    expect(mailer.sent[0].to).toBe("alice@demo");
    expect(mailer.sent[0].subject).toMatch(/Faltan 2 días/);
  });

  it("notifyQuiet no propaga errores de mailer", async () => {
    const { deps, mailer } = setup();
    mailer.send = async () => {
      throw new Error("SMTP down");
    };
    await expect(
      notifyQuiet(
        { userId: USER, type: "REMINDER", payload: { bookingId: "b1" }, email: true },
        deps
      )
    ).resolves.toBeUndefined();
  });

  it("markAllRead marca todas las pendientes del usuario", async () => {
    const { db, deps } = setup();
    await sendNotification({ userId: USER, type: "BOOKING_CREATED", payload: {} }, deps);
    await sendNotification({ userId: USER, type: "PAYMENT_RECEIVED", payload: {} }, deps);

    const count = await markAllRead(USER, { notifications: deps.notifications });

    expect(count).toBe(2);
    expect(db.data.notifications.every((n) => n.readAt !== null)).toBe(true);
  });
});
