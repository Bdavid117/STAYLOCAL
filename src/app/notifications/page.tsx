import Link from "next/link";
import { requireSession } from "@/shared/require-auth";
import { notificationsDeps } from "@/modules/notifications/composition";
import { renderNotification } from "@/modules/notifications/domain/render";
import { Container, SectionLabel } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { markAllReadAction } from "./actions";

export default async function NotificationsPage() {
  const session = await requireSession();
  const { notifications } = notificationsDeps();
  const list = await notifications.listForUser(session.user.id);
  const unread = list.filter((n) => n.readAt === null).length;

  const fmt = new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <Container size="default" className="py-14">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div className="space-y-3">
          <SectionLabel serial="§H">Bandeja</SectionLabel>
          <h1 className="font-display text-5xl leading-tight">Notificaciones</h1>
          <p className="text-ink-soft">
            <span className="num">{list.length}</span> en total{" "}
            {unread > 0 && (
              <>
                · <span className="num text-terracotta">{unread}</span> sin leer
              </>
            )}
          </p>
        </div>
        {unread > 0 && (
          <form action={markAllReadAction}>
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-md border border-line bg-paper px-3 text-sm text-ink-soft hover:border-ink/30 hover:text-ink"
            >
              Marcar todas como leídas
            </button>
          </form>
        )}
      </header>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-paper p-16 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
            Sin notificaciones
          </p>
          <p className="mt-3 font-display text-2xl">Aún no hay nada por aquí.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {list.map((n) => {
            const r = renderNotification(n);
            const unread = n.readAt === null;
            return (
              <li key={n.id}>
                {r.href ? (
                  <Link
                    href={r.href}
                    className={`group block rounded-xl border p-4 transition-colors ${
                      unread
                        ? "border-terracotta/30 bg-terracotta/[0.04] hover:border-terracotta/50"
                        : "border-line bg-paper hover:border-ink/20"
                    }`}
                  >
                    <ItemContent
                      r={r}
                      n={n}
                      unread={unread}
                      fmt={fmt}
                    />
                  </Link>
                ) : (
                  <div
                    className={`rounded-xl border p-4 ${
                      unread ? "border-terracotta/30 bg-terracotta/[0.04]" : "border-line bg-paper"
                    }`}
                  >
                    <ItemContent r={r} n={n} unread={unread} fmt={fmt} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Container>
  );
}

function ItemContent({
  r,
  n,
  unread,
  fmt,
}: {
  r: ReturnType<typeof renderNotification>;
  n: { id: string; createdAt: Date };
  unread: boolean;
  fmt: Intl.DateTimeFormat;
}) {
  return (
    <div className="flex items-start gap-4">
      <span
        aria-hidden
        className={`mt-2 h-2 w-2 shrink-0 rounded-full ${
          unread ? "bg-terracotta" : "bg-line"
        }`}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate font-display text-lg text-ink">{r.title}</p>
          <Badge tone={r.tone}>{badgeLabel(r.tone)}</Badge>
        </div>
        <p className="mt-0.5 text-sm text-ink-soft">{r.body}</p>
        <p className="mt-1.5 font-mono text-[10px] uppercase tracking-widest text-ink-mute">
          {fmt.format(n.createdAt)}
        </p>
      </div>
    </div>
  );
}

function badgeLabel(tone: ReturnType<typeof renderNotification>["tone"]): string {
  switch (tone) {
    case "moss":
      return "Confirmación";
    case "terracotta":
      return "Recordatorio";
    case "ochre":
      return "Reseña";
    case "neutral":
      return "Aviso";
  }
}
