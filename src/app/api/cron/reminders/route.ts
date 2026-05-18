// GET|POST /api/cron/reminders
//
// Endpoint para que un scheduler externo (Vercel Cron, GitHub Actions,
// crontab del SO) dispare los recordatorios CU-27 una vez al día.
//
// Vercel Cron envía GET con Authorization: Bearer $CRON_SECRET cuando
// la env var está configurada. Aceptamos POST también para invocación
// manual desde curl u otros schedulers.

import { NextResponse } from "next/server";
import { notificationsDeps } from "@/modules/notifications/composition";
import { sendUpcomingReminders } from "@/modules/notifications/services/send-upcoming-reminders";

async function handle(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET no configurado en el servidor." },
      { status: 503 }
    );
  }
  const header = req.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (provided !== secret) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const url = new URL(req.url);
  const daysParam = url.searchParams.get("days");
  const daysAhead = daysParam ? Number(daysParam) : undefined;

  const result = await sendUpcomingReminders(
    { daysAhead: Number.isFinite(daysAhead) ? daysAhead : undefined },
    notificationsDeps()
  );

  return NextResponse.json(result);
}

export const GET = handle;
export const POST = handle;
