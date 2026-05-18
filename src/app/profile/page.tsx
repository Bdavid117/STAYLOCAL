import { redirect } from "next/navigation";
import { auth } from "@/shared/auth";
import { prisma } from "@/shared/db";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true, photoUrl: true, role: true },
  });
  if (!user) redirect("/login");

  return (
    <section className="mx-auto max-w-lg space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Mi perfil</h1>
        <p className="text-sm text-gray-600">
          {user.email} · {user.role.toLowerCase()}
        </p>
      </header>
      <ProfileForm
        initial={{
          name: user.name,
          phone: user.phone,
          photoUrl: user.photoUrl,
        }}
      />
    </section>
  );
}
