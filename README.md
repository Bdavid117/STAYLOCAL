# StayLocal

Plataforma web de alojamiento turístico tipo Airbnb — proyecto académico de **Ingeniería de Software I**, Universidad Nacional de Colombia (2026).

Autores: Mariana Laverde Rivera, Miguel Angel Betancourth, Brayan David Collazos.

La estimación formal del proyecto (Puntos de Función, conversión a LOC y modelo COCOMO) está en `Estimacion_StayLocal.pdf`. El esqueleto del código implementa los 27 casos de uso (CU-01…CU-27) y los 8 archivos lógicos internos (ILF) descritos allí.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Prisma** + **PostgreSQL 16**
- **NextAuth** (credentials)
- **Tailwind CSS**
- **Zod** para validación compartida cliente/servidor
- **Vitest** + **Playwright** para pruebas
- **MailHog** para correo en desarrollo
- Adaptador de pagos **fake** por defecto (Stripe sandbox opcional)

## Requisitos

- Node.js ≥ 20
- pnpm ≥ 9

## Setup (desarrollo sin Docker — SQLite)

```bash
# 1. Copiar variables de entorno
cp .env.example .env

# 2. Instalar dependencias del proyecto
pnpm install

# 3. Migrar la base de datos y sembrar datos demo
pnpm db:migrate
pnpm db:seed

# 4. Iniciar el servidor de desarrollo
pnpm dev
```

## Setup (con PostgreSQL + MailHog — requiere Docker)

```bash
# 1. Copiar variables de entorno
cp .env.example .env

# 2. Levantar dependencias (Postgres + MailHog)
docker compose up -d

# 3. Instalar dependencias del proyecto
pnpm install

# 4. Cambiar a PostgreSQL
pnpm db:postgresql

# 5. Migrar la base de datos y sembrar datos demo
pnpm db:migrate
pnpm db:seed

# 6. Iniciar el servidor de desarrollo
pnpm dev
```

App: <http://localhost:3000> · MailHog UI: <http://localhost:8025> · Prisma Studio: `pnpm db:studio`.

Usuarios de demo (sembrados por `prisma/seed.ts`):

| Rol | Email | Contraseña | Nombre |
|---|---|---|---|
| Anfitrión | `host@staylocal.local` | `password123` | Carlos Mendoza |
| Anfitrión | `anahi@staylocal.local` | `password123` | Ana Hernández |
| Turista | `guest@staylocal.local` | `password123` | María García |
| Turista | `juan.perez@email.com` | `password123` | Juan Pérez |
| Turista | `laura.rodriguez@email.com` | `password123` | Laura Rodríguez |

## Scripts

| Script | Para qué |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm lint` / `pnpm typecheck` | Calidad estática |
| `pnpm test` | Pruebas unitarias (Vitest) |
| `pnpm test:e2e` | Pruebas E2E (Playwright) |
| `pnpm db:migrate` | Crea/aplica migraciones Prisma |
| `pnpm db:seed` | Carga datos demo |
| `pnpm db:studio` | Prisma Studio (UI de la DB) |
| `pnpm db:sqlite` | Cambiar a SQLite (desarrollo sin Docker) |
| `pnpm db:postgresql` | Cambiar a PostgreSQL (requiere Docker) |

## Arquitectura

Monolito modular en una sola app Next.js. Cada **bounded context** vive en `src/modules/<contexto>/` con tres carpetas:

- `domain/` — entidades, value objects, reglas (sin imports de framework).
- `services/` — casos de uso (uno por CU cuando es posible).
- `repo/` — acceso a Prisma y adaptadores externos.

Mapa de contextos → casos de uso:

| Módulo | Casos de uso |
|---|---|
| `users` | CU-01 … CU-06 |
| `stays` | CU-07 … CU-16 |
| `bookings` | CU-17 … CU-20 |
| `payments` | CU-21, CU-22 |
| `reviews` | CU-23 … CU-25 |
| `notifications` | CU-26, CU-27 |

**Regla clave de concurrencia (CU-17/CU-20):** la reserva se crea dentro de una transacción `Serializable` que inserta filas en `Availability(stayId, date)`. La constraint UNIQUE actúa como lock — si otra reserva ya tomó la fecha, Prisma falla con `P2002` y se cancela la transacción. Esto elimina la necesidad de un lock distribuido para el alcance académico.

## Casos de uso ↔ rutas (mapa rápido)

| Ruta | Casos de uso |
|---|---|
| `/register`, `/login`, `/api/auth/*` | CU-01, CU-02, CU-06 |
| `/profile` | CU-04 |
| `/host/stays/new`, `/host/stays/[id]/edit` | CU-07 … CU-11 |
| `/search` | CU-12 … CU-16 |
| `/stays/[id]` | CU-05, CU-25 |
| `/bookings` | CU-17 … CU-19, CU-23, CU-24 |
| `/api/payments/*` | CU-21, CU-22 |

## Convenciones de proyecto

Detalladas en `CLAUDE.md` (también leído por Claude Code para asistencia automatizada).

## Documentación adicional

Mapa completo en [`docs/README.md`](docs/README.md). Incluye:

- **Diagramas UML** (Mermaid, renderizan en GitHub): casos de uso,
  entidad-relación, secuencias de booking y pago, arquitectura por
  capas, despliegue.
- **8 ADRs** con las decisiones arquitectónicas clave (monolito,
  UNIQUE como guard de concurrencia, ports & adapters, etc.).
- **Guía de despliegue** a Vercel + Neon + Resend en
  [`docs/deploy.md`](docs/deploy.md).

## Tests

```bash
pnpm test            # 52 tests unitarios (vitest), <2s
pnpm test:e2e        # Playwright end-to-end (requiere docker compose up -d)
```
