# Secuencia · CU-17 Realizar Reserva (con concurrencia)

Dos escenarios:

1. **Ruta feliz** — un huésped, las fechas están libres.
2. **Conflicto** — dos huéspedes reservan al mismo tiempo fechas que
   se solapan. La UNIQUE constraint en `Availability` actúa como lock
   atómico (ver ADR-0004).

## Ruta feliz

```mermaid
sequenceDiagram
  autonumber
  actor Guest as Huésped
  participant UI as /stays/[id]
  participant Action as createBookingAction
  participant Service as createBooking
  participant DB as Postgres
  participant Notify as notifyEvent

  Guest->>UI: selecciona fechas, clic "Reservar"
  UI->>Action: POST FormData {checkIn, checkOut, stayId}
  Action->>Service: createBooking(guestId, input)
  Service->>DB: BEGIN tx (Serializable)
  Service->>DB: SELECT stay (validar ACTIVE, host != guest)
  Service->>DB: INSERT booking (status CONFIRMED)
  Service->>DB: INSERT availability rows (BOOKED) via createMany
  Note over DB: UNIQUE(stayId, date) acepta todas las filas
  Service->>DB: COMMIT
  Service-->>Action: Booking
  Action->>Notify: notifyBookingCreated(guest, host)
  Notify-->>Action: ok (fire and forget)
  Action-->>UI: redirect /bookings/:id/pay
```

## Conflicto concurrente

```mermaid
sequenceDiagram
  autonumber
  actor A as Huésped A
  actor B as Huésped B
  participant Service as createBooking
  participant DB as Postgres

  par A reserva 01-04 Aug
    A->>Service: createBooking(stayId, 01-04 Aug)
    Service->>DB: BEGIN tx (Serializable)
    Service->>DB: INSERT booking + availability(01,02,03)
    DB-->>Service: ok
    Service->>DB: COMMIT
    Service-->>A: Booking CONFIRMED
  and B reserva 03-05 Aug (solapa día 03)
    B->>Service: createBooking(stayId, 03-05 Aug)
    Service->>DB: BEGIN tx (Serializable)
    Service->>DB: INSERT booking + availability(03,04)
    DB-->>Service: P2002 UNIQUE violation (stayId, date=03)
    Service->>DB: ROLLBACK
    Service-->>B: throw BookingConflictError
  end

  Note over Service,DB: Postgres serializa las dos txs. La que llegue<br/>segunda al INSERT de la fecha 03 falla con P2002.<br/>El service traduce P2002 a BookingConflictError.<br/>Estado final: 1 reserva, 3 noches BOOKED.
```

## Garantías

- **Atomicidad**: si cualquier `INSERT` en `availability` falla, toda
  la tx hace rollback. No quedan bookings huérfanos.
- **No double-booking**: la UNIQUE constraint es física en la DB.
  Imposible de violar incluso con miles de requests concurrentes.
- **Verificable**: `tests/unit/bookings/create-booking.test.ts` ejecuta
  `Promise.allSettled([reservarA, reservarB])` y verifica que
  *exactamente uno* gana y la DB queda con 1 booking + N rows BOOKED.

## Referencias

- `src/modules/bookings/services/create-booking.ts`
- `tests/unit/bookings/create-booking.test.ts` — test concurrente
- ADR-0004 · UNIQUE como guard de doble reserva
