"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { auth } from "@/shared/auth";
import { prisma } from "@/shared/db";
import { staysDeps } from "@/modules/stays/composition";
import { createStay } from "@/modules/stays/services/create-stay";
import { editStay } from "@/modules/stays/services/edit-stay";
import { deleteStay } from "@/modules/stays/services/delete-stay";
import { uploadStayImage } from "@/modules/stays/services/upload-image";
import { manageAvailability } from "@/modules/stays/services/manage-availability";
import {
  DateBookedError,
  InvalidImageError,
  NotHostError,
  StayHasActiveBookingsError,
  StayNotFoundError,
} from "@/modules/stays/services/errors";

export type ActionState = { ok?: boolean; error?: string } | null;

async function actorId(): Promise<string | null> {
  const s = await auth();
  return s?.user?.id ?? null;
}

function mapError(err: unknown): string {
  if (err instanceof ZodError) return err.issues[0]?.message ?? "Datos inválidos";
  if (
    err instanceof StayNotFoundError ||
    err instanceof NotHostError ||
    err instanceof StayHasActiveBookingsError ||
    err instanceof DateBookedError ||
    err instanceof InvalidImageError
  )
    return err.message;
  console.error("stays action", err);
  return "Ocurrió un error. Inténtalo de nuevo.";
}

export async function createStayAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const uid = await actorId();
  if (!uid) return { error: "Sesión expirada." };

  try {
    const { stays } = staysDeps();
    const stay = await createStay(
      uid,
      {
        title: String(formData.get("title") ?? ""),
        description: String(formData.get("description") ?? ""),
        pricePerNight: Number(formData.get("pricePerNight") ?? 0),
        capacity: Number(formData.get("capacity") ?? 0),
        lat: Number(formData.get("lat") ?? 0),
        lng: Number(formData.get("lng") ?? 0),
        locationText: String(formData.get("locationText") ?? ""),
      },
      { stays }
    );
    // Auto-promueve a HOST en su primer alojamiento.
    await prisma.user.update({
      where: { id: uid, role: "GUEST" },
      data: { role: "HOST" },
    }).catch(() => {/* ya era HOST/ADMIN */});

    redirect(`/host/stays/${stay.id}/edit`);
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err; // redirect
    return { error: mapError(err) };
  }
}

export async function editStayAction(
  stayId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const uid = await actorId();
  if (!uid) return { error: "Sesión expirada." };

  try {
    const { stays } = staysDeps();
    await editStay(
      uid,
      stayId,
      {
        title: String(formData.get("title") ?? ""),
        description: String(formData.get("description") ?? ""),
        pricePerNight: Number(formData.get("pricePerNight") ?? 0),
        capacity: Number(formData.get("capacity") ?? 0),
        lat: Number(formData.get("lat") ?? 0),
        lng: Number(formData.get("lng") ?? 0),
        locationText: String(formData.get("locationText") ?? ""),
        status: (formData.get("status") as "ACTIVE" | "INACTIVE") ?? "ACTIVE",
      },
      { stays }
    );
    revalidatePath(`/host/stays/${stayId}/edit`);
    revalidatePath(`/stays/${stayId}`);
    return { ok: true };
  } catch (err) {
    return { error: mapError(err) };
  }
}

export async function deleteStayAction(stayId: string): Promise<void> {
  const uid = await actorId();
  if (!uid) redirect("/login");

  try {
    const { stays, db } = staysDeps();
    await deleteStay(uid!, stayId, { stays, db });
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("deleteStayAction", err);
  }
  redirect("/host/stays");
}

export async function uploadStayImageAction(
  stayId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const uid = await actorId();
  if (!uid) return { error: "Sesión expirada." };

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecciona una imagen." };
  }

  try {
    const { stays, images, storage } = staysDeps();
    const content = Buffer.from(await file.arrayBuffer());
    await uploadStayImage(
      uid,
      stayId,
      {
        filename: file.name,
        contentType: file.type,
        content,
      },
      { stays, images, storage }
    );
    revalidatePath(`/host/stays/${stayId}/edit`);
    revalidatePath(`/stays/${stayId}`);
    return { ok: true };
  } catch (err) {
    return { error: mapError(err) };
  }
}

export async function manageAvailabilityAction(
  stayId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const uid = await actorId();
  if (!uid) return { error: "Sesión expirada." };

  try {
    const { stays, availability } = staysDeps();
    await manageAvailability(
      uid,
      stayId,
      {
        action: (formData.get("action") as "block" | "unblock") ?? "block",
        from: String(formData.get("from") ?? ""),
        to: String(formData.get("to") ?? ""),
      },
      { stays, availability }
    );
    revalidatePath(`/host/stays/${stayId}/availability`);
    return { ok: true };
  } catch (err) {
    return { error: mapError(err) };
  }
}
