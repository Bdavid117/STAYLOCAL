import { randomUUID } from "node:crypto";
import type {
  Availability,
  AvailabilityRepository,
  Stay,
  StayRepository,
  StayStatus,
  StayWithCover,
} from "@/modules/stays/domain/types";
import { toUtcDate } from "@/modules/stays/domain/dates";

export class InMemoryStayRepository implements StayRepository {
  private store = new Map<string, Stay>();

  seed(stay: Omit<Stay, "id" | "createdAt"> & Partial<Pick<Stay, "id" | "createdAt">>): Stay {
    const s: Stay = {
      id: stay.id ?? randomUUID(),
      createdAt: stay.createdAt ?? new Date(),
      ...stay,
    } as Stay;
    this.store.set(s.id, s);
    return s;
  }

  async findById(id: string): Promise<Stay | null> {
    return this.store.get(id) ?? null;
  }
  async findByIdWithImages(id: string) {
    const s = this.store.get(id);
    return s ? { ...s, images: [] } : null;
  }
  async listByHost(hostId: string): Promise<StayWithCover[]> {
    return [...this.store.values()]
      .filter((s) => s.hostId === hostId && s.status !== "DELETED")
      .map((s) => ({ ...s, coverImageUrl: null }));
  }
  async create(input: Omit<Stay, "id" | "createdAt" | "status">): Promise<Stay> {
    const s: Stay = {
      id: randomUUID(),
      createdAt: new Date(),
      status: "ACTIVE",
      ...input,
    };
    this.store.set(s.id, s);
    return s;
  }
  async update(id: string, patch: Partial<Omit<Stay, "id" | "createdAt" | "hostId">>): Promise<Stay> {
    const s = this.store.get(id);
    if (!s) throw new Error("not found");
    const next = { ...s, ...patch } as Stay;
    this.store.set(id, next);
    return next;
  }
  async softDelete(id: string): Promise<void> {
    const s = this.store.get(id);
    if (s) this.store.set(id, { ...s, status: "DELETED" as StayStatus });
  }
}

export class InMemoryAvailabilityRepository implements AvailabilityRepository {
  private store: Availability[] = [];

  seed(a: Omit<Availability, "id">) {
    this.store.push({ id: randomUUID(), ...a });
  }

  async rangeForStay(stayId: string, from: Date, to: Date): Promise<Availability[]> {
    const f = toUtcDate(from).getTime();
    const t = toUtcDate(to).getTime();
    return this.store.filter(
      (a) => a.stayId === stayId && a.date.getTime() >= f && a.date.getTime() < t
    );
  }
  async blockDates(stayId: string, dates: Date[]): Promise<void> {
    for (const date of dates) {
      const norm = toUtcDate(date);
      const found = this.store.find(
        (a) => a.stayId === stayId && a.date.getTime() === norm.getTime()
      );
      if (found) found.status = "BLOCKED";
      else
        this.store.push({
          id: randomUUID(),
          stayId,
          date: norm,
          status: "BLOCKED",
          bookingId: null,
        });
    }
  }
  async unblockDates(stayId: string, dates: Date[]): Promise<void> {
    const norms = new Set(dates.map((d) => toUtcDate(d).getTime()));
    this.store = this.store.filter(
      (a) => !(a.stayId === stayId && a.status === "BLOCKED" && norms.has(a.date.getTime()))
    );
  }
  list(): Availability[] {
    return [...this.store];
  }
}

// Mock mínimo de PrismaClient para los services que sí necesitan acceso
// directo a la DB (deleteStay cuenta reservas activas).
export function mockPrismaWithBookings(activeBookings: number) {
  return {
    booking: {
      count: async () => activeBookings,
    },
  } as unknown as import("@prisma/client").PrismaClient;
}
