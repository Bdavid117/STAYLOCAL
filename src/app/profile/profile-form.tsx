"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateProfileAction, type ProfileState } from "./actions";

type Props = {
  initial: { name: string; phone: string | null; photoUrl: string | null };
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-brand px-4 py-2 text-white hover:bg-brand-dark disabled:opacity-60"
    >
      {pending ? "Guardando…" : "Guardar"}
    </button>
  );
}

export function ProfileForm({ initial }: Props) {
  const [state, formAction] = useActionState<ProfileState, FormData>(
    updateProfileAction,
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      {state?.ok && (
        <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">Perfil actualizado.</p>
      )}
      {state?.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      <div>
        <label className="block text-sm font-medium">Nombre</label>
        <input
          name="name"
          required
          defaultValue={initial.name}
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Teléfono</label>
        <input
          name="phone"
          defaultValue={initial.phone ?? ""}
          placeholder="+573001234567"
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Foto de perfil (URL)</label>
        <input
          name="photoUrl"
          type="url"
          defaultValue={initial.photoUrl ?? ""}
          placeholder="https://…"
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </div>
      <SubmitButton />
    </form>
  );
}
