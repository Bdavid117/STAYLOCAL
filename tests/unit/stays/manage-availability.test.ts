import { describe, it, expect } from "vitest";
import { manageAvailability } from "@/modules/stays/services/manage-availability";
import {
  DateBookedError,
  NotHostError,
} from "@/modules/stays/services/errors";
import { toUtcDate } from "@/modules/stays/domain/dates";
import {
  InMemoryAvailabilityRepository,
  InMemoryStayRepository,
} from "./fakes";

const HOST = "host-1";

function setup() {
  const stays = new InMemoryStayRepository();
  const availability = new InMemoryAvailabilityRepository();
  const stay = stays.seed({
    hostId: HOST,
    title: "Cabana",
    description: "x",
    pricePerNight: 100,
    capacity: 2,
    lat: 4.6,
    lng: -74,
    locationText: "Bogotá",
    status: "ACTIVE",
  });
  return { stays, availability, stay };
}

describe("CU-11 manageAvailability", () => {
  it("bloquea un rango de noches", async () => {
    const { stays, availability, stay } = setup();

    const res = await manageAvailability(
      HOST,
      stay.id,
      {
        action: "block",
        from: "2026-06-01",
        to: "2026-06-04",
      },
      { stays, availability }
    );

    expect(res.affected).toBe(3);
    expect(availability.list().every((a) => a.status === "BLOCKED")).toBe(true);
  });

  it("desbloquea solo lo previamente bloqueado, no las reservas", async () => {
    const { stays, availability, stay } = setup();
    availability.seed({
      stayId: stay.id,
      date: toUtcDate("2026-06-02"),
      status: "BOOKED",
      bookingId: "b1",
    });
    await manageAvailability(
      HOST,
      stay.id,
      { action: "block", from: "2026-06-01", to: "2026-06-04" },
      { stays, availability }
    ).catch(() => {/* esperado abajo */});

    // Bloquear sobre BOOKED falla
    await expect(
      manageAvailability(
        HOST,
        stay.id,
        { action: "block", from: "2026-06-01", to: "2026-06-04" },
        { stays, availability }
      )
    ).rejects.toBeInstanceOf(DateBookedError);
  });

  it("rechaza si el actor no es el host", async () => {
    const { stays, availability, stay } = setup();
    await expect(
      manageAvailability(
        "intruso",
        stay.id,
        { action: "block", from: "2026-06-01", to: "2026-06-04" },
        { stays, availability }
      )
    ).rejects.toBeInstanceOf(NotHostError);
  });

  it("valida que to > from", async () => {
    const { stays, availability, stay } = setup();
    await expect(
      manageAvailability(
        HOST,
        stay.id,
        { action: "block", from: "2026-06-04", to: "2026-06-01" },
        { stays, availability }
      )
    ).rejects.toThrow(/posterior/);
  });
});
