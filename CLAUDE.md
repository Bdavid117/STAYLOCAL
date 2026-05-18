# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

**StayLocal** is an Airbnb-style tourist lodging platform built as the Software Engineering I course project at Universidad Nacional de Colombia (2026). The full sizing and costing analysis lives in `Estimacion_StayLocal.pdf` at the repo root — read it before making scope changes; it is the source of truth for the 27 use cases (CU-01…CU-27), the 8 internal logical files, and the two external interfaces (payment gateway, mail service).

Constraints that drive the design:
- 197 adjusted function points → ~8.9 KLOC target in TypeScript.
- 9-month timeline, 4-5 person **student team** (AEXP=Low, LEXP=Low). Prefer frameworks that impose structure over freeform code.
- **This is an academic delivery, not a production SaaS.** Favor simplicity over operational sophistication. No microservices, no Redis, no managed queues — single Next.js app + Postgres + Docker locally.

## Architecture: Modular Monolith inside a single Next.js App

One deployable, internally split by **bounded context** under `src/modules/`. Each module follows the same internal layout:

```
domain/    # entities, value objects, business rules (no framework imports)
services/  # use cases — one per CU when possible
repo/      # Prisma repositories and external adapters
```

| Module | Owns | Use cases |
|---|---|---|
| `users` | auth, profiles, roles | CU-01..CU-06 |
| `stays` | listings, images, availability | CU-07..CU-16 |
| `bookings` | reservations, history | CU-17..CU-20 |
| `payments` | payment processing, receipts | CU-21, CU-22 |
| `reviews` | ratings, comments | CU-23..CU-25 |
| `notifications` | in-app + email, reminders | CU-26, CU-27 |

**Cross-module rule:** modules talk to each other only through `services/` (use cases). Never reach into another module's `repo/` or `domain/` directly. This is the boundary that keeps a future extraction feasible.

## Stack (locked in)

- **Next.js 15 App Router** as the only runtime — pages + Server Actions + Route Handlers in `src/app/`.
- **PostgreSQL 16** via Docker (`docker-compose.yml`). No PostGIS — geo search uses plain `lat/lng` + Haversine in SQL.
- **Prisma 6** as ORM. Models map 1:1 to the 8 ILFs.
- **NextAuth v5** (credentials) with `@auth/prisma-adapter`. Session strategy = JWT. Entry point: `src/shared/auth.ts`.
- **Tailwind CSS 3** for styling.
- **Zod** for validation; schemas shared between Server Actions and forms.
- **Nodemailer + MailHog** in dev (SMTP on `localhost:1025`, UI on `localhost:8025`).
- **Payments behind a port.** Default adapter is `FakePaymentGateway` — always returns PAID. Switching to Stripe sandbox means a new adapter behind the same `PaymentGatewayPort`. Use cases must never import a payment SDK directly.
- **Tests:** Vitest for units, Playwright for E2E. Coverage target: 70% overall, **100% on the booking-creation and payment use cases**.

## Non-Negotiable Rules

1. **Booking concurrency (CU-17, CU-20).** Reservation creation must run inside a Prisma `$transaction` with `isolationLevel: 'Serializable'` and insert rows into `Availability(stayId, date)`. The `@@unique([stayId, date])` constraint **is** the concurrency guard — if another booking grabbed the date first, `P2002` aborts the transaction. Do not weaken this; any change to booking flow needs a test that simulates two concurrent calls.
2. **External services live behind ports** (`src/shared/ports/`). `PaymentGatewayPort`, `MailerPort`. Adapters live in the owning module's `repo/`. Never `import "stripe"` or `import "nodemailer"` from a use case.
3. **No business logic in route handlers or Server Actions beyond parsing+dispatch.** Parse the form with Zod, call a use case, return/redirect. Arithmetic and state branching belong in `services/`.
4. **Prisma is touched only inside `repo/`.** Use cases receive repositories (or the prisma client) via parameter, not via top-level import — keeps them testable.
5. **Money is `Decimal` in Prisma**, never `Float`. Already enforced in the schema (`@db.Decimal(10, 2)`).

## Data Model Anchors

The eight Prisma models match the 8 ILFs one-to-one — do not collapse or split them without updating the PDF estimation:

`User`, `Stay`, `StayImage`, `Availability`, `Booking`, `Payment`, `Review`, `Notification`.

Critical schema decisions:
- `Availability.@@unique([stayId, date])` — the lock for CU-20.
- `Stay.lat`/`Stay.lng` indexed together — drives Haversine search (CU-13).
- `Booking.@@index([guestId, status])` — drives history view (CU-19).
- `Payment.bookingId @unique` — one payment per booking (CU-21).

## Build / Test / Run

| Command | What it does |
|---|---|
| `pnpm dev` | Next dev server on `:3000` |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | Next ESLint |
| `pnpm test` | Vitest (units) |
| `pnpm test -- <pattern>` | Single test file or pattern |
| `pnpm test:e2e` | Playwright |
| `pnpm db:migrate` | Apply Prisma migrations in dev |
| `pnpm db:seed` | Reset demo data (`prisma/seed.ts`) |
| `pnpm db:studio` | Prisma Studio |
| `docker compose up -d` | Start Postgres + MailHog |

Update this section the moment new scripts land in `package.json` — do not let it drift.

## Roadmap Reference

Sprints 1-18 (2 weeks each, 9 months) follow the phase plan agreed with the team:

- **Fase 0** (S1-2): Scaffold + CI.
- **Fase 1** (S3-8): CU-01…CU-10 — users + publish.
- **Fase 2** (S9-14): CU-11…CU-16, CU-20 — search + availability.
- **Fase 3** (S15-22): CU-17…CU-19, CU-21, CU-22 — **MVP boundary** (book + pay end-to-end).
- **Fase 4** (S23-26): CU-23…CU-27 — reviews + notifications.
- **Fase 5** (S27-36): hardening, E2E coverage, docs, defense.

Anything proposed before end-of-Sprint-22 that is not on the path to "guest can search, book and pay" should be questioned.
