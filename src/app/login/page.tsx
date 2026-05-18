import { signIn } from "@/shared/auth";
import { redirect } from "next/navigation";

async function loginAction(formData: FormData) {
  "use server";
  await signIn("credentials", {
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: "/",
  });
  redirect("/");
}

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-bold">Iniciar sesión</h1>
      <form action={loginAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Correo</label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Contraseña</label>
          <input
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded bg-brand py-2 text-white hover:bg-brand-dark"
        >
          Entrar
        </button>
      </form>
    </section>
  );
}
