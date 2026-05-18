"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { editStayAction, type ActionState } from "@/app/host/stays/actions";

type Initial = {
  title: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  lat: number;
  lng: number;
  locationText: string;
  status: "ACTIVE" | "INACTIVE";
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-brand px-4 py-2 text-white hover:bg-brand-dark disabled:opacity-60"
    >
      {pending ? "Guardando…" : "Guardar cambios"}
    </button>
  );
}

export function EditStayForm({ stayId, initial }: { stayId: string; initial: Initial }) {
  const action = editStayAction.bind(null, stayId);
  const [state, formAction] = useActionState<ActionState, FormData>(action, null);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {state?.ok && (
        <p className="sm:col-span-2 rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          Cambios guardados.
        </p>
      )}
      {state?.error && (
        <p className="sm:col-span-2 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <Field name="title" label="Título" defaultValue={initial.title} required />
      <Field name="locationText" label="Ubicación" defaultValue={initial.locationText} required />
      <Field name="pricePerNight" label="Precio (COP)" type="number" defaultValue={initial.pricePerNight} required />
      <Field name="capacity" label="Capacidad" type="number" defaultValue={initial.capacity} required />
      <Field name="lat" label="Latitud" type="number" step="any" defaultValue={initial.lat} required />
      <Field name="lng" label="Longitud" type="number" step="any" defaultValue={initial.lng} required />
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium">Descripción</label>
        <textarea
          name="description"
          defaultValue={initial.description}
          required
          minLength={20}
          rows={5}
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Estado</label>
        <select
          name="status"
          defaultValue={initial.status}
          className="mt-1 w-full rounded border px-3 py-2"
        >
          <option value="ACTIVE">Activo</option>
          <option value="INACTIVE">Inactivo</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <SubmitButton />
      </div>
    </form>
  );
}

function Field(props: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
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
        step={props.step}
        className="mt-1 w-full rounded border px-3 py-2"
      />
    </div>
  );
}
