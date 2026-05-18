import { test, expect } from "@playwright/test";

// Usuarios sembrados por prisma/seed.ts
const HOST = { email: "host@staylocal.local", password: "password123" };
const GUEST = { email: "guest@staylocal.local", password: "password123" };

test.describe("Autenticación · CU-01, CU-02, CU-06", () => {
  test("usuario nuevo se registra y queda redirigido al login con banner de éxito", async ({ page }) => {
    const unique = Date.now();
    const email = `e2e-${unique}@staylocal.local`;

    await page.goto("/register");
    await page.getByLabel("Nombre").fill("E2E Tester");
    await page.getByLabel("Correo").fill(email);
    await page.getByLabel("Contraseña").fill("password123");
    await page.getByRole("button", { name: /Crear cuenta/i }).click();

    await page.waitForURL(/\/login/);
    await expect(page.getByText(/Cuenta creada/i)).toBeVisible();
  });

  test("login con credenciales válidas lleva al home y muestra el bell de notificaciones", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Correo").fill(GUEST.email);
    await page.getByLabel("Contraseña").fill(GUEST.password);
    await page.getByRole("button", { name: /Entrar/i }).click();

    await page.waitForURL("/");
    // El bell solo aparece autenticado
    await expect(
      page.getByRole("link", { name: /Notificaciones/i })
    ).toBeVisible();
  });

  test("login con credenciales inválidas muestra error sin redirigir", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Correo").fill(GUEST.email);
    await page.getByLabel("Contraseña").fill("contraseña-incorrecta");
    await page.getByRole("button", { name: /Entrar/i }).click();

    await expect(page.getByText(/Credenciales incorrectas/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("logout limpia la sesión y restaura el header público", async ({ page }) => {
    // login primero
    await page.goto("/login");
    await page.getByLabel("Correo").fill(HOST.email);
    await page.getByLabel("Contraseña").fill(HOST.password);
    await page.getByRole("button", { name: /Entrar/i }).click();
    await page.waitForURL("/");

    // logout
    await page.getByRole("button", { name: /Salir/i }).click();

    // El header debe volver a mostrar "Crear cuenta"
    await expect(page.getByRole("link", { name: /Crear cuenta/i })).toBeVisible();
  });
});
