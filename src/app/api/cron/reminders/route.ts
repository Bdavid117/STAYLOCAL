// POST /api/cron/reminders
//
// Endpoint para que un scheduler externo (Vercel Cron, GitHub Actions,
// crontab del SO) dispare los recordatorios CU-27 una vez al día.
//
// Protegido con un secret en header Authorization: Bearer <CRON_SECRET>.
// Si CRON_SECRET no está configurado, el endpoint responde 503 — no se
// considera "abierto por defecto".

import { NextResponse } from "next/server";
import { notificationsDeps } from "@/modules/notifications/composition";
import { sendUpcomingReminders } from "@/modules/notifications/services/send-upcoming-reminders";

export async function POST(req: Request) {
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

  // daysAhead opcional via query string (?days=3).
  const url = new URL(req.url);
  const daysParam = url.searchParams.get("days");
  const daysAhead = daysParam ? Number(daysParam) : undefined;

  const result = await sendUpcomingReminders(
    { daysAhead: Number.isFinite(daysAhead) ? daysAhead : undefined },
    notificationsDeps()
  );

  return NextResponse.json(result);
}
