import { prisma } from "@/shared/db";
import { PrismaBookingRepository } from "@/modules/bookings/repo/booking-repository";
import { PrismaAvailabilityRepository } from "@/modules/stays/repo/availability-repository";

export function bookingsDeps() {
  return {
    db: prisma,
    bookings: new PrismaBookingRepository(prisma),
    availability: new PrismaAvailabilityRepository(prisma),
  };
}
