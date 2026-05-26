import { PrismaClient, Role, StayStatus, BookingStatus, AvailabilityStatus, PaymentStatus, NotificationType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed...");
  const passwordHash = await bcrypt.hash("password123", 12);

  const host1 = await prisma.user.upsert({
    where: { email: "host@staylocal.local" },
    update: {},
    create: {
      email: "host@staylocal.local",
      passwordHash,
      role: Role.HOST,
      name: "Carlos Mendoza",
      phone: "+57 300 123 4567",
    },
  });

  const host2 = await prisma.user.upsert({
    where: { email: "anahi@staylocal.local" },
    update: {},
    create: {
      email: "anahi@staylocal.local",
      passwordHash,
      role: Role.HOST,
      name: "Ana Hernández",
      phone: "+57 301 987 6543",
    },
  });

  const guest1 = await prisma.user.upsert({
    where: { email: "guest@staylocal.local" },
    update: {},
    create: {
      email: "guest@staylocal.local",
      passwordHash,
      role: Role.GUEST,
      name: "María García",
    },
  });

  const guest2 = await prisma.user.upsert({
    where: { email: "juan.perez@email.com" },
    update: {},
    create: {
      email: "juan.perez@email.com",
      passwordHash,
      role: Role.GUEST,
      name: "Juan Pérez",
    },
  });

  const guest3 = await prisma.user.upsert({
    where: { email: "laura.rodriguez@email.com" },
    update: {},
    create: {
      email: "laura.rodriguez@email.com",
      passwordHash,
      role: Role.GUEST,
      name: "Laura Rodríguez",
    },
  });

  console.log("Usuarios creados.");

  const stay1 = await prisma.stay.upsert({
    where: { id: "stay-candelaria-001" },
    update: {},
    create: {
      id: "stay-candelaria-001",
      hostId: host1.id,
      title: "Apartamento en La Candelaria",
      description: "Cómodo apartamento en el centro histórico de Bogotá. Cerca al Museo del Oro, la Plaza de Bolívar y el Chorro de Quevedo. Ideal para una escapada cultural.",
      pricePerNight: 120000,
      capacity: 3,
      lat: 4.5981,
      lng: -74.0758,
      locationText: "La Candelaria, Bogotá, Colombia",
      status: StayStatus.ACTIVE,
    },
  });

  const stay2 = await prisma.stay.upsert({
    where: { id: "stay-zona-rosa-002" },
    update: {},
    create: {
      id: "stay-zona-rosa-002",
      hostId: host1.id,
      title: "Loft moderno en Zona Rosa",
      description: "Espacios amplios con excelente iluminación, cerca de centros comerciales y vida nocturna. Perfecto para viajeros de negocios o turismo.",
      pricePerNight: 250000,
      capacity: 2,
      lat: 4.6653,
      lng: -74.0568,
      locationText: "Zona Rosa, Bogotá, Colombia",
      status: StayStatus.ACTIVE,
    },
  });

  const stay3 = await prisma.stay.upsert({
    where: { id: "stay-chapinero-003" },
    update: {},
    create: {
      id: "stay-chapinero-003",
      hostId: host2.id,
      title: "Casa colonial en Chapinero",
      description: "Casa remodelada con arquitectura colonial, jardín interior y terrace. Ubicada en una zona tranquila pero céntrica.",
      pricePerNight: 180000,
      capacity: 5,
      lat: 4.6288,
      lng: -74.0635,
      locationText: "Chapinero, Bogotá, Colombia",
      status: StayStatus.ACTIVE,
    },
  });

  const stay4 = await prisma.stay.upsert({
    where: { id: "stay-usaquen-004" },
    update: {},
    create: {
      id: "stay-usaquen-004",
      hostId: host2.id,
      title: "Apartamento en Usaquén",
      description: "Zona exclusiva con restaurantes y tiendas artesanales. Apartamento completamente equipado para estadías cortas y largas.",
      pricePerNight: 320000,
      capacity: 4,
      lat: 4.6769,
      lng: -74.0486,
      locationText: "Usaquén, Bogotá, Colombia",
      status: StayStatus.ACTIVE,
    },
  });

  console.log("Stays creados.");

  const stay1Image1 = await prisma.stayImage.upsert({
    where: { id: "img-stay1-1" },
    update: {},
    create: {
      id: "img-stay1-1",
      stayId: stay1.id,
      url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      orderIdx: 0,
    },
  });

  const stay1Image2 = await prisma.stayImage.upsert({
    where: { id: "img-stay1-2" },
    update: {},
    create: {
      id: "img-stay1-2",
      stayId: stay1.id,
      url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
      orderIdx: 1,
    },
  });

  await prisma.stayImage.upsert({
    where: { id: "img-stay2-1" },
    update: {},
    create: {
      id: "img-stay2-1",
      stayId: stay2.id,
      url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      orderIdx: 0,
    },
  });

  await prisma.stayImage.upsert({
    where: { id: "img-stay3-1" },
    update: {},
    create: {
      id: "img-stay3-1",
      stayId: stay3.id,
      url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
      orderIdx: 0,
    },
  });

  await prisma.stayImage.upsert({
    where: { id: "img-stay4-1" },
    update: {},
    create: {
      id: "img-stay4-1",
      stayId: stay4.id,
      url: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800",
      orderIdx: 0,
    },
  });

  console.log("Imágenes creadas.");

  const today = new Date();
  const checkIn1 = new Date(today);
  checkIn1.setDate(today.getDate() + 7);
  const checkOut1 = new Date(checkIn1);
  checkOut1.setDate(checkIn1.getDate() + 3);

  const checkIn2 = new Date(today);
  checkIn2.setDate(today.getDate() - 15);
  const checkOut2 = new Date(checkIn2);
  checkOut2.setDate(checkIn2.getDate() + 4);

  const checkIn3 = new Date(today);
  checkIn3.setDate(today.getDate() - 30);
  const checkOut3 = new Date(checkIn3);
  checkOut3.setDate(checkIn3.getDate() + 5);

  const booking1 = await prisma.booking.upsert({
    where: { id: "booking-001" },
    update: {},
    create: {
      id: "booking-001",
      guestId: guest1.id,
      stayId: stay1.id,
      checkIn: checkIn1,
      checkOut: checkOut1,
      totalAmount: 360000,
      status: BookingStatus.CONFIRMED,
    },
  });

  const booking2 = await prisma.booking.upsert({
    where: { id: "booking-002" },
    update: {},
    create: {
      id: "booking-002",
      guestId: guest2.id,
      stayId: stay2.id,
      checkIn: checkIn2,
      checkOut: checkOut2,
      totalAmount: 1000000,
      status: BookingStatus.COMPLETED,
    },
  });

  const booking3 = await prisma.booking.upsert({
    where: { id: "booking-003" },
    update: {},
    create: {
      id: "booking-003",
      guestId: guest3.id,
      stayId: stay3.id,
      checkIn: checkIn3,
      checkOut: checkOut3,
      totalAmount: 900000,
      status: BookingStatus.COMPLETED,
    },
  });

  const booking4 = await prisma.booking.upsert({
    where: { id: "booking-004" },
    update: {},
    create: {
      id: "booking-004",
      guestId: guest1.id,
      stayId: stay4.id,
      checkIn: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
      checkOut: new Date(today.getTime() + 35 * 24 * 60 * 60 * 1000),
      totalAmount: 1600000,
      status: BookingStatus.PENDING,
    },
  });

  console.log("Bookings creados.");

  await prisma.payment.upsert({
    where: { id: "payment-001" },
    update: {},
    create: {
      id: "payment-001",
      bookingId: booking1.id,
      amount: 360000,
      currency: "COP",
      provider: "fake",
      status: PaymentStatus.PENDING,
    },
  });

  await prisma.payment.upsert({
    where: { id: "payment-002" },
    update: {},
    create: {
      id: "payment-002",
      bookingId: booking2.id,
      amount: 1000000,
      currency: "COP",
      provider: "fake",
      status: PaymentStatus.PAID,
      paidAt: new Date(),
    },
  });

  await prisma.payment.upsert({
    where: { id: "payment-003" },
    update: {},
    create: {
      id: "payment-003",
      bookingId: booking3.id,
      amount: 900000,
      currency: "COP",
      provider: "fake",
      status: PaymentStatus.PAID,
      paidAt: new Date(),
    },
  });

  await prisma.payment.upsert({
    where: { id: "payment-004" },
    update: {},
    create: {
      id: "payment-004",
      bookingId: booking4.id,
      amount: 1600000,
      currency: "COP",
      provider: "fake",
      status: PaymentStatus.PENDING,
    },
  });

  console.log("Payments creados.");

  await prisma.review.upsert({
    where: { id: "review-001" },
    update: {},
    create: {
      id: "review-001",
      bookingId: booking2.id,
      stayId: stay2.id,
      userId: guest2.id,
      rating: 5,
      comment: "Excelente ubicación y el apartamento superó mis expectativas. Muy recomendado.",
    },
  });

  await prisma.review.upsert({
    where: { id: "review-002" },
    update: {},
    create: {
      id: "review-002",
      bookingId: booking3.id,
      stayId: stay3.id,
      userId: guest3.id,
      rating: 4,
      comment: "La casa es hermosa y el vecindario muy tranquilo. La única mejora sería tener WiFi más rápido.",
    },
  });

  console.log("Reviews creadas.");

  await prisma.notification.createMany({
    data: [
      {
        userId: guest1.id,
        type: NotificationType.BOOKING_CREATED,
        payload: { bookingId: booking1.id, stayTitle: stay1.title },
        readAt: null,
      },
      {
        userId: guest1.id,
        type: NotificationType.PAYMENT_RECEIVED,
        payload: { bookingId: booking1.id, amount: 360000 },
        readAt: null,
      },
      {
        userId: guest2.id,
        type: NotificationType.REVIEW_RECEIVED,
        payload: { stayId: stay2.id, rating: 5 },
        readAt: new Date(),
      },
      {
        userId: host1.id,
        type: NotificationType.BOOKING_CREATED,
        payload: { bookingId: booking1.id, guestName: guest1.name },
        readAt: null,
      },
      {
        userId: host2.id,
        type: NotificationType.REMINDER,
        payload: { message: "Tienes una reservación confirmada para mañana" },
        readAt: null,
      },
    ],
  });

  console.log("Notifications creadas.");

  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(today.getDate() + 2);

  await prisma.availability.createMany({
    data: [
      { stayId: stay1.id, date: checkIn1, status: AvailabilityStatus.BOOKED, bookingId: booking1.id },
      { stayId: stay1.id, date: new Date(checkIn1.getTime() + 86400000), status: AvailabilityStatus.BOOKED, bookingId: booking1.id },
      { stayId: stay1.id, date: new Date(checkIn1.getTime() + 2 * 86400000), status: AvailabilityStatus.BOOKED, bookingId: booking1.id },
      { stayId: stay2.id, date: checkIn2, status: AvailabilityStatus.BOOKED, bookingId: booking2.id },
      { stayId: stay2.id, date: new Date(checkIn2.getTime() + 86400000), status: AvailabilityStatus.BOOKED, bookingId: booking2.id },
      { stayId: stay2.id, date: new Date(checkIn2.getTime() + 2 * 86400000), status: AvailabilityStatus.BOOKED, bookingId: booking2.id },
      { stayId: stay2.id, date: new Date(checkIn2.getTime() + 3 * 86400000), status: AvailabilityStatus.BOOKED, bookingId: booking2.id },
      { stayId: stay3.id, date: checkIn3, status: AvailabilityStatus.BOOKED, bookingId: booking3.id },
      { stayId: stay3.id, date: new Date(checkIn3.getTime() + 86400000), status: AvailabilityStatus.BOOKED, bookingId: booking3.id },
      { stayId: stay3.id, date: new Date(checkIn3.getTime() + 2 * 86400000), status: AvailabilityStatus.BOOKED, bookingId: booking3.id },
      { stayId: stay3.id, date: new Date(checkIn3.getTime() + 3 * 86400000), status: AvailabilityStatus.BOOKED, bookingId: booking3.id },
      { stayId: stay3.id, date: new Date(checkIn3.getTime() + 4 * 86400000), status: AvailabilityStatus.BOOKED, bookingId: booking3.id },
      { stayId: stay1.id, date: tomorrow, status: AvailabilityStatus.AVAILABLE },
      { stayId: stay1.id, date: dayAfter, status: AvailabilityStatus.BLOCKED },
      { stayId: stay4.id, date: tomorrow, status: AvailabilityStatus.AVAILABLE },
    ],
  });

  console.log("Availability creados.");
  console.log("Seed completado exitosamente!");
}

main()
  .catch((e) => {
    console.error("Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });