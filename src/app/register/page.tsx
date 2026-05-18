import Link from "next/link";
import { AuthShell } from "@/components/ui/AuthShell";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <AuthShell
      serial="§A·01"
      kicker="Inscripción"
      title={
        <>
          Reserva por <em className="italic text-terracotta">primera vez</em>.
        </>
      }
      subtitle="Crea tu cuenta para reservar como huésped o publicar como anfitrión. Mismo perfil, ambos lados."
      aside={
        <div className="relative hidden lg:block">
          <div className="sticky top-28 space-y-4 rounded-2xl border border-line bg-bone-2/40 p-7">
            <p className="font-mono text-[10px] uppercase tracking-widest text-terracotta">
              Qué obtienes
            </p>
            <ul className="space-y-3 text-sm text-ink-soft">
              <Bullet>Historial de reservas siempre a la mano.</Bullet>
              <Bullet>Publicar alojamientos sin trámite adicional.</Bullet>
              <Bullet>Recuperación de contraseña por correo en 30 min.</Bullet>
            </ul>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        <RegisterForm />
        <p className="border-t border-line pt-4 text-center text-sm text-ink-soft">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-terracotta-deep hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
      <span>{children}</span>
    </li>
  );
}
