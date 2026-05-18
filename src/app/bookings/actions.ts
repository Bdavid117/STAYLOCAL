"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { auth } from "@/shared/auth";
import { bookingsDeps } from "@/modules/bookings/composition";
import { createBooking } from "@/modules/bookings/services/create-booking";
import { cancelBooking } from "@/modules/bookings/services/cancel-booking";
import {
  BookingConflictError,
  BookingNotFoundError,
  CannotCancelError,
  HostCannotBookOwnStayError,
  StayNotBookableError,
} from "@/modules/bookings/services/errors";

export type BookingActionState = { ok?: boolean; error?: string; bookingId?: string } | null;

function mapError(err: unknown): string {
  if (err instanceof ZodError) return err.issues[0]?.message ?? "Datos inválidos";
  if (
    err instanceof BookingConflictError ||
    err instanceof BookingNotFoundError ||
    err instanceof CannotCancelError ||
    err instanceof HostCannotBookOwnStayError ||
    err instanceof StayNotBookableError
  ) {
    return err.message;
  }
  console.error("bookings action", err);
  return "Ocurrió un error. Inténtalo de nuevo.";
}

export async function createBookingAction(
  stayId: string,
  _prev: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  const session = await auth();
  if (!session?.user?.id) redirect(`/login`);

  try {
    const { db } = bookingsDeps();
    const booking = await createBooking(
      session.user.id,
      {
        stayId,
        checkIn: String(formData.get("checkIn") ?? ""),
        checkOut: String(formData.get("checkOut") ?? ""),
      },
      { db }
    );
    revalidatePath(`/stays/${stayId}`);
    revalidatePath(`/bookings`);
    // Flujo natural: reserva → pago. La página de pago redirige al
    // detalle si ya estaba pagada.
    redirect(`/bookings/${booking.id}/pay`);
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    return { error: mapError(err) };
  }
}

export async function cancelBookingAction(bookingId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  try {
    const { db, bookings } = bookingsDeps();
    await cancelBooking(session.user.id, bookingId, { db, bookings });
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("cancelBookingAction", err);
  }
  revalidatePath(`/bookings`);
  revalidatePath(`/bookings/${bookingId}`);
  redirect(`/bookings/${bookingId}`);
}
