"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { auth } from "@/shared/auth";
import { reviewsDeps } from "@/modules/reviews/composition";
import { submitReview } from "@/modules/reviews/services/submit-review";
import {
  BookingNotReviewableError,
  ReviewAlreadyExistsError,
} from "@/modules/reviews/services/errors";
import {
  bookingContext,
  notifyReviewReceived,
} from "@/modules/notifications/notify-event";

export type ReviewState = { error?: string } | null;

export async function submitReviewAction(
  bookingId: string,
  _prev: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  try {
    const deps = reviewsDeps();
    const review = await submitReview(
      session.user.id,
      bookingId,
      {
        rating: Number(formData.get("rating") ?? 0),
        comment: String(formData.get("comment") ?? ""),
      },
      deps
    );
    revalidatePath(`/bookings/${bookingId}`);
    revalidatePath(`/stays/`);

    // Side-effect: avisar al host que recibió una reseña.
    const ctx = await bookingContext(deps.db, bookingId);
    if (ctx) {
      await notifyReviewReceived({
        bookingId: ctx.bookingId,
        stayId: ctx.stayId,
        hostId: ctx.hostId,
        stayTitle: ctx.stayTitle,
        guestName: ctx.guestName,
        rating: review.rating,
      });
    }
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    if (err instanceof ZodError) {
      return { error: err.issues[0]?.message ?? "Datos inválidos" };
    }
    if (
      err instanceof BookingNotReviewableError ||
      err instanceof ReviewAlreadyExistsError
    ) {
      return { error: err.message };
    }
    console.error("submitReviewAction", err);
    return { error: "No pudimos guardar tu reseña. Inténtalo de nuevo." };
  }
  redirect(`/bookings/${bookingId}?reviewed=1`);
}
