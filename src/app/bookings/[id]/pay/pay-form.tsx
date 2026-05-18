"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { payAction, type PayState } from "./actions";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";

function SubmitButton({ amountLabel }: { amountLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? "Procesando…" : `Confirmar pago · ${amountLabel}`}
    </Button>
  );
}

export function PayForm({
  bookingId,
  amount,
  currency,
}: {
  bookingId: string;
  amount: number;
  currency: string;
}) {
  const action = payAction.bind(null, bookingId);
  const [state, formAction] = useActionState<PayState, FormData>(action, null);
  const label = `$${amount.toLocaleString("es-CO")} ${currency}`;

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && <Banner tone="error">{state.error}</Banner>}
      <SubmitButton amountLabel={label} />
      <p className="text-xs text-ink-mute">
        Estás en <span className="num">modo demo</span>: la pasarela siempre acepta
        el pago. En producción aquí entraría Stripe o Wompi.
      </p>
    </form>
  );
}
