"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, type LoginState } from "./actions";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Banner } from "@/components/ui/Banner";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? "Entrando…" : "Entrar"}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(loginAction, null);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && <Banner tone="error">{state.error}</Banner>}
      <Field
        label="Correo"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="tu@correo.com"
      />
      <Field
        label="Contraseña"
        name="password"
        type="password"
        required
        autoComplete="current-password"
      />
      <SubmitButton />
    </form>
  );
}
