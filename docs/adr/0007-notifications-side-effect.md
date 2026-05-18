# ADR-0007 · Notificaciones como side-effect en server actions

**Estado:** Aceptado · **Fecha:** 2026-05-18

## Contexto

CU-26 exige que tras eventos del dominio (reserva creada, pago confirmado,
reserva cancelada, reseña recibida) se notifique a los actores
involucrados — in-app y por correo.

Tres patrones canónicos para "disparar X cuando ocurre Y":

1. **Llamada directa desde el service**: `createBooking` invoca
   `sendNotification` antes de hacer commit.
2. **Event bus interno**: `createBooking` emite `BookingCreatedEvent`;
   un subscriber en `notifications/` lo recibe.
3. **Side-effect en el server action**: la action (capa de presentación)
   llama al service de negocio y, si éste tuvo éxito, dispara la
   notificación.

## Decisión

**Opción 3**: las notificaciones se disparan desde las server actions
(`createBookingAction`, `payAction`, `cancelBookingAction`,
`submitReviewAction`), usando los helpers tematicos de
`src/modules/notifications/notify-event.ts`. El helper `notifyQuiet`
loggea pero no propaga errores — una falla del mailer nunca rompe el
flujo principal.

## Justificación

Cada opción tenía un costo:

- **(1) Llamada directa**: contamina `createBooking` con efectos de
  presentación. Viola la regla del CLAUDE.md: "los services dependen solo
  de sus interfaces, no de mailers ni de side-effects de UI".
- **(2) Event bus**: añade un mecanismo (registro de subscribers, ciclo
  de vida) que para 4 eventos es sobreingeniería pura.
- **(3) Side-effect en action**: mantiene los services puros y
  testeables (los 12 tests de bookings no necesitan mockear mailer ni
  notifications), y deja la notificación como lo que
  conceptualmente es: una consecuencia visible para el usuario, no parte
  del modelo de dominio.

## Consecuencias

**Positivas**

- `bookings/services/*` son puros y 100% testeables sin mocks de mailer.
- Si una notificación falla, el booking/pago/reseña queda igual: no se
  pierde dinero ni se desincroniza el estado.
- Trivial agregar un nuevo evento: una llamada `notifyXxx` después del
  service en la action.

**Negativas / mitigación**

- Si en el futuro las notificaciones deben dispararse desde **otra**
  superficie (CLI, webhook entrante, job), habrá que duplicar el call.
  **Mitigación:** centralizar todos los `notifyXxx` en
  `modules/notifications/notify-event.ts`, no replicar la lógica de
  payload en cada llamador.
- Si la action revierte (por ej. el usuario navega antes de que termine
  el `redirect`), la notificación podría haberse creado. **Aceptable:**
  in-app notification "fantasma" no causa daño; la fila puede borrarse
  manualmente. Bajo riesgo para el alcance académico.

## Referencias

- `src/modules/notifications/notify-event.ts`
- `src/app/bookings/actions.ts`
- `src/app/bookings/[id]/pay/actions.ts`
- `src/app/bookings/[id]/review/actions.ts`
