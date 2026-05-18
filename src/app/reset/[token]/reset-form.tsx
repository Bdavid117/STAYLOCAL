"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { resetAction, type ResetState } from "./actions";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? "Guardando…" : "Guardar contraseña"}
    </Button>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, formAction] = useActionState<ResetState, FormData>(resetAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      {state?.error && <Banner tone="error">{state.error}</Banner>}
      <Field
        label="Nueva contraseña"
        name="newPassword"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
        hint="Mínimo 8 caracteres."
      />
      <SubmitButton />
    </form>
  );
}
