"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { editStayAction, type ActionState } from "@/app/host/stays/actions";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Field, SelectField, TextareaField } from "@/components/ui/Field";

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
    <Button type="submit" size="md" disabled={pending}>
      {pending ? "Guardando…" : "Guardar cambios"}
    </Button>
  );
}

export function EditStayForm({
  stayId,
  initial,
}: {
  stayId: string;
  initial: Initial;
}) {
  const action = editStayAction.bind(null, stayId);
  const [state, formAction] = useActionState<ActionState, FormData>(action, null);

  return (
    <form action={formAction} className="space-y-5">
      {state?.ok && <Banner tone="success">Cambios guardados.</Banner>}
      {state?.error && <Banner tone="error">{state.error}</Banner>}

      <Field label="Título" name="title" defaultValue={initial.title} required />

      <TextareaField
        label="Descripción"
        name="description"
        defaultValue={initial.description}
        required
        minLength={20}
        rows={6}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          label="Precio por noche (COP)"
          name="pricePerNight"
          type="number"
          required
          defaultValue={initial.pricePerNight}
        />
        <Field
          label="Capacidad"
          name="capacity"
          type="number"
          required
          defaultValue={initial.capacity}
        />
      </div>

      <Field
        label="Ubicación (texto)"
        name="locationText"
        defaultValue={initial.locationText}
        required
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Field
          label="Latitud"
          name="lat"
          type="number"
          step="any"
          required
          defaultValue={initial.lat}
        />
        <Field
          label="Longitud"
          name="lng"
          type="number"
          step="any"
          required
          defaultValue={initial.lng}
        />
        <SelectField label="Estado" name="status" defaultValue={initial.status}>
          <option value="ACTIVE">Activo</option>
          <option value="INACTIVE">Inactivo</option>
        </SelectField>
      </div>

      <div className="flex items-center justify-end border-t border-line pt-5">
        <SubmitButton />
      </div>
    </form>
  );
}
