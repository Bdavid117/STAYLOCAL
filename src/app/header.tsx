import Link from "next/link";
import { auth } from "@/shared/auth";
import { LogoutButton } from "./logout-button";

export async function Header() {
  const session = await auth();
  const isAuth = !!session?.user?.id;

  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-brand">
          StayLocal
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/search" className="hover:underline">
            Buscar
          </Link>
          {isAuth ? (
            <>
              <Link href="/host/stays" className="hover:underline">
                Mis alojamientos
              </Link>
              <Link href="/profile" className="hover:underline">
                Mi perfil
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">
                Ingresar
              </Link>
              <Link
                href="/register"
                className="rounded bg-brand px-3 py-1 text-white hover:bg-brand-dark"
              >
                Registrarme
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
