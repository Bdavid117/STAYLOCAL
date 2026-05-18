# Documentación · StayLocal

Mapa de toda la documentación del proyecto.

## Para entender el sistema

| Documento | Para qué |
|---|---|
| [`uml/use-cases.md`](uml/use-cases.md) | Diagrama de los 27 casos de uso por actor |
| [`uml/er-model.md`](uml/er-model.md) | Modelo entidad-relación (los 8 ILFs + constraints) |
| [`uml/architecture-layers.md`](uml/architecture-layers.md) | Capas Clean-Lite por bounded context |
| [`uml/sequence-booking.md`](uml/sequence-booking.md) | Secuencia CU-17 (con caso concurrente) |
| [`uml/sequence-payment.md`](uml/sequence-payment.md) | Secuencia CU-21 + CU-22 |
| [`uml/deployment.md`](uml/deployment.md) | Diagrama de despliegue (dev y producción) |

> Los diagramas Mermaid se renderizan nativamente en GitHub. No necesitas
> instalar nada para verlos — solo abrir el `.md` en el navegador.

## Decisiones arquitectónicas (ADRs)

Una decisión por archivo, con contexto, alternativas rechazadas y
consecuencias. Si necesitas justificar algo en la sustentación, está
escrito aquí.

| ADR | Decisión |
|---|---|
| [0001](adr/0001-monolito-modular.md) | Monolito modular en lugar de microservicios |
| [0002](adr/0002-nextjs-fullstack.md) | Next.js fullstack (no Turborepo dual) |
| [0003](adr/0003-nextauth-credentials-jwt.md) | NextAuth credentials + JWT sin PrismaAdapter |
| [0004](adr/0004-unique-concurrencia.md) | UNIQUE(stayId, date) como guard de doble reserva |
| [0005](adr/0005-ports-adapters.md) | Ports & Adapters para pagos, mailer, storage |
| [0006](adr/0006-receipt-html-renderer.md) | Comprobante HTML editorial en lugar de PDF nativo |
| [0007](adr/0007-notifications-side-effect.md) | Notificaciones como side-effect en server actions |
| [0008](adr/0008-tipografia-editorial.md) | Identidad visual "Editorial Hospitality" |

## Para correrlo

| Documento | Para qué |
|---|---|
| [`../README.md`](../README.md) | Setup local en 5 comandos |
| [`../CLAUDE.md`](../CLAUDE.md) | Brújula arquitectónica + reglas no-negociables |
| [`deploy.md`](deploy.md) | Deploy a Vercel + Neon paso a paso |

## Tests

| Tipo | Comando | Archivos |
|---|---|---|
| Unitarios | `pnpm test` | `tests/unit/**` — 52 tests, 100% cobertura en payments y booking-creation |
| End-to-end | `pnpm test:e2e` | `tests/e2e/**` — Playwright sobre app real |

Los E2E requieren:

1. `docker compose up -d` (Postgres + MailHog).
2. `pnpm db:migrate && pnpm db:seed` (usuarios demo).
3. La app corriendo (Playwright la levanta automáticamente si no hay
   `BASE_URL` env var).

## Cobertura del PDF de estimación

| Sección del PDF | Implementación |
|---|---|
| 27 casos de uso (CU-01..CU-27) | Implementados — ver `docs/uml/use-cases.md` |
| 8 archivos lógicos internos (ILFs) | 8 modelos Prisma 1:1 — ver `docs/uml/er-model.md` |
| 2 interfaces externas (EIFs) | `PaymentGatewayPort` + `MailerPort` — ADR-0005 |
| Estimación 197 PF / 8.9 KLOC | Real: ~22 rutas, ~52 tests, ~28 services |
| Estimación 9 meses semi-detached | Implementación en sesiones de Claude Code |
| Costo $30K USD | Costo real de hosting: **$0** (planes gratuitos) |
