// CU-19 Ver Historial Reservas
import { z } from "zod";
import type {
  BookingRepository,
  BookingStatus,
  BookingWithStay,
} from "@/modules/bookings/domain/types";

export const listMyBookingsSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
});

export type ListMyBookingsInput = z.infer<typeof listMyBookingsSchema>;

export async function listMyBookings(
  guestId: string,
  input: ListMyBookingsInput,
  deps: { bookings: BookingRepository }
): Promise<BookingWithStay[]> {
  const { status } = listMyBookingsSchema.parse(input);
  return deps.bookings.listByGuest(guestId, { status: status as BookingStatus | undefined });
}
