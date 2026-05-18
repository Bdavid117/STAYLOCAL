# Modelo Entidad-Relación · StayLocal

Los 8 ILF identificados en el PDF de estimación están mapeados 1:1 con
modelos Prisma en `prisma/schema.prisma`. Se añade `PasswordResetToken`
como detalle de implementación de CU-03 (no es un ILF nuevo, vive
dentro del ámbito de `User`).

```mermaid
erDiagram
  User ||--o{ Stay : "publica (host)"
  User ||--o{ Booking : "reserva (guest)"
  User ||--o{ Review : "escribe"
  User ||--o{ Notification : "recibe"
  User ||--o{ PasswordResetToken : "solicita"

  Stay ||--o{ StayImage : "tiene"
  Stay ||--o{ Availability : "calendario"
  Stay ||--o{ Booking : "recibe"
  Stay ||--o{ Review : "califica"

  Booking ||--|| Payment : "paga"
  Booking ||--o| Review : "puede tener"
  Booking ||--o{ Availability : "bloquea noches"

  User {
    string id PK
    string email UK
    string passwordHash
    enum   role "GUEST · HOST · ADMIN"
    string name
    string phone "nullable"
    string photoUrl "nullable"
    datetime createdAt
  }

  Stay {
    string id PK
    string hostId FK
    string title
    string description
    decimal pricePerNight
    int    capacity
    float  lat
    float  lng
    string locationText
    enum   status "ACTIVE · INACTIVE · DELETED"
    datetime createdAt
  }

  StayImage {
    string id PK
    string stayId FK
    string url
    int    orderIdx
  }

  Availability {
    string id PK
    string stayId FK
    date   date
    enum   status "AVAILABLE · BLOCKED · BOOKED"
    string bookingId "nullable"
  }

  Booking {
    string id PK
    string guestId FK
    string stayId FK
    date   checkIn
    date   checkOut
    decimal totalAmount
    enum   status "PENDING · CONFIRMED · CANCELLED · COMPLETED"
    datetime createdAt
  }

  Payment {
    string id PK
    string bookingId FK,UK
    decimal amount
    string  currency
    string  provider "fake · stripe"
    string  providerRef "nullable"
    enum    status "PENDING · PAID · FAILED · REFUNDED"
    datetime paidAt "nullable"
  }

  Review {
    string id PK
    string bookingId FK,UK
    string stayId FK
    string userId FK
    int    rating "1..5"
    string comment
    datetime createdAt
  }

  Notification {
    string id PK
    string userId FK
    enum   type "BOOKING_CREATED · BOOKING_CANCELLED · PAYMENT_RECEIVED · REVIEW_RECEIVED · REMINDER"
    json   payload
    datetime readAt "nullable"
    datetime createdAt
  }

  PasswordResetToken {
    string id PK
    string userId FK
    string tokenHash UK
    datetime expiresAt
    datetime usedAt "nullable"
    datetime createdAt
  }
```

## Constraints e índices críticos

| Constraint / índice | Tabla | Para qué |
|---|---|---|
| `UNIQUE(stayId, date)` | `Availability` | **Guard atómico de doble reserva** (ver ADR-0004) |
| `UNIQUE(bookingId)` | `Payment` | Un solo pago por reserva |
| `UNIQUE(bookingId)` | `Review` | Una sola reseña por reserva |
| `UNIQUE(email)` | `User` | Identidad |
| `UNIQUE(tokenHash)` | `PasswordResetToken` | Búsqueda eficiente del token al validar |
| `INDEX(guestId, status)` | `Booking` | Historial de reservas del huésped (CU-19) |
| `INDEX(stayId)` | `Review` | Promedio + lista en ficha (CU-25) |
| `INDEX(userId, readAt)` | `Notification` | Conteo de no leídas (bell del header) |

## Decisión sobre tipos

- **Dinero** siempre `Decimal` en Prisma (`@db.Decimal(10, 2)`), nunca
  `Float` — evita errores de redondeo en `pricePerNight × noches`.
- **Fechas de calendario** (`Availability.date`, `Booking.checkIn/Out`)
  como `@db.Date` (sin hora), normalizadas a UTC 00:00 en el dominio
  (`toUtcDate` en `src/modules/stays/domain/dates.ts`).
- **Token de recuperación** solo se guarda hasheado (SHA-256). El raw
  se envía por correo y nunca queda en la base.
