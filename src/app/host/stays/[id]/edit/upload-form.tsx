"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  uploadStayImageAction,
  type ActionState,
} from "@/app/host/stays/actions";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Subiendo…" : "Subir imagen"}
    </Button>
  );
}

export function UploadImageForm({ stayId }: { stayId: string }) {
  const action = uploadStayImageAction.bind(null, stayId);
  const [state, formAction] = useActionState<ActionState, FormData>(action, null);

  return (
    <form action={formAction} className="space-y-3">
      <label className="block">
        <span className="block font-mono text-[10px] uppercase tracking-widest text-ink-soft">
          Nueva imagen
        </span>
        <input
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
          className="mt-2 block w-full text-sm text-ink-soft file:mr-3 file:rounded-md file:border file:border-line file:bg-bone-2 file:px-3 file:py-2 file:text-xs file:font-medium file:text-ink hover:file:bg-bone"
        />
      </label>
      <p className="text-xs text-ink-mute">JPG, PNG o WEBP. Máximo 5 MB.</p>
      {state?.error && <Banner tone="error">{state.error}</Banner>}
      {state?.ok && <Banner tone="success">Imagen subida.</Banner>}
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
