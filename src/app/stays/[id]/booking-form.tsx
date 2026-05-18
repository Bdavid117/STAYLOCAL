"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  createBookingAction,
  type BookingActionState,
} from "@/app/bookings/actions";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";

function SubmitButton({ totalLabel }: { totalLabel: string | null }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? "Reservando…" : totalLabel ? `Reservar · ${totalLabel}` : "Reservar"}
    </Button>
  );
}

function nightsBetween(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
  const diff = Math.round((b.getTime() - a.getTime()) / 86_400_000);
  return diff > 0 ? diff : 0;
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
  const [state, formAction] = useActionState<BookingActionState, FormData>(action, null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  if (!isAuthed) {
    return (
      <Link
        href="/login"
        className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-ink px-6 text-sm font-medium text-paper transition-colors hover:bg-ink-soft"
      >
        Inicia sesión para reservar
      </Link>
    );
  }

  const nights = nightsBetween(checkIn, checkOut);
  const total = nights > 0 ? nights * pricePerNight : null;
  const totalLabel = total ? `$${total.toLocaleString("es-CO")}` : null;

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && <Banner tone="error">{state.error}</Banner>}

      <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-line">
        <label className="block border-r border-line p-3">
          <span className="block font-mono text-[10px] uppercase tracking-widest text-ink-soft">
            Llegada
          </span>
          <input
            type="date"
            name="checkIn"
            required
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="mt-1 w-full bg-transparent text-sm text-ink focus:outline-none"
          />
        </label>
        <label className="block p-3">
          <span className="block font-mono text-[10px] uppercase tracking-widest text-ink-soft">
            Salida
          </span>
          <input
            type="date"
            name="checkOut"
            required
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="mt-1 w-full bg-transparent text-sm text-ink focus:outline-none"
          />
        </label>
      </div>

      {nights > 0 && (
        <div className="space-y-1 rounded-lg bg-bone-2/50 p-3 text-sm">
          <div className="flex justify-between text-ink-soft">
            <span>
              <span className="num">${pricePerNight.toLocaleString("es-CO")}</span> ×{" "}
              <span className="num">{nights}</span> noche{nights === 1 ? "" : "s"}
            </span>
            <span className="num">${(pricePerNight * nights).toLocaleString("es-CO")}</span>
          </div>
          <div className="flex justify-between border-t border-line pt-2 font-medium text-ink">
            <span>Total</span>
            <span className="num">${(pricePerNight * nights).toLocaleString("es-CO")}</span>
          </div>
        </div>
      )}

      <SubmitButton totalLabel={totalLabel} />
    </form>
  );
}
