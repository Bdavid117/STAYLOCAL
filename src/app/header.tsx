import Link from "next/link";
import { auth } from "@/shared/auth";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { LogoutButton } from "./logout-button";
import { NotificationBell } from "./notification-bell";

export async function Header() {
  const session = await auth();
  const isAuth = !!session?.user?.id;

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bone/85 backdrop-blur">
      <Container size="wide">
        <nav className="flex h-16 items-center justify-between gap-6">
          <Logo />
          <div className="hidden items-center gap-6 text-sm sm:flex">
            <NavLink href="/search">Buscar</NavLink>
            {isAuth && (
              <>
                <NavLink href="/bookings">Reservas</NavLink>
                <NavLink href="/host/stays">Alojamientos</NavLink>
                <NavLink href="/profile">Perfil</NavLink>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isAuth ? (
              <>
                <NotificationBell />
                <LogoutButton />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden text-sm text-ink-soft hover:text-ink sm:inline-block"
                >
                  Ingresar
                </Link>
                <ButtonLink href="/register" size="sm" variant="ink">
                  Crear cuenta
                </ButtonLink>
              </>
            )}
          </div>
        </nav>
      </Container>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="relative text-ink-soft transition-colors hover:text-ink"
    >
      {children}
    </Link>
  );
}
