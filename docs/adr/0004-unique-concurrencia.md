# ADR-0004 · UNIQUE(stayId, date) como guard de doble reserva

**Estado:** Aceptado · **Fecha:** 2026-05-18 · **Crítico para el dominio**

## Contexto

CU-17 (Realizar Reserva) y CU-20 (Validar Disponibilidad) son la pieza más
sensible del sistema: si dos huéspedes reservan las mismas fechas al mismo
tiempo, **solo una reserva debe ganar**. Esto es una clásica race condition
distribuida.

El plan original sugería usar **Redis advisory locks** + Postgres
serializable. Para un proyecto académico esto añade un servicio externo
(Redis), una dependencia más para los profesores, y un punto de fallo
adicional.

## Decisión

Usar la **constraint `@@unique([stayId, date])` en el modelo `Availability`**
como guard atómico. El service `createBooking` envuelve:

1. `prisma.$transaction` con `isolationLevel: Serializable`.
2. `prisma.availability.createMany(...)` inserta una fila por cada noche.
3. Si otra reserva concurrente ya tomó alguna fecha, Postgres lanza
   `P2002` (unique violation). El service lo captura y lo traduce a
   `BookingConflictError`. La tx hace rollback completo.

```ts
try {
  await prisma.$transaction(async (tx) => {
    await tx.booking.create({ ... });
    await tx.availability.createMany({ data: nights.map(...) });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
} catch (err) {
  if (err.code === "P2002") throw new BookingConflictError();
  throw err;
}
```

## Consecuencias

**Positivas**

- Cero infraestructura adicional. La DB ya está.
- Atomicidad garantizada por Postgres. No hay forma de que dos reservas
  ganen — la UNIQUE no admite ambigüedad.
- Verificable con un test (ya existe en
  `tests/unit/bookings/create-booking.test.ts`): dos llamadas concurrentes
  a `createBooking` con fechas que se solapan → exactamente una falla.

**Negativas / mitigación**

- En caso de conflicto, el usuario ve un error y debe reintentar con
  otras fechas. **Mitigación:** mensaje claro
  (`BookingConflictError.message`) + UX preserva las fechas en el form.
- Si en el futuro hacemos sharding o vamos a una DB distribuida tipo
  CockroachDB/Citus, hay que revalidar este enfoque.

## Alternativas rechazadas

- **Redis advisory lock + serializable**: rechazado por infraestructura
  innecesaria para el alcance.
- **Solo `SELECT ... FOR UPDATE`**: no resuelve el caso de la primera
  reserva sobre una fila inexistente (insert race). La UNIQUE sí.
- **Cola FIFO de reservas**: rechazado por sobreingeniería.

## Referencias

- `src/modules/bookings/services/create-booking.ts` — implementación.
- `tests/unit/bookings/create-booking.test.ts` — test concurrente.
- `prisma/schema.prisma` — modelo `Availability` con `@@unique([stayId, date])`.
