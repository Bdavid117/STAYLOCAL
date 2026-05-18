import Link from "next/link";
import { LoginForm } from "./login-form";

type Props = {
  searchParams: Promise<{ registered?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  return (
    <section className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-bold">Iniciar sesión</h1>
      {params.registered && (
        <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          Cuenta creada. Inicia sesión con tu correo y contraseña.
        </p>
      )}
      <LoginForm />
      <div className="flex justify-between text-sm">
        <Link href="/forgot" className="text-brand hover:underline">
          ¿Olvidaste tu contraseña?
        </Link>
        <Link href="/register" className="text-brand hover:underline">
          Crear cuenta
        </Link>
      </div>
    </section>
  );
}
