export class BookingNotReviewableError extends Error {
  readonly code = "BOOKING_NOT_REVIEWABLE";
  constructor(message = "Esta reserva no se puede calificar aún.") {
    super(message);
  }
}

export class ReviewAlreadyExistsError extends Error {
  readonly code = "REVIEW_ALREADY_EXISTS";
  constructor() {
    super("Ya calificaste esta reserva.");
  }
}
