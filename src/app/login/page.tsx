import Link from "next/link";
import { AuthShell } from "@/components/ui/AuthShell";
import { Banner } from "@/components/ui/Banner";
import { LoginForm } from "./login-form";

type Props = {
  searchParams: Promise<{ registered?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  return (
    <AuthShell
      serial="§A·02"
      kicker="Acceso"
      title={
        <>
          Bien <em className="italic text-terracotta">vuelto</em>.
        </>
      }
      subtitle="Ingresa para gestionar reservas, calendario y publicaciones."
      aside={<AuthAside />}
    >
      <div className="space-y-5">
        {params.registered && (
          <Banner tone="success">
            Cuenta creada. Inicia sesión con tu correo y contraseña.
          </Banner>
        )}
        <LoginForm />
        <div className="flex items-center justify-between border-t border-line pt-4 text-sm">
          <Link href="/forgot" className="text-ink-soft underline-offset-4 hover:text-ink hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
          <Link href="/register" className="text-terracotta-deep hover:underline">
            Crear cuenta →
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}

function AuthAside() {
  return (
    <div className="relative hidden lg:block">
      <div className="sticky top-28 space-y-5 rounded-2xl border border-line bg-bone-2/40 p-7">
        <p className="font-mono text-[10px] uppercase tracking-widest text-terracotta">
          Cuentas demo
        </p>
        <ul className="space-y-3 text-sm">
          <li className="space-y-1">
            <p className="font-display text-lg">Anfitrión</p>
            <p className="num text-xs text-ink-soft">host@staylocal.local</p>
            <p className="num text-xs text-ink-mute">password123</p>
          </li>
          <li className="space-y-1 border-t border-line pt-3">
            <p className="font-display text-lg">Turista</p>
            <p className="num text-xs text-ink-soft">guest@staylocal.local</p>
            <p className="num text-xs text-ink-mute">password123</p>
          </li>
        </ul>
        <p className="border-t border-line pt-3 text-xs text-ink-mute">
          Sembradas por <span className="num">prisma/seed.ts</span> al inicializar la base.
        </p>
      </div>
    </div>
  );
}
