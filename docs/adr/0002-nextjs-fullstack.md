# ADR-0002 · Next.js fullstack en lugar de Next.js + NestJS separados

**Estado:** Aceptado · **Fecha:** 2026-05-18 · **Reemplaza:** propuesta inicial en CLAUDE.md (versión "pro")

## Contexto

La propuesta inicial del plan contemplaba un monorepo Turborepo con dos
aplicaciones: `apps/web` (Next.js) y `apps/api` (NestJS), un paquete
compartido `packages/shared` y dependencias separadas. Esto añadía:

- Doble configuración de TypeScript, ESLint, build y deploy.
- Un boundary HTTP innecesario entre web y api en el mismo equipo.
- Más curva para el equipo estudiantil.

## Decisión

**Una sola aplicación Next.js 15** que sirve tanto SSR/UI como API:

- Páginas (RSC + client components) en `src/app/.../page.tsx`.
- Server Actions para mutaciones (`actions.ts` por página).
- Route Handlers (`src/app/api/...`) solo para webhooks o endpoints
  que necesitan ser invocados desde afuera (cron, etc.).

## Consecuencias

**Positivas**

- Tipos compartidos sin paquete intermedio — los DTOs Zod viven en
  `src/modules/<X>/services/` y se importan desde las páginas.
- Un solo `pnpm dev` levanta todo.
- Vercel deploya la app entera con cero configuración adicional.

**Negativas / mitigación**

- Acoplamiento UI ↔ services. **Mitigación:** la regla del CLAUDE.md
  obliga a que las páginas/server actions solo parseen FormData y
  despachen a un service; la lógica de negocio no vive en ellas.

## Alternativas rechazadas

- **Turborepo + NestJS + Next.js separados**: rechazado por el costo
  operativo para un proyecto académico.
- **Solo backend (sin SSR)**: rechazado porque el catálogo de alojamientos
  necesita SEO y carga inicial rápida, y el App Router lo da gratis.
