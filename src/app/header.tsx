import Link from "next/link";
import { auth } from "@/shared/auth";
import { LogoutButton } from "./logout-button";

export async function Header() {
  const session = await auth();
  const isAuth = !!session?.user?.id;

  return (
    <header className="bg-bone/80 dark:bg-surface-container/80 full-width top-0 sticky backdrop-blur-md border-b border-line dark:border-outline-variant shadow-soft z-50">
      <div className="flex justify-between items-center w-full px-gutter max-w-container-max mx-auto h-20">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-headline-md text-headline-md font-bold text-terracotta dark:text-primary-fixed-dim hover:bg-bone-2 dark:hover:bg-surface-container-high transition-colors p-2 rounded-lg">
            StayLocal
          </Link>
        </div>
        
        {/* Enlaces de Navegación central (Opcional, similar al anterior) */}
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

        <div className="flex items-center gap-4">
          <button className="text-ink dark:text-on-surface-variant hover:bg-bone-2 dark:hover:bg-surface-container-high transition-colors p-2 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined">language</span>
          </button>
          
          <div className="relative group">
            <button className="text-ink dark:text-on-surface-variant hover:bg-bone-2 dark:hover:bg-surface-container-high transition-colors p-2 rounded-full border border-line flex items-center gap-2 px-3">
              <span className="material-symbols-outlined">menu</span>
              <div className="w-6 h-6 rounded-full bg-bone-2 overflow-hidden flex items-center justify-center">
                <span className="material-symbols-outlined text-sm">person</span>
              </div>
            </button>
            {/* Opciones de perfil - Menú desplegable simulado para auth */}
            <div className="absolute right-0 mt-2 w-48 bg-paper rounded-xl shadow-warm border border-line opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col overflow-hidden z-50">
                {isAuth ? (
                  <>
                    <Link href="/profile" className="px-4 py-3 text-sm hover:bg-bone-2 transition-colors">Perfil</Link>
                    <div className="px-4 py-3 text-sm hover:bg-bone-2 transition-colors">
                      <LogoutButton />
                    </div>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="px-4 py-3 text-sm font-bold hover:bg-bone-2 transition-colors">Iniciar sesión</Link>
                    <Link href="/register" className="px-4 py-3 text-sm hover:bg-bone-2 transition-colors">Regístrate</Link>
                    <div className="h-px bg-line my-1 w-full" />
                    <Link href="/host/register" className="px-4 py-3 text-sm hover:bg-bone-2 transition-colors">Pon tu espacio en StayLocal</Link>
                  </>
                )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="relative font-body-sm text-body-sm text-ink-soft transition-colors hover:text-ink font-bold"
    >
      {children}
    </Link>
  );
}
