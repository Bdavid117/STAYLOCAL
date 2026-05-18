// Tipos del dominio del módulo bookings. Los services dependen de
// estas interfaces; los repos las implementan con Prisma.

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export type Booking = {
  id: string;
  guestId: string;
  stayId: string;
  checkIn: Date;
  checkOut: Date;
  totalAmount: number;
  status: BookingStatus;
  createdAt: Date;
};

export type BookingWithStay = Booking & {
  stay: {
    id: string;
    title: string;
    locationText: string;
    coverImageUrl: string | null;
  };
};

export interface BookingRepository {
  findById(id: string): Promise<Booking | null>;
  findByIdForGuest(id: string, guestId: string): Promise<Booking | null>;
  listByGuest(
    guestId: string,
    filter?: { status?: BookingStatus }
  ): Promise<BookingWithStay[]>;
  updateStatus(id: string, status: BookingStatus): Promise<void>;
}
