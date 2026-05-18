"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  createStayAction,
  type ActionState,
} from "@/app/host/stays/actions";
import { Container, SectionLabel } from "@/components/ui/Container";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Field, TextareaField } from "@/components/ui/Field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Publicando…" : "Publicar alojamiento"}
    </Button>
  );
}

export default function NewStayPage() {
  const [state, formAction] = useActionState<ActionState, FormData>(
    createStayAction,
    null
  );

  return (
    <Container size="default" className="py-14">
      <header className="mb-10 space-y-3">
        <SectionLabel serial="§D·01">Publicación</SectionLabel>
        <h1 className="font-display text-5xl leading-tight">
          Publica tu <em className="italic text-terracotta">alojamiento</em>.
        </h1>
        <p className="max-w-prose text-ink-soft">
          Empieza con los datos básicos. Podrás añadir fotos y definir disponibilidad
          en cuanto el alojamiento esté creado.
        </p>
      </header>

      <form
        action={formAction}
        className="space-y-6 rounded-2xl border border-line bg-paper p-7 shadow-soft"
      >
        {state?.error && <Banner tone="error">{state.error}</Banner>}

        <Field label="Título" name="title" required placeholder="Cabaña con vista al cerro" />

        <TextareaField
          label="Descripción"
          name="description"
          required
          minLength={20}
          rows={6}
          placeholder="Cuenta brevemente cómo es el lugar, qué hay alrededor, qué incluye…"
          hint="Mínimo 20 caracteres. Sé concreto: la primera frase es lo que aparece en el catálogo."
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field
            label="Precio por noche (COP)"
            name="pricePerNight"
            type="number"
            min={1000}
            required
            defaultValue={120000}
          />
          <Field
            label="Capacidad (personas)"
            name="capacity"
            type="number"
            min={1}
            required
            defaultValue={2}
          />
        </div>

        <Field
          label="Ubicación (texto visible)"
          name="locationText"
          required
          defaultValue="Bogotá, Colombia"
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field
            label="Latitud"
            name="lat"
            type="number"
            step="any"
            required
            defaultValue="4.6097"
            hint="Coordenadas usadas para búsqueda por mapa."
          />
          <Field
            label="Longitud"
            name="lng"
            type="number"
            step="any"
            required
            defaultValue="-74.0817"
          />
        </div>

        <div className="flex items-center justify-end border-t border-line pt-5">
          <SubmitButton />
        </div>
      </form>
    </Container>
  );
}
