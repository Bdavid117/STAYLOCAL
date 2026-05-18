"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  manageAvailabilityAction,
  type ActionState,
} from "@/app/host/stays/actions";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { SelectField } from "@/components/ui/Field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="md" disabled={pending} className="w-full">
      {pending ? "Aplicando…" : "Aplicar al calendario"}
    </Button>
  );
}

export function AvailabilityForm({ stayId }: { stayId: string }) {
  const action = manageAvailabilityAction.bind(null, stayId);
  const [state, formAction] = useActionState<ActionState, FormData>(action, null);

  return (
    <form action={formAction} className="space-y-5">
      {state?.ok && <Banner tone="success">Calendario actualizado.</Banner>}
      {state?.error && <Banner tone="error">{state.error}</Banner>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="block font-mono text-[10px] uppercase tracking-widest text-ink-soft">
            Desde
          </span>
          <input
            type="date"
            name="from"
            required
            className="mt-1 h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm text-ink focus:border-ink focus:bg-bone"
          />
        </label>
        <label className="block">
          <span className="block font-mono text-[10px] uppercase tracking-widest text-ink-soft">
            Hasta (no incluido)
          </span>
          <input
            type="date"
            name="to"
            required
            className="mt-1 h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm text-ink focus:border-ink focus:bg-bone"
          />
        </label>
        <SelectField label="Acción" name="action" defaultValue="block">
          <option value="block">Bloquear</option>
          <option value="unblock">Desbloquear</option>
        </SelectField>
      </div>

      <p className="text-xs text-ink-mute">
        Bloquear evita que se reserve. Desbloquear solo afecta fechas que tú
        bloqueaste — no toca reservas activas.
      </p>

      <SubmitButton />
    </form>
  );
}
