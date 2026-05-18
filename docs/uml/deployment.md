# Diagrama de Despliegue

Dos escenarios: **desarrollo local** (Docker Compose) y **producción**
(Vercel + Neon + Resend).

## Desarrollo local

```mermaid
graph TB
  Dev[Desarrollador<br/>Mac/Linux]

  subgraph Local["Máquina local"]
    direction LR
    Next["Next.js dev server<br/>:3000"]
    subgraph Docker["docker-compose.yml"]
      direction TB
      PG[(Postgres 16<br/>:5432)]
      MH["MailHog<br/>:1025 SMTP, :8025 UI"]
    end
  end

  FS[("public/uploads/<br/>filesystem")]

  Dev -- browser --> Next
  Dev -- inspecciona correos --> MH
  Next -- Prisma --> PG
  Next -- nodemailer --> MH
  Next -- LocalStorage adapter --> FS

  classDef svc fill:#FBF8F2,stroke:#B85342,stroke-width:1.5px,color:#1A1612
  classDef ext fill:#ECE5D8,stroke:#8A7E6F,color:#1A1612
  class Next,PG,MH svc
  class FS ext
```

## Producción (sugerida)

```mermaid
graph TB
  User((Usuario))
  Browser[Navegador]

  subgraph Vercel["Vercel"]
    direction LR
    Edge[Edge Network<br/>CDN + assets]
    Func[Functions<br/>Next.js SSR + API]
    CronVR[Vercel Cron<br/>diario 9am]
  end

  subgraph Neon["Neon"]
    PGProd[(Postgres serverless<br/>branch: main)]
  end

  subgraph External["Servicios externos"]
    Resend["Resend / SendGrid<br/>SMTP transaccional"]
    Stripe["Stripe sandbox<br/>(opcional)"]
    R2["Cloudflare R2<br/>(opcional para imágenes)"]
  end

  User --> Browser
  Browser -- HTTPS --> Edge
  Edge --> Func
  Func -- Prisma over TCP --> PGProd
  Func -- SMTP --> Resend
  Func -- charge() --> Stripe
  Func -- S3 API --> R2
  CronVR -- POST /api/cron/reminders --> Func

  classDef vercel fill:#1A1612,color:#F5F1EA,stroke:#1A1612
  classDef neon fill:#3D4F2E,color:#F5F1EA,stroke:#3D4F2E
  classDef ext fill:#FBF8F2,stroke:#8A7E6F,color:#1A1612
  class Edge,Func,CronVR vercel
  class PGProd neon
  class Resend,Stripe,R2 ext
```

## Variables de entorno por entorno

| Variable | Dev | Producción |
|---|---|---|
| `DATABASE_URL` | `postgresql://staylocal:staylocal@localhost:5432/staylocal` | URL de Neon (con `?sslmode=require`) |
| `AUTH_SECRET` | dummy, regenerar | **único por proyecto** — `openssl rand -base64 32` |
| `AUTH_URL` | `http://localhost:3000` | `https://<tu-dominio>` |
| `SMTP_HOST` | `localhost` (MailHog) | `smtp.resend.com` o equivalente |
| `SMTP_PORT` | `1025` | `587` |
| `SMTP_USER` / `SMTP_PASS` | vacío | API key del provider |
| `MAIL_FROM` | `StayLocal <no-reply@staylocal.local>` | `StayLocal <hola@tu-dominio>` |
| `PAYMENT_PROVIDER` | `fake` | `fake` (demo) o `stripe` (sandbox) |
| `STRIPE_SECRET_KEY` | vacío | `sk_test_...` si activas Stripe |
| `CRON_SECRET` | opcional | **obligatorio** — `openssl rand -base64 32` |

Ver `docs/deploy.md` para el paso a paso de despliegue.
