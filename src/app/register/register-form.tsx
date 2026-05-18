"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { registerAction, type RegisterState } from "./actions";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Banner } from "@/components/ui/Banner";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? "Creando…" : "Crear cuenta"}
    </Button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useActionState<RegisterState, FormData>(
    registerAction,
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && <Banner tone="error">{state.error}</Banner>}
      <Field label="Nombre" name="name" required autoComplete="name" placeholder="Cómo te llamas" />
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
        minLength={8}
        autoComplete="new-password"
        hint="Mínimo 8 caracteres. Te recomendamos usar una frase memorable."
      />
      <SubmitButton />
    </form>
  );
}
