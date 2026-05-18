import { test, expect } from "@playwright/test";

// CU-07 Publicar alojamiento, CU-09 Editar, CU-11 Disponibilidad.

const HOST = { email: "host@staylocal.local", password: "password123" };

test("un anfitrión publica un alojamiento y lo ve en su dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Correo").fill(HOST.email);
  await page.getByLabel("Contraseña").fill(HOST.password);
  await page.getByRole("button", { name: /Entrar/i }).click();
  await page.waitForURL("/");

  await page.goto("/host/stays/new");
  await page.getByLabel("Título").fill("E2E · Loft minimal en Chapinero");
  await page.getByLabel("Ubicación (texto visible)").fill("Bogotá, Chapinero");
  await page.getByLabel("Precio por noche (COP)").fill("180000");
  await page.getByLabel("Capacidad (personas)").fill("2");
  await page
    .getByLabel("Descripción")
    .fill("Loft pequeño, luminoso, ideal para escapadas cortas. Probado E2E.");
  await page.getByRole("button", { name: /Publicar alojamiento/i }).click();

  // Redirige a editar
  await page.waitForURL(/\/host\/stays\/[^/]+\/edit/);
  await expect(page.getByRole("heading", { name: /E2E · Loft minimal/i })).toBeVisible();

  // El dashboard lo lista
  await page.goto("/host/stays");
  await expect(page.getByText(/E2E · Loft minimal/i)).toBeVisible();
});

test("editar precio se refleja en el dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Correo").fill(HOST.email);
  await page.getByLabel("Contraseña").fill(HOST.password);
  await page.getByRole("button", { name: /Entrar/i }).click();
  await page.waitForURL("/");

  await page.goto("/host/stays");
  // Click en "Editar" del primer alojamiento
  await page.getByRole("link", { name: /Editar/i }).first().click();
  await page.waitForURL(/\/host\/stays\/[^/]+\/edit/);

  const newPrice = "210000";
  await page.getByLabel(/Precio.*COP/i).fill(newPrice);
  await page.getByRole("button", { name: /Guardar cambios/i }).click();
  await expect(page.getByText(/Cambios guardados/i)).toBeVisible();

  await page.goto("/host/stays");
  await expect(page.getByText(/210\.000/)).toBeVisible();
});
