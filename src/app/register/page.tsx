import Link from "next/link";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <section className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-bold">Crear cuenta</h1>
      <RegisterForm />
      <p className="text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-brand hover:underline">
          Inicia sesión
        </Link>
      </p>
    </section>
  );
}
