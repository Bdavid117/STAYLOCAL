export class StayNotFoundError extends Error {
  readonly code = "STAY_NOT_FOUND";
  constructor() {
    super("Alojamiento no encontrado.");
  }
}

export class NotHostError extends Error {
  readonly code = "NOT_HOST";
  constructor() {
    super("Solo el anfitrión propietario puede modificar este alojamiento.");
  }
}

export class StayHasActiveBookingsError extends Error {
  readonly code = "STAY_HAS_ACTIVE_BOOKINGS";
  constructor() {
    super("No puedes eliminar un alojamiento con reservas activas.");
  }
}

export class DateBookedError extends Error {
  readonly code = "DATE_BOOKED";
  constructor() {
    super("Una o más fechas tienen reservas activas y no se pueden bloquear.");
  }
}

export class InvalidImageError extends Error {
  readonly code = "INVALID_IMAGE";
  constructor(message = "Formato o tamaño de imagen inválido.") {
    super(message);
  }
}
