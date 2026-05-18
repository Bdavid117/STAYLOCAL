"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { forgotAction, type ForgotState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded bg-brand py-2 text-white hover:bg-brand-dark disabled:opacity-60"
    >
      {pending ? "Enviando…" : "Enviar enlace de recuperación"}
    </button>
  );
}

export default function ForgotPage() {
  const [state, formAction] = useActionState<ForgotState, FormData>(forgotAction, null);

  return (
    <section className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-bold">Recuperar contraseña</h1>
      <p className="text-sm text-gray-600">
        Te enviaremos un enlace para restablecer tu contraseña. El enlace expira en 30 minutos.
      </p>
      {state?.ok && (
        <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          Si ese correo está registrado, ya enviamos el enlace. Revisa tu bandeja.
        </p>
      )}
      {state?.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Correo</label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
        <SubmitButton />
      </form>
      <p className="text-center text-sm">
        <Link href="/login" className="text-brand hover:underline">
          Volver al inicio de sesión
        </Link>
      </p>
    </section>
  );
}
