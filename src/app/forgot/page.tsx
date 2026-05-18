"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { forgotAction, type ForgotState } from "./actions";
import { AuthShell } from "@/components/ui/AuthShell";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? "Enviando…" : "Enviar enlace"}
    </Button>
  );
}

export default function ForgotPage() {
  const [state, formAction] = useActionState<ForgotState, FormData>(forgotAction, null);

  return (
    <AuthShell
      serial="§A·03"
      kicker="Recuperación"
      title={
        <>
          <em className="italic text-terracotta">Reescribe</em> tu contraseña.
        </>
      }
      subtitle="Te enviaremos un enlace que expira en 30 minutos. Si el correo está registrado, llega a tu bandeja en segundos."
    >
      <form action={formAction} className="space-y-4">
        {state?.ok && (
          <Banner tone="success">
            Si el correo está registrado, ya enviamos el enlace. Revisa tu bandeja
            (o MailHog en <span className="num">localhost:8025</span> si estás en dev).
          </Banner>
        )}
        {state?.error && <Banner tone="error">{state.error}</Banner>}

        <Field
          label="Correo"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="tu@correo.com"
        />
        <SubmitButton />
        <p className="border-t border-line pt-4 text-center text-sm">
          <Link href="/login" className="text-ink-soft hover:text-ink">
            ← Volver al inicio de sesión
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
