# ADR-0005 · Patrón Ports & Adapters para servicios externos

**Estado:** Aceptado · **Fecha:** 2026-05-18

## Contexto

El sistema integra tres servicios externos identificados en el PDF:

- **Pasarela de pagos** (EIF-01, CU-21)
- **Servicio de correo** (EIF-02, CU-22, CU-26, CU-27)
- **Almacenamiento de imágenes** (CU-08) — no en el PDF pero requerido

Mezclar `import "stripe"` o `import "nodemailer"` directamente en los
casos de uso haría imposible:

- Testear (sin red, sin SDK montados).
- Cambiar de proveedor sin reescribir lógica.
- Demostrar cobertura de la regla de "100% en payments" del CLAUDE.md.

## Decisión

Cada servicio externo vive detrás de un **port** (interfaz TS) en
`src/shared/ports/` y se implementa con uno o varios **adapters** en
`src/modules/<X>/repo/`:

| Port | Implementaciones actuales |
|---|---|
| `PaymentGatewayPort` | `FakePaymentGateway` (siempre PAID, default); el switch a Stripe se hace en `composition.ts` por `PAYMENT_PROVIDER` env |
| `MailerPort` | `NodemailerMailer` (SMTP → MailHog en dev, SMTP real en prod); `InMemoryMailer` en tests |
| `StoragePort` | `LocalStorage` (escribe a `/public/uploads/`); en prod se reemplaza por `R2Storage` sin tocar los services |

Los services dependen solo del port. El cableado se hace en
`src/modules/<X>/composition.ts`.

## Consecuencias

**Positivas**

- Los tests en `tests/unit/` no tocan red, archivos, SMTP ni APIs reales.
- Cambiar Nodemailer por Resend es escribir una clase de 20 líneas.
- Stripe sandbox se enchufa sin modificar `processPayment`.

**Negativas / mitigación**

- Más archivos (un port + un adapter por servicio). **Mitigación:** los
  ports son pequeños (3-5 métodos) y autodocumentados.

## Referencias

- `src/shared/ports/payment-gateway.ts`, `mailer.ts`, `storage.ts`
- `src/modules/payments/repo/fake-payment-gateway.ts`
- `src/modules/users/repo/nodemailer-mailer.ts`
- `src/modules/stays/repo/local-storage.ts`
