# Secuencia · CU-21 Realizar Pago + CU-22 Generar Comprobante

Flujo completo desde que el usuario confirma el pago hasta que el
comprobante llega a su correo y queda registrada la notificación.

```mermaid
sequenceDiagram
  autonumber
  actor Guest as Huésped
  participant UI as /bookings/[id]/pay
  participant Action as payAction
  participant Service as processPayment
  participant DB as Postgres
  participant Gateway as PaymentGateway<br/>(fake / Stripe)
  participant Receipt as generateReceipt
  participant Mailer as MailerPort<br/>(Nodemailer → MailHog)
  participant Notify as notifyPaymentReceived

  Guest->>UI: clic "Confirmar pago"
  UI->>Action: payAction(bookingId)
  Action->>Service: processPayment(guestId, bookingId)

  Service->>DB: SELECT booking (verifica guest, status CONFIRMED)
  Service->>DB: SELECT payment by bookingId
  alt Existe Payment PAID
    Service-->>Action: throw PaymentAlreadyExistsError
  else No existe o está FAILED
    Service->>DB: INSERT/UPSERT Payment (status PENDING)
    Service->>Gateway: charge({amount, currency, email})
    alt Gateway acepta
      Gateway-->>Service: {providerRef, status PAID}
      Service->>DB: UPDATE Payment (status PAID, providerRef, paidAt)
      Service->>Receipt: generateReceipt(paymentId)
      Receipt->>DB: cargar booking + stay + host + guest
      Receipt->>Receipt: HtmlReceiptRenderer.toHtml(input)
      Receipt->>Mailer: send(to: guest.email, html, text)
      Mailer-->>Receipt: ok
      Receipt-->>Service: ok
      Service-->>Action: Payment PAID
      Action->>Notify: notifyPaymentReceived(guest, host)
      Note over Notify: in-app al guest, in-app + correo al host
      Action-->>UI: redirect /bookings/:id?paid=1
    else Gateway rechaza
      Gateway-->>Service: {status FAILED}
      Service->>DB: UPDATE Payment (status FAILED)
      Service-->>Action: throw PaymentDeclinedError
      Action-->>UI: error en banner; permite reintentar
    end
  end
```

## Reglas de robustez

- **Reintento idempotente**: si un primer intento falla
  (`Payment.status = FAILED`), el segundo intento reusa el mismo
  registro en lugar de crear otro. UNIQUE en `bookingId` impide
  duplicados a nivel DB.
- **El correo no bloquea**: si el envío de
  `generateReceipt` falla (SMTP down, MailHog caído), el pago **igual
  queda PAID**. Se loggea el error pero no se revierte. La razón: el
  dinero ya está cobrado; revertirlo silenciosamente sería peor que
  perder un correo.
- **Verificable**: 9 tests en `tests/unit/payments/process-payment.test.ts`
  cubren ruta feliz, gateway rechaza, gateway lanza excepción,
  reintento tras FAILED, doble pago bloqueado, fallo de correo, y
  verificación del contenido del comprobante.

## Referencias

- `src/modules/payments/services/process-payment.ts`
- `src/modules/payments/services/generate-receipt.ts`
- `src/modules/payments/repo/html-receipt-renderer.ts`
- `src/app/bookings/[id]/pay/actions.ts`
- `src/app/bookings/[id]/receipt/page.tsx` — vista imprimible
- ADR-0005 · Ports & Adapters
- ADR-0006 · Comprobante HTML
