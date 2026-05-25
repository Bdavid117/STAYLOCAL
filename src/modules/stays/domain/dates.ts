// Helpers para trabajar con fechas tipo "date" (sin hora) que es como
// modelamos Availability y reservas.

export function toUtcDate(input: string | Date): Date {
  if (input instanceof Date) {
    const d = input;
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  }

  // If the input is a date-only string like "2026-08-01", parse it as UTC
  // to avoid timezone shifts across environments. For full ISO strings,
  // fall back to Date parsing.
  const isoDateOnly = /^\d{4}-\d{2}-\d{2}$/;
  if (isoDateOnly.test(input)) {
    const [y, m, d] = input.split("-").map((s) => parseInt(s, 10));
    return new Date(Date.UTC(y, m - 1, d));
  }

  const parsed = new Date(input);
  return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
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
