"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { registerAction, type RegisterState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded bg-brand py-2 text-white hover:bg-brand-dark disabled:opacity-60"
    >
      {pending ? "Creando…" : "Registrarme"}
    </button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useActionState<RegisterState, FormData>(
    registerAction,
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      <div>
        <label className="block text-sm font-medium">Nombre</label>
        <input name="name" required className="mt-1 w-full rounded border px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">Correo</label>
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Contraseña</label>
        <input
          name="password"
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
