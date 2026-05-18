# Despliegue a producción

Recomendación: **Vercel (app) + Neon (Postgres) + Resend (correo)**.
Todo tiene plan gratuito suficiente para una demo académica.

## 1 · Provisionar dependencias externas

### Postgres en Neon

1. Crear cuenta en <https://neon.tech>.
2. New Project → región más cercana (US East suele dar buena latencia
   desde Vercel).
3. Copiar la `DATABASE_URL` con `?sslmode=require` al final.

### Correo en Resend

1. Crear cuenta en <https://resend.com>.
2. Verificar un dominio (o usar el dominio sandbox `onboarding@resend.dev`
   para la demo).
3. Generar API Key.

Otros proveedores SMTP funcionan igual (SendGrid, Mailgun, AWS SES).

## 2 · Conectar Vercel

```bash
# Desde la raíz del repo
vercel link             # vincula el proyecto a tu cuenta Vercel
vercel env pull .env    # opcional, descarga env vars al local
```

O desde el dashboard de Vercel: `Import Git Repository` →
`Bdavid117/STAYLOCAL`.

## 3 · Variables de entorno en Vercel

En el dashboard del proyecto → Settings → Environment Variables, agregar
**para Production y Preview**:

| Variable | Valor | Notas |
|---|---|---|
| `DATABASE_URL` | url de Neon | con `?sslmode=require` |
| `AUTH_SECRET` | `openssl rand -base64 32` | único por proyecto |
| `AUTH_URL` | `https://<tu-dominio>` | sin slash final |
| `SMTP_HOST` | `smtp.resend.com` | |
| `SMTP_PORT` | `587` | |
| `SMTP_USER` | `resend` | (el username literal del provider) |
| `SMTP_PASS` | API key de Resend | |
| `MAIL_FROM` | `StayLocal <hola@tu-dominio>` | dominio verificado |
| `PAYMENT_PROVIDER` | `fake` | o `stripe` cuando lo cablees |
| `CRON_SECRET` | `openssl rand -base64 32` | Vercel lo enviará como `Authorization: Bearer <CRON_SECRET>` |

## 4 · Migrar la base

Vercel no corre `prisma migrate deploy` automáticamente. Opciones:

### Opción A — desde tu máquina apuntando a Neon

```bash
export DATABASE_URL="<la_url_de_neon>"
pnpm prisma migrate deploy
pnpm prisma db seed   # carga los usuarios demo
```

### Opción B — añadir migrate al build (más automático)

Modificar `vercel.json`:

```jsonc
{
  "buildCommand": "pnpm prisma migrate deploy && pnpm prisma generate && pnpm build"
}
```

Cuidado: si la DB no acepta conexiones desde la build de Vercel, falla
el deploy entero. Para Neon funciona porque acepta conexiones desde
cualquier IP.

## 5 · Deploy

```bash
vercel --prod
```

O simplemente `git push` a `main` — Vercel deploya automáticamente.

## 6 · Verificar el cron

`vercel.json` ya tiene programado:

```json
{
  "crons": [{ "path": "/api/cron/reminders", "schedule": "0 14 * * *" }]
}
```

Esto invoca `/api/cron/reminders` a las **14:00 UTC** todos los días
(9:00 am hora Colombia). Vercel envía `Authorization: Bearer
$CRON_SECRET` automáticamente cuando la env var está configurada.

Para probarlo manualmente:

```bash
curl -X POST \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://<tu-dominio>/api/cron/reminders
# → {"considered":N,"sent":N,"skipped":N}
```

En el dashboard de Vercel → Functions → Crons puedes ver el historial
de invocaciones.

## 7 · Verificar el deploy

Checklist post-deploy:

- [ ] `https://<dominio>` carga la landing.
- [ ] `https://<dominio>/search` muestra el catálogo (vacío al inicio).
- [ ] `https://<dominio>/login` acepta `host@staylocal.local / password123`
      si corriste el seed.
- [ ] Crear una reserva → pagar → ver comprobante imprimible.
- [ ] El correo de comprobante llega a la bandeja del huésped.
- [ ] El bell del header muestra el conteo de notificaciones tras
      eventos.
- [ ] `curl` al endpoint cron devuelve 200 con JSON de resultados.

## 8 · Rollback

```bash
vercel rollback        # vuelve al deploy anterior
```

O desde el dashboard: Deployments → ⋯ → Promote to Production sobre un
deploy previo.

## Costos

- **Vercel Hobby**: gratis. Suficiente para demo (100 GB-h/mes).
- **Neon Free**: 0.5 GB storage, 1 endpoint. Suficiente.
- **Resend Free**: 100 correos/día, 3000/mes. Suficiente.

Costo total para la demo académica: **$0**.
