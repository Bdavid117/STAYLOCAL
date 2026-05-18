import Link from "next/link";
import { auth } from "@/shared/auth";
import { notificationsDeps } from "@/modules/notifications/composition";

// Async server component — consulta el conteo no leído del usuario actual.
export async function NotificationBell() {
  const session = await auth();
  if (!session?.user?.id) return null;

  let unread = 0;
  try {
    const { notifications } = notificationsDeps();
    unread = await notifications.unreadCount(session.user.id);
  } catch {
    // DB no disponible: silenciamos.
  }

  return (
    <Link
      href="/notifications"
      aria-label={`Notificaciones${unread > 0 ? ` (${unread} sin leer)` : ""}`}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-paper text-ink-soft transition-colors hover:border-ink/30 hover:text-ink"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <path d="M6 8a6 6 0 0 1 12 0c0 5.5 2 7 2 7H4s2-1.5 2-7" />
        <path d="M10 19a2 2 0 0 0 4 0" />
      </svg>
      {unread > 0 && (
        <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-terracotta px-1 font-mono text-[10px] font-medium text-paper">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
