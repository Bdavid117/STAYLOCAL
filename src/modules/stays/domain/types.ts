// Tipos del dominio del módulo stays. Los services dependen solo de
// estas interfaces; los repos en repo/ las implementan con Prisma.

export type StayStatus = "ACTIVE" | "INACTIVE" | "DELETED";
export type AvailabilityStatus = "AVAILABLE" | "BLOCKED" | "BOOKED";

export type Stay = {
  id: string;
  hostId: string;
  title: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  lat: number;
  lng: number;
  locationText: string;
  status: StayStatus;
  createdAt: Date;
};

export type StayImage = {
  id: string;
  stayId: string;
  url: string;
  orderIdx: number;
};

export type Availability = {
  id: string;
  stayId: string;
  date: Date;
  status: AvailabilityStatus;
  bookingId: string | null;
};

export type StayWithCover = Stay & {
  coverImageUrl: string | null;
};

export interface StayRepository {
  findById(id: string): Promise<Stay | null>;
  findByIdWithImages(
    id: string
  ): Promise<(Stay & { images: StayImage[] }) | null>;
  listByHost(hostId: string): Promise<StayWithCover[]>;
  create(input: {
    hostId: string;
    title: string;
    description: string;
    pricePerNight: number;
    capacity: number;
    lat: number;
    lng: number;
    locationText: string;
  }): Promise<Stay>;
  update(
    id: string,
    patch: Partial<{
      title: string;
      description: string;
      pricePerNight: number;
      capacity: number;
      lat: number;
      lng: number;
      locationText: string;
      status: StayStatus;
    }>
  ): Promise<Stay>;
  softDelete(id: string): Promise<void>;
}

export interface StayImageRepository {
  listByStay(stayId: string): Promise<StayImage[]>;
  append(stayId: string, url: string): Promise<StayImage>;
  delete(id: string): Promise<StayImage | null>;
}

export interface AvailabilityRepository {
  rangeForStay(stayId: string, from: Date, to: Date): Promise<Availability[]>;
  blockDates(stayId: string, dates: Date[]): Promise<void>;
  unblockDates(stayId: string, dates: Date[]): Promise<void>;
}
