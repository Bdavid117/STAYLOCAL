import { test, expect } from "@playwright/test";

// Flujo crítico end-to-end de StayLocal:
//   Buscar → Reservar → Pagar → Ver comprobante.
//
// Requiere:
//   - docker compose up -d (Postgres + MailHog)
//   - pnpm db:migrate && pnpm db:seed (carga host + guest + un stay demo)

const GUEST = { email: "guest@staylocal.local", password: "password123" };

function isoDateInDays(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

async function login(page: import("@playwright/test").Page, who = GUEST) {
  await page.goto("/login");
  await page.getByLabel("Correo").fill(who.email);
  await page.getByLabel("Contraseña").fill(who.password);
  await page.getByRole("button", { name: /Entrar/i }).click();
  await page.waitForURL("/");
}

test("flujo completo: buscar, reservar, pagar y ver comprobante", async ({ page }) => {
  // 1. Login como huésped
  await login(page);

  // 2. Buscar
  await page.goto("/search");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  // Tomar el primer alojamiento del catálogo. Usamos un selector
  // robusto: cualquier link a /stays/...
  const firstStay = page.locator('a[href^="/stays/"]').first();
  await expect(firstStay).toBeVisible({ timeout: 10_000 });
  await firstStay.click();
  await page.waitForURL(/\/stays\//);

  // 3. Reservar — fechas únicas para evitar conflicto con corridas previas
  const checkIn = isoDateInDays(60);
  const checkOut = isoDateInDays(63);
  await page.getByLabel(/Check-in|Llegada/i).first().fill(checkIn);
  await page.getByLabel(/Check-out|Salida/i).first().fill(checkOut);
  await page.getByRole("button", { name: /Reservar/i }).click();

  // 4. Llegamos a la página de pago
  await page.waitForURL(/\/bookings\/[^/]+\/pay/);
  await expect(page.getByRole("heading", { name: /Confirma tu/i })).toBeVisible();

  // 5. Confirmamos pago (gateway fake siempre acepta)
  await page.getByRole("button", { name: /Confirmar pago/i }).click();

  // 6. Volvemos al detalle con banner de éxito
  await page.waitForURL(/\/bookings\/[^/]+\?paid=1$/);
  await expect(page.getByText(/Pago confirmado/i)).toBeVisible();

  // 7. Comprobante accesible
  const receiptLink = page.getByRole("link", { name: /Ver comprobante/i });
  await expect(receiptLink).toBeVisible();
});

test("doble pago de la misma reserva está bloqueado", async ({ page, context }) => {
  await login(page);

  // Crear una reserva nueva para no chocar con otras
  await page.goto("/search");
  await page.locator('a[href^="/stays/"]').first().click();
  await page.waitForURL(/\/stays\//);
  await page.getByLabel(/Check-in|Llegada/i).first().fill(isoDateInDays(120));
  await page.getByLabel(/Check-out|Salida/i).first().fill(isoDateInDays(122));
  await page.getByRole("button", { name: /Reservar/i }).click();
  await page.waitForURL(/\/bookings\/[^/]+\/pay/);

  // Capturamos la URL de pago para abrirla dos veces en pestañas distintas
  const payUrl = page.url();

  // Primer pago
  await page.getByRole("button", { name: /Confirmar pago/i }).click();
  await page.waitForURL(/\/bookings\/[^/]+\?paid=1$/);

  // Intento de pagar otra vez — el sistema redirige al detalle.
  const page2 = await context.newPage();
  await page2.goto(payUrl);
  await expect(page2).toHaveURL(/\/bookings\/[^/]+$/);
});
