"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/shared/auth";
import { notificationsDeps } from "@/modules/notifications/composition";
import { markAllRead } from "@/modules/notifications/services/mark-read";

export async function markAllReadAction(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { notifications } = notificationsDeps();
  await markAllRead(session.user.id, { notifications });
  revalidatePath("/notifications");
}
