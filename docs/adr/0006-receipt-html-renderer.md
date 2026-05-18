# ADR-0006 · Comprobante HTML editorial en lugar de PDF "de verdad"

**Estado:** Aceptado · **Fecha:** 2026-05-18

## Contexto

CU-22 (Generar Comprobante) está clasificado como **EO Compleja** (peso 7)
en el PDF. La descripción habla de "Generación de documento con datos de
reserva y envío por correo".

Opciones para "generar documento":

1. **PDF nativo** con `@react-pdf/renderer` o `pdfkit`.
2. **HTML imprimible** que se envía por correo y se sirve en una ruta
   `/bookings/:id/receipt` que el usuario puede `⌘P` para guardar como
   PDF desde el navegador.

## Decisión

**HTML editorial autocontenido** (estilos inline) generado por
`HtmlReceiptRenderer` (`src/modules/payments/repo/`). El renderer
implementa la interfaz `ReceiptRenderer` definida en
`src/modules/payments/domain/types.ts`, así que reemplazarlo por un PDF
real es escribir una clase nueva sin tocar `processPayment` ni
`generateReceipt`.

## Consecuencias

**Positivas**

- Cero dependencias nativas (`@react-pdf/renderer` arrastra Yoga,
  fontkit, etc. — ~6 MB).
- El mismo HTML viaja por correo y se renderiza imprimible en
  `/bookings/:id/receipt`.
- El navegador moderno produce un PDF de calidad equivalente con
  `⌘P → Guardar como PDF`.
- Honesto con el alcance académico: la academia evalúa el patrón
  arquitectónico (port + adapter, idempotencia, envío por correo), no
  el formato exacto del archivo.

**Negativas / mitigación**

- El usuario debe presionar `⌘P` para obtener el archivo PDF en disco.
  **Mitigación:** instrucción visible en la página `/receipt`.
- Si el cliente del correo no soporta CSS inline avanzado (Outlook 2007),
  el comprobante puede verse degradado. **Mitigación:** el renderer usa
  solo CSS soportado por Litmus, y siempre incluye versión `text/plain`.

## Migración futura

Para PDF real:

1. `pnpm add @react-pdf/renderer`
2. Crear `ReactPdfReceiptRenderer implements ReceiptRenderer`.
3. Cambiar `new HtmlReceiptRenderer()` por `new ReactPdfReceiptRenderer()`
   en `src/modules/payments/composition.ts`.

Cero cambios en services o tests.

## Referencias

- `src/modules/payments/repo/html-receipt-renderer.ts`
- `src/app/bookings/[id]/receipt/page.tsx`
