# ADR-0001 · Monolito modular en lugar de microservicios

**Estado:** Aceptado · **Fecha:** 2026-05-18

## Contexto

El documento de estimación (`Estimacion_StayLocal.pdf`) estima el proyecto en
197 puntos de función, ~8.9 KLOC, 9 meses y un equipo estudiantil de 4-5
personas con experiencia limitada en aplicaciones (AEXP=Low, LEXP=Low).
Existen 27 casos de uso repartidos en 6 áreas funcionales (usuarios,
alojamientos, reservas, pagos, reseñas, notificaciones).

La pregunta era: **¿monolito o microservicios?**

## Decisión

**Monolito modular** en una sola aplicación Next.js, internamente dividido por
*bounded contexts* (`src/modules/users/`, `stays/`, `bookings/`, `payments/`,
`reviews/`, `notifications/`), cada uno con su propia estructura
`domain/ services/ repo/`.

## Consecuencias

**Positivas**

- Un solo `package.json`, un solo deploy, un solo proceso a operar.
- Las transacciones del booking (CU-17, CU-21) son ACID locales — sin sagas.
- La curva de aprendizaje para el equipo estudiantil es mínima.
- El presupuesto (~$30K USD del PDF) y la infraestructura PaaS (Vercel +
  Neon) lo soportan sobradamente.

**Negativas / mitigación**

- Si en el futuro el producto escala, extraer un microservicio requerirá
  trabajo. **Mitigación:** los módulos respetan la regla de no cruzarse por
  `repo/` ni por `domain/`, solo por `services/` — frontera lista para
  cortar.
- El despliegue es atómico (un cambio en notifications redeploya pagos).
  Aceptable en escala estudiantil.

## Alternativas rechazadas

- **Microservicios desde el inicio**: descartado por overhead operativo
  inasumible (mensajería, descubrimiento, observabilidad distribuida) para
  un equipo junior con presupuesto académico.
- **Monolito sin módulos**: rechazado porque el PDF describe 6 áreas claras,
  y separarlas desde el día uno evita el clásico "big ball of mud".
