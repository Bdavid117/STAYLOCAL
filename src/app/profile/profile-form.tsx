"use client";

import { useState, useTransition } from "react";
import { updateProfileAction, type ProfileState } from "./actions";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";

type Props = {
  initial: { name: string; phone: string | null; photoUrl: string | null };
};

// Manejo local del feedback (en vez de useActionState) porque la action
// llama revalidatePath, lo cual re-renderiza el Server Component padre y
// reinicializa el estado del action — el banner desaparecía antes de
// que el usuario lo viera.
export function ProfileForm({ initial }: Props) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<ProfileState>(null);

  async function onSubmit(formData: FormData) {
    setFeedback(null);
    startTransition(async () => {
      const result = await updateProfileAction(null, formData);
      setFeedback(result);
    });
  }

  return (
    <form action={onSubmit} className="space-y-5">
      {feedback?.ok && <Banner tone="success">Perfil actualizado.</Banner>}
      {feedback?.error && <Banner tone="error">{feedback.error}</Banner>}

      <Field label="Nombre" name="name" required defaultValue={initial.name} />
      <Field
        label="Teléfono"
        name="phone"
        defaultValue={initial.phone ?? ""}
        placeholder="+57 300 123 4567"
        hint="Opcional. Solo dígitos y el prefijo país."
      />
      <Field
        label="Foto de perfil (URL)"
        name="photoUrl"
        type="url"
        defaultValue={initial.photoUrl ?? ""}
        placeholder="https://…"
        hint="URL pública a una imagen cuadrada."
      />

      <div className="flex items-center justify-between border-t border-line pt-5">
        <p className="text-xs text-ink-mute">
          Los cambios son visibles para huéspedes que vean tu perfil de anfitrión.
        </p>
        <Button type="submit" size="md" disabled={pending}>
          {pending ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
