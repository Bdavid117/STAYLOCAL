"use client";

import { useState, useTransition } from "react";
import {
  manageAvailabilityAction,
  type ActionState,
} from "@/app/host/stays/actions";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { SelectField } from "@/components/ui/Field";

export function AvailabilityForm({ stayId }: { stayId: string }) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<ActionState>(null);

  async function onSubmit(formData: FormData) {
    setFeedback(null);
    startTransition(async () => {
      const result = await manageAvailabilityAction(stayId, null, formData);
      setFeedback(result);
    });
  }

  return (
    <form action={onSubmit} className="space-y-5">
      {feedback?.ok && <Banner tone="success">Calendario actualizado.</Banner>}
      {feedback?.error && <Banner tone="error">{feedback.error}</Banner>}

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

      <Button type="submit" size="md" disabled={pending} className="w-full">
        {pending ? "Aplicando…" : "Aplicar al calendario"}
      </Button>
    </form>
  );
}
