export class BookingConflictError extends Error {
  readonly code = "BOOKING_CONFLICT";
  constructor() {
    super("Una o más fechas ya no están disponibles. Otro huésped se adelantó.");
  }
}

export class BookingNotFoundError extends Error {
  readonly code = "BOOKING_NOT_FOUND";
  constructor() {
    super("Reserva no encontrada.");
  }
}

export class StayNotBookableError extends Error {
  readonly code = "STAY_NOT_BOOKABLE";
  constructor(message = "Este alojamiento no se puede reservar.") {
    super(message);
  }
}

export class CannotCancelError extends Error {
  readonly code = "CANNOT_CANCEL";
  constructor(message = "Esta reserva no se puede cancelar.") {
    super(message);
  }
}

export class HostCannotBookOwnStayError extends Error {
  readonly code = "HOST_CANNOT_BOOK_OWN_STAY";
  constructor() {
    super("No puedes reservar tu propio alojamiento.");
  }
}
