"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  manageAvailabilityAction,
  type ActionState,
} from "@/app/host/stays/actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
    >
      {pending ? "Aplicando…" : label}
    </button>
  );
}

export function AvailabilityForm({ stayId }: { stayId: string }) {
  const action = manageAvailabilityAction.bind(null, stayId);
  const [state, formAction] = useActionState<ActionState, FormData>(action, null);

  return (
    <form action={formAction} className="space-y-3">
      {state?.ok && (
        <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          Calendario actualizado.
        </p>
      )}
      {state?.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium">Desde</label>
          <input
            type="date"
            name="from"
            required
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Hasta (no incluido)</label>
          <input
            type="date"
            name="to"
            required
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Acción</label>
          <select name="action" defaultValue="block" className="mt-1 w-full rounded border px-3 py-2">
            <option value="block">Bloquear</option>
            <option value="unblock">Desbloquear</option>
          </select>
        </div>
      </div>
      <SubmitButton label="Aplicar" />
    </form>
  );
}
