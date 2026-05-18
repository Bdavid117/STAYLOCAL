import { describe, it, expect } from "vitest";
import { deleteStay } from "@/modules/stays/services/delete-stay";
import {
  NotHostError,
  StayHasActiveBookingsError,
  StayNotFoundError,
} from "@/modules/stays/services/errors";
import { InMemoryStayRepository, mockPrismaWithBookings } from "./fakes";

const HOST = "host-1";
const OTHER = "host-2";

function makeStay(stays: InMemoryStayRepository) {
  return stays.seed({
    hostId: HOST,
    title: "Casa",
    description: "x",
    pricePerNight: 100,
    capacity: 2,
    lat: 4.6,
    lng: -74,
    locationText: "Bogotá",
    status: "ACTIVE",
  });
}

describe("CU-10 deleteStay", () => {
  it("soft-deletea cuando no hay reservas activas", async () => {
    const stays = new InMemoryStayRepository();
    const stay = makeStay(stays);

    await deleteStay(HOST, stay.id, {
      stays,
      db: mockPrismaWithBookings(0),
    });

    const reloaded = await stays.findById(stay.id);
    expect(reloaded?.status).toBe("DELETED");
  });

  it("rechaza si hay reservas activas (PENDING/CONFIRMED)", async () => {
    const stays = new InMemoryStayRepository();
    const stay = makeStay(stays);

    await expect(
      deleteStay(HOST, stay.id, { stays, db: mockPrismaWithBookings(2) })
    ).rejects.toBeInstanceOf(StayHasActiveBookingsError);

    const reloaded = await stays.findById(stay.id);
    expect(reloaded?.status).toBe("ACTIVE");
  });

  it("rechaza si el actor no es el dueño", async () => {
    const stays = new InMemoryStayRepository();
    const stay = makeStay(stays);

    await expect(
      deleteStay(OTHER, stay.id, { stays, db: mockPrismaWithBookings(0) })
    ).rejects.toBeInstanceOf(NotHostError);
  });

  it("rechaza si el alojamiento no existe o ya está DELETED", async () => {
    const stays = new InMemoryStayRepository();
    await expect(
      deleteStay(HOST, "no-existe", { stays, db: mockPrismaWithBookings(0) })
    ).rejects.toBeInstanceOf(StayNotFoundError);
  });
});
