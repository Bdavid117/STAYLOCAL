import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/shared/db";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

async function registerAction(formData: FormData) {
  "use server";
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    throw new Error("Datos inválidos");
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) throw new Error("El correo ya está registrado");

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await bcrypt.hash(parsed.data.password, 12),
    },
  });

  redirect("/login");
}

export default function RegisterPage() {
  return (
    <section className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-bold">Crear cuenta</h1>
      <form action={registerAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nombre</label>
          <input name="name" required className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Correo</label>
          <input name="email" type="email" required className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Contraseña</label>
          <input name="password" type="password" required minLength={8} className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <button type="submit" className="w-full rounded bg-brand py-2 text-white hover:bg-brand-dark">
          Registrarme
        </button>
      </form>
    </section>
  );
}
