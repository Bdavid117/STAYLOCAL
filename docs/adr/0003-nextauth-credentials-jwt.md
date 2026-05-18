# ADR-0003 · NextAuth con Credentials + JWT, sin PrismaAdapter

**Estado:** Aceptado · **Fecha:** 2026-05-18

## Contexto

Necesitamos cubrir CU-01 (registrarse), CU-02 (iniciar sesión), CU-03
(recuperar contraseña) y CU-06 (cerrar sesión). El proyecto académico no
puede depender de OAuth de terceros (Google/GitHub) sin un setup que cada
profesor pueda reproducir.

NextAuth v5 ofrece dos estrategias para almacenar la sesión:

1. **Database sessions** — requiere `PrismaAdapter` y tablas `Account`,
   `Session`, `VerificationToken` extra.
2. **JWT sessions** — el cliente lleva el token firmado en una cookie
   `httpOnly`. No necesita tablas adicionales ni adapter.

## Decisión

Usar el provider `Credentials` con `session.strategy = "jwt"` y **sin
PrismaAdapter**. Implementado en `src/shared/auth.ts`.

## Consecuencias

**Positivas**

- Solo necesitamos la tabla `User` (que ya define el ILF-01 del PDF).
- El schema Prisma queda fiel al modelo del PDF, sin tablas auxiliares
  que no aparecen en el documento de estimación.
- Logout es trivial: borrar la cookie.

**Negativas / mitigación**

- No podemos revocar sesiones antes de que expire el JWT (el JWT es
  autosuficiente). **Mitigación:** TTL de 15 min en producción + refresh
  token rotativo en httpOnly cookie. Para el alcance académico aceptamos
  TTL más largo y sin refresh (NextAuth default).

## Alternativas rechazadas

- **PrismaAdapter con sesiones en DB**: rechazado por agregar 3 modelos
  que no están en el PDF y por revocación que el caso de uso no exige.
- **OAuth Google/GitHub**: rechazado por dependencia externa que dificulta
  la reproducción del proyecto en la sustentación.
