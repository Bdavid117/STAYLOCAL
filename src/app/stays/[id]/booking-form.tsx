"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  createBookingAction,
  type BookingActionState,
} from "@/app/bookings/actions";

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="w-full rounded bg-brand px-4 py-2 text-white hover:bg-brand-dark disabled:opacity-60"
    >
      {pending ? "Reservando…" : "Reservar"}
    </button>
  );
}

export function BookingForm({
  stayId,
  pricePerNight,
  isAuthed,
}: {
  stayId: string;
  pricePerNight: number;
  isAuthed: boolean;
}) {
  const action = createBookingAction.bind(null, stayId);
  const [state, formAction] = useActionState<BookingActionState, FormData>(
    action,
    null
  );

  if (!isAuthed) {
    return (
      <a
        href={`/login`}
        className="block w-full rounded bg-brand px-4 py-2 text-center text-white hover:bg-brand-dark"
      >
        Inicia sesión para reservar
      </a>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      {state?.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium">Check-in</label>
          <input
            type="date"
            name="checkIn"
            required
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium">Check-out</label>
          <input
            type="date"
            name="checkOut"
            required
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          />
        </div>
      </div>
      <p className="text-xs text-gray-500">
        Precio por noche: ${pricePerNight.toLocaleString("es-CO")}
      </p>
      <SubmitButton disabled={false} />
    </form>
  );
}
