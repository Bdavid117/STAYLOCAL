"use client";

import { useState, useTransition, useRef } from "react";
import {
  uploadStayImageAction,
  type ActionState,
} from "@/app/host/stays/actions";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";

export function UploadImageForm({ stayId }: { stayId: string }) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<ActionState>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(formData: FormData) {
    setFeedback(null);
    startTransition(async () => {
      const result = await uploadStayImageAction(stayId, null, formData);
      setFeedback(result);
      if (result?.ok) formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} action={onSubmit} className="space-y-3">
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
      {feedback?.error && <Banner tone="error">{feedback.error}</Banner>}
      {feedback?.ok && <Banner tone="success">Imagen subida.</Banner>}
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Subiendo…" : "Subir imagen"}
        </Button>
      </div>
    </form>
  );
}
