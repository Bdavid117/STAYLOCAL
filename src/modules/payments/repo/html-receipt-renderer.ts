import type {
  ReceiptInput,
  ReceiptRenderer,
} from "@/modules/payments/domain/types";

// Renderer del comprobante (CU-22). HTML inline-styled — viaja por correo
// y se ve igual al imprimir desde /bookings/[id]/receipt.
//
// Para producción se reemplazaría por @react-pdf/renderer manteniendo
// la misma interfaz ReceiptRenderer.

const fmtDate = new Intl.DateTimeFormat("es-CO", { dateStyle: "long" });
const fmtMoney = (n: number) => `$${n.toLocaleString("es-CO")}`;

export class HtmlReceiptRenderer implements ReceiptRenderer {
  toHtml(input: ReceiptInput): string {
    const { payment, booking, stay, guest, hostName } = input;
    const issued = payment.paidAt ? fmtDate.format(payment.paidAt) : "—";
    const ref = payment.providerRef ?? "—";

    return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Comprobante №${payment.id.slice(-6).toUpperCase()} · StayLocal</title>
  <style>
    body { font-family: Georgia, "Times New Roman", serif; color: #1a1612; background: #f5f1ea; margin: 0; padding: 80px 24px 48px; }
    .toolbar { position: fixed; top: 0; left: 0; right: 0; z-index: 10; display: flex; align-items: center; justify-content: space-between; padding: 14px 22px; background: rgba(245, 241, 234, 0.94); backdrop-filter: blur(8px); border-bottom: 1px solid rgba(26,22,18,0.12); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 13px; color: #4a413a; }
    .toolbar a { color: #b85342; text-decoration: none; }
    .toolbar a:hover { text-decoration: underline; }
    .toolbar kbd { font-family: "IBM Plex Mono", ui-monospace, monospace; font-size: 11px; background: #fbf8f2; border: 1px solid rgba(26,22,18,0.12); padding: 1px 5px; border-radius: 3px; }
    .sheet { max-width: 640px; margin: 0 auto; background: #fbf8f2; padding: 56px 56px 48px; border: 1px solid rgba(26,22,18,0.12); }
    .mono { font-family: "IBM Plex Mono", ui-monospace, monospace; }
    .kicker { font-family: "IBM Plex Mono", ui-monospace, monospace; font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: #8a7e6f; }
    .brand { display: inline-flex; align-items: baseline; font-size: 22px; font-weight: 500; }
    .brand em { font-style: italic; color: #b85342; }
    .brand .dot { display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: #b85342; margin-left: 6px; vertical-align: super; }
    h1 { font-family: "Fraunces", Georgia, serif; font-size: 44px; line-height: 1; margin: 24px 0 4px; letter-spacing: -0.01em; }
    h1 em { font-style: italic; color: #b85342; }
    .lede { color: #4a413a; margin: 4px 0 32px; }
    .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(26,22,18,0.07); }
    .row:last-child { border-bottom: 0; }
    .row .label { color: #4a413a; }
    .row .value { font-family: "IBM Plex Mono", ui-monospace, monospace; }
    .total { display: flex; justify-content: space-between; align-items: baseline; margin-top: 24px; padding-top: 16px; border-top: 2px solid #1a1612; }
    .total .label { font-family: "IBM Plex Mono", ui-monospace, monospace; font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: #8a7e6f; }
    .total .amount { font-family: "Fraunces", Georgia, serif; font-size: 40px; }
    .stamp { display: inline-block; margin-top: 32px; padding: 10px 18px; border: 1.5px solid #3d4f2e; border-radius: 999px; color: #3d4f2e; font-family: "IBM Plex Mono", ui-monospace, monospace; font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase; transform: rotate(-3deg); }
    .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid rgba(26,22,18,0.12); display: flex; justify-content: space-between; color: #8a7e6f; font-size: 12px; }
    .badge { display: inline-block; background: rgba(184,83,66,0.1); color: #93392a; padding: 2px 8px; border-radius: 999px; font-family: "IBM Plex Mono", ui-monospace, monospace; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; }
    @media print {
      body { background: #ffffff; padding: 0; }
      .sheet { border: 0; box-shadow: none; }
      .toolbar { display: none; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <a href="/bookings/${payment.bookingId}">← Volver a la reserva</a>
    <span>Usa <kbd>⌘P</kbd> para imprimir o guardar como PDF.</span>
  </div>
  <div class="sheet">
    <p class="kicker"><span style="color:#b85342;">№ ${payment.id.slice(-6).toUpperCase()}</span> &nbsp;/&nbsp; Emitido el ${issued}</p>
    <div class="brand" style="margin-top:6px;">Stay<em>local</em><span class="dot"></span></div>

    <h1>Comprobante de <em>reserva</em>.</h1>
    <p class="lede">Hola ${escape(guest.name)}, este es el resumen de tu pago. Conserva este documento — también está en tu bandeja de correo.</p>

    <div class="row">
      <span class="label">Huésped</span>
      <span class="value">${escape(guest.name)} · ${escape(guest.email)}</span>
    </div>
    <div class="row">
      <span class="label">Alojamiento</span>
      <span class="value">${escape(stay.title)}</span>
    </div>
    <div class="row">
      <span class="label">Ubicación</span>
      <span class="value">${escape(stay.locationText)}</span>
    </div>
    <div class="row">
      <span class="label">Anfitrión</span>
      <span class="value">${escape(hostName)}</span>
    </div>
    <div class="row">
      <span class="label">Check-in</span>
      <span class="value">${fmtDate.format(booking.checkIn)}</span>
    </div>
    <div class="row">
      <span class="label">Check-out</span>
      <span class="value">${fmtDate.format(booking.checkOut)}</span>
    </div>
    <div class="row">
      <span class="label">Tarifa por noche · ${booking.nights} noche${booking.nights === 1 ? "" : "s"}</span>
      <span class="value">${fmtMoney(stay.pricePerNight)} × ${booking.nights}</span>
    </div>
    <div class="row">
      <span class="label">Método</span>
      <span class="value">${escape(payment.provider)} · <span class="badge">${payment.status}</span></span>
    </div>
    <div class="row">
      <span class="label">Referencia</span>
      <span class="value">${escape(ref)}</span>
    </div>

    <div class="total">
      <span class="label">Total pagado · ${payment.currency}</span>
      <span class="amount">${fmtMoney(payment.amount)}</span>
    </div>

    <span class="stamp">Pago confirmado</span>

    <div class="footer">
      <span>StayLocal · Proyecto académico UNAL · 2026</span>
      <span class="mono">Booking ${booking.id.slice(-6).toUpperCase()}</span>
    </div>
  </div>
</body>
</html>`;
  }

  toText(input: ReceiptInput): string {
    const { payment, booking, stay, guest, hostName } = input;
    return [
      `Comprobante StayLocal · № ${payment.id.slice(-6).toUpperCase()}`,
      ``,
      `Hola ${guest.name}, registramos tu pago. Resumen:`,
      ``,
      `Alojamiento : ${stay.title} (${stay.locationText})`,
      `Anfitrión   : ${hostName}`,
      `Check-in    : ${fmtDate.format(booking.checkIn)}`,
      `Check-out   : ${fmtDate.format(booking.checkOut)}`,
      `Noches      : ${booking.nights}`,
      `Tarifa      : ${fmtMoney(stay.pricePerNight)} / noche`,
      ``,
      `TOTAL PAGADO: ${fmtMoney(payment.amount)} ${payment.currency}`,
      `Método      : ${payment.provider}`,
      `Estado      : ${payment.status}`,
      `Referencia  : ${payment.providerRef ?? "—"}`,
      ``,
      `Conserva este correo. Si necesitas factura, responde a este mensaje.`,
      ``,
      `StayLocal · UNAL · 2026`,
    ].join("\n");
  }
}

// Escapado conservador para evitar inyección de HTML en correos.
function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
