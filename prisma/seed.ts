import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  const host = await prisma.user.upsert({
    where: { email: "host@staylocal.local" },
    update: {},
    create: {
      email: "host@staylocal.local",
      passwordHash,
      role: Role.HOST,
      name: "Anfitrión Demo",
    },
  });

  await prisma.user.upsert({
    where: { email: "guest@staylocal.local" },
    update: {},
    create: {
      email: "guest@staylocal.local",
      passwordHash,
      role: Role.GUEST,
      name: "Turista Demo",
    },
  });

  await prisma.stay.create({
    data: {
      hostId: host.id,
      title: "Apartamento en La Candelaria",
      description: "Cómodo apartamento en el centro histórico de Bogotá.",
      pricePerNight: 120000,
      capacity: 3,
      lat: 4.5981,
      lng: -74.0758,
      locationText: "Bogotá, Colombia",
      images: {
        create: [{ url: "/uploads/demo.jpg", orderIdx: 0 }],
      },
    },
  });

  console.log("Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
