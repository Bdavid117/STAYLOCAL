"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  createStayAction,
  type ActionState,
} from "@/app/host/stays/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-brand px-4 py-2 text-white hover:bg-brand-dark disabled:opacity-60"
    >
      {pending ? "Publicando…" : "Publicar"}
    </button>
  );
}

export default function NewStayPage() {
  const [state, formAction] = useActionState<ActionState, FormData>(
    createStayAction,
    null
  );

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Publicar alojamiento</h1>
      {state?.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field name="title" label="Título" required />
        <Field name="locationText" label="Ubicación (texto)" required />
        <Field name="pricePerNight" label="Precio por noche (COP)" type="number" min={1000} required />
        <Field name="capacity" label="Capacidad (personas)" type="number" min={1} required />
        <Field name="lat" label="Latitud" type="number" step="any" defaultValue="4.6097" required />
        <Field name="lng" label="Longitud" type="number" step="any" defaultValue="-74.0817" required />
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">Descripción</label>
          <textarea
            name="description"
            required
            minLength={20}
            rows={5}
            className="mt-1 w-full rounded border px-3 py-2"
          />
          <p className="mt-1 text-xs text-gray-500">Mínimo 20 caracteres.</p>
        </div>
        <div className="sm:col-span-2">
          <SubmitButton />
        </div>
      </form>
    </section>
  );
}

function Field(props: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
  min?: number;
  step?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium">{props.label}</label>
      <input
        name={props.name}
        type={props.type ?? "text"}
        required={props.required}
        defaultValue={props.defaultValue}
        min={props.min}
        step={props.step}
        className="mt-1 w-full rounded border px-3 py-2"
      />
    </div>
  );
}
