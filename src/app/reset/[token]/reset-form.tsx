"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { resetAction, type ResetState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded bg-brand py-2 text-white hover:bg-brand-dark disabled:opacity-60"
    >
      {pending ? "Guardando…" : "Guardar nueva contraseña"}
    </button>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, formAction] = useActionState<ResetState, FormData>(resetAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      {state?.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      <div>
        <label className="block text-sm font-medium">Nueva contraseña</label>
        <input
          name="newPassword"
          type="password"
          required
          minLength={8}
          className="mt-1 w-full rounded border px-3 py-2"
        />
        <p className="mt-1 text-xs text-gray-500">Mínimo 8 caracteres.</p>
      </div>
      <SubmitButton />
    </form>
  );
}
