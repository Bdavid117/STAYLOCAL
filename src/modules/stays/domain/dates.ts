// Helpers para trabajar con fechas tipo "date" (sin hora) que es como
// modelamos Availability y reservas.

export function toUtcDate(input: string | Date): Date {
  const d = typeof input === "string" ? new Date(input) : input;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

// Enumera noches en [checkIn, checkOut). El último día NO se ocupa
// porque es día de check-out.
export function enumerateNights(checkIn: Date, checkOut: Date): Date[] {
  const start = toUtcDate(checkIn);
  const end = toUtcDate(checkOut);
  const nights: Date[] = [];
  for (
    let d = new Date(start);
    d < end;
    d = new Date(d.getTime() + 24 * 60 * 60 * 1000)
  ) {
    nights.push(new Date(d));
  }
  return nights;
}
