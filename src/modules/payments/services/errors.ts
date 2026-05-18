export class BookingNotPayableError extends Error {
  readonly code = "BOOKING_NOT_PAYABLE";
  constructor(message = "Esta reserva no puede ser pagada en este momento.") {
    super(message);
  }
}

export class PaymentAlreadyExistsError extends Error {
  readonly code = "PAYMENT_ALREADY_EXISTS";
  constructor() {
    super("Esta reserva ya tiene un pago registrado.");
  }
}

export class PaymentDeclinedError extends Error {
  readonly code = "PAYMENT_DECLINED";
  constructor(message = "El pago fue rechazado por la pasarela.") {
    super(message);
  }
}

export class PaymentNotFoundError extends Error {
  readonly code = "PAYMENT_NOT_FOUND";
  constructor() {
    super("Pago no encontrado.");
  }
}
