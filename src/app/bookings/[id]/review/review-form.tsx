"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitReviewAction, type ReviewState } from "./actions";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { TextareaField } from "@/components/ui/Field";
import { StarRating } from "@/components/ui/StarRating";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Publicando…" : "Publicar reseña"}
    </Button>
  );
}

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const action = submitReviewAction.bind(null, bookingId);
  const [state, formAction] = useActionState<ReviewState, FormData>(action, null);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && <Banner tone="error">{state.error}</Banner>}

      <div className="space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">
          Calificación · 1 a 5 <span className="text-terracotta">•</span>
        </p>
        <StarRating />
      </div>

      <TextareaField
        label="Comentario"
        name="comment"
        required
        minLength={10}
        maxLength={1000}
        rows={6}
        placeholder="Cuenta cómo fue tu estadía, qué destacarías y a quién se lo recomendarías."
        hint="Entre 10 y 1000 caracteres."
      />

      <div className="flex items-center justify-between border-t border-line pt-5">
        <p className="text-xs text-ink-mute">
          Tu reseña será pública en la ficha del alojamiento.
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}
