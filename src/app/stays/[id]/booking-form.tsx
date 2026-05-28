"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import {
  createBookingAction,
  type BookingActionState,
} from "@/app/bookings/actions";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";
import { Calendar } from "@/components/ui/Calendar";

function SubmitButton({ totalLabel, disabled }: { totalLabel: string | null; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending || disabled} className="w-full">
      {pending ? "Reservando…" : totalLabel ? `Reservar · ${totalLabel}` : "Reservar"}
    </Button>
  );
}

function nightsBetween(range: DateRange | undefined): number {
  if (!range?.from || !range?.to) return 0;
  const diff = Math.round((range.to.getTime() - range.from.getTime()) / 86_400_000);
  return diff > 0 ? diff : 0;
}

export function BookingForm({
  stayId,
  pricePerNight,
  isAuthed,
  bookedDates = [],
}: {
  stayId: string;
  pricePerNight: number;
  isAuthed: boolean;
  bookedDates?: Date[];
}) {
  const action = createBookingAction.bind(null, stayId);
  const [state, formAction] = useActionState<BookingActionState, FormData>(action, null);
  const [range, setRange] = useState<DateRange | undefined>();
  const [showCalendar, setShowCalendar] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

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

  const nights = nightsBetween(range);
  const total = nights > 0 ? nights * pricePerNight : null;
  const totalLabel = total ? `$${total.toLocaleString("es-CO")}` : null;

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && <Banner tone="error">{state.error}</Banner>}

      {/* Hidden inputs for the form action */}
      <input 
        type="hidden" 
        name="checkIn" 
        value={range?.from ? format(range.from, "yyyy-MM-dd") : ""} 
      />
      <input 
        type="hidden" 
        name="checkOut" 
        value={range?.to ? format(range.to, "yyyy-MM-dd") : ""} 
      />

      {!isConfirming ? (
        <>
          <div className="overflow-hidden rounded-xl border border-line bg-paper shadow-sm">
            <button
              type="button"
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-bone/50"
            >
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <span className="block font-mono text-[10px] uppercase tracking-widest text-ink-soft">
                    Llegada
                  </span>
                  <span className="mt-1 block text-sm font-medium text-ink">
                    {range?.from ? format(range.from, "PPP", { locale: es }) : "Seleccionar"}
                  </span>
                </div>
                <div>
                  <span className="block font-mono text-[10px] uppercase tracking-widest text-ink-soft">
                    Salida
                  </span>
                  <span className="mt-1 block text-sm font-medium text-ink">
                    {range?.to ? format(range.to, "PPP", { locale: es }) : "Seleccionar"}
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-ink-soft">
                {showCalendar ? "expand_less" : "calendar_today"}
              </span>
            </button>

            {showCalendar && (
              <div className="border-t border-line bg-paper p-2">
                <Calendar
                  mode="range"
                  selected={range}
                  onSelect={setRange}
                  numberOfMonths={1}
                  disabled={[
                    { before: new Date() },
                    ...bookedDates
                  ]}
                  className="mx-auto"
                />
              </div>
            )}
          </div>

          {nights > 0 && (
            <div className="space-y-1 rounded-xl bg-bone-2/50 p-4 text-sm">
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

          <Button 
            type="button" 
            size="lg" 
            className="w-full" 
            disabled={!range?.from || !range?.to}
            onClick={() => setIsConfirming(true)}
          >
            Continuar reserva
          </Button>
        </>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="rounded-xl border border-ink/10 bg-paper p-4 shadow-sm">
            <h4 className="font-display text-lg mb-4 text-ink">Confirma tu reserva</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-ink-soft">Estadía</span>
                <span className="font-medium text-ink">
                  {range?.from && range?.to ? `${format(range.from, "d MMM")} - ${format(range.to, "d MMM, yyyy")}` : ""}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-soft">Total a pagar</span>
                <span className="num font-bold text-ink">${(pricePerNight * nights).toLocaleString("es-CO")}</span>
              </div>
            </div>
            
            <div className="mt-6 flex gap-2">
              <Button 
                type="button" 
                variant="secondary" 
                className="flex-1"
                onClick={() => setIsConfirming(false)}
              >
                Modificar
              </Button>
              <div className="flex-[2]">
                <SubmitButton totalLabel={null} />
              </div>
            </div>
          </div>
          <p className="text-[10px] text-center text-ink-mute uppercase tracking-widest">
            Al reservar aceptas las políticas de StayLocal
          </p>
        </div>
      )}
    </form>
  );
}
