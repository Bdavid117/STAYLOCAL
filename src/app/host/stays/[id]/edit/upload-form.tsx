"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  uploadStayImageAction,
  type ActionState,
} from "@/app/host/stays/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded border px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-60"
    >
      {pending ? "Subiendo…" : "Subir"}
    </button>
  );
}

export function UploadImageForm({ stayId }: { stayId: string }) {
  const action = uploadStayImageAction.bind(null, stayId);
  const [state, formAction] = useActionState<ActionState, FormData>(action, null);

  return (
    <form action={formAction} className="space-y-2">
      <input
        name="image"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="block w-full text-sm"
        required
      />
      {state?.error && (
        <p className="text-sm text-red-700">{state.error}</p>
      )}
      {state?.ok && <p className="text-sm text-green-700">Imagen subida.</p>}
      <SubmitButton />
    </form>
  );
}
