import { redirect } from "next/navigation";
import { auth } from "@/shared/auth";
import { prisma } from "@/shared/db";
import { Container, SectionLabel } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true, photoUrl: true, role: true, createdAt: true },
  });
  if (!user) redirect("/login");

  const memberSince = new Intl.DateTimeFormat("es-CO", {
    month: "long",
    year: "numeric",
  }).format(user.createdAt);

  return (
    <Container size="default" className="py-14">
      <header className="mb-10 grid grid-cols-1 items-end gap-6 sm:grid-cols-12">
        <div className="space-y-3 sm:col-span-8">
          <SectionLabel serial="§C">Perfil</SectionLabel>
          <h1 className="font-display text-5xl leading-tight">
            {user.name}
          </h1>
          <p className="text-ink-soft num text-sm">
            {user.email} · miembro desde {memberSince}
          </p>
        </div>
        <div className="sm:col-span-4 sm:text-right">
          <Badge tone={user.role === "HOST" ? "moss" : user.role === "ADMIN" ? "ink" : "neutral"}>
            {user.role.toLowerCase()}
          </Badge>
        </div>
      </header>

      <div className="rounded-2xl border border-line bg-paper p-7 shadow-soft">
        <ProfileForm
          initial={{
            name: user.name,
            phone: user.phone,
            photoUrl: user.photoUrl,
          }}
        />
      </div>
    </Container>
  );
}
