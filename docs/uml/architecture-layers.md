# Arquitectura en capas · Clean-Lite por bounded context

Cada módulo (`users`, `stays`, `bookings`, `payments`, `reviews`,
`notifications`) sigue el mismo layout interno. La regla de oro: los
imports solo van **hacia abajo** (presentación → application → domain),
nunca al revés.

```mermaid
graph TB
  subgraph Pres["Presentación · src/app/"]
    Pages[Pages /<br/>React Server Components]
    Forms[Client Components<br/>useActionState]
    Actions[Server Actions<br/>parsea FormData + dispatch]
    Routes[Route Handlers<br/>API endpoints / cron]
  end

  subgraph App["Application · src/modules/X/services/"]
    UC[Casos de uso<br/>createBooking, processPayment, ...]
    Errors[Errores tipados<br/>BookingConflictError, ...]
    Sch[Schemas Zod]
  end

  subgraph Domain["Domain · src/modules/X/domain/"]
    Types[Tipos + interfaces<br/>Repository, ValueObjects]
    Pure[Lógica pura<br/>enumerateNights, generateResetToken]
  end

  subgraph Infra["Infraestructura · src/modules/X/repo/"]
    PrismaRepos[Prisma repositories]
    Adapters[Adapters de ports<br/>Nodemailer, LocalStorage, FakeGateway]
  end

  subgraph Shared["Shared · src/shared/"]
    Ports[Ports<br/>MailerPort, StoragePort, PaymentGatewayPort]
    DB[(PrismaClient<br/>singleton)]
    Auth[NextAuth handlers]
  end

  Pages --> Actions
  Forms --> Actions
  Actions --> UC
  Routes --> UC
  UC --> Sch
  UC --> Errors
  UC --> Types
  UC --> Pure
  UC -.depende solo de interfaces.-> Types
  PrismaRepos -.implementa.-> Types
  Adapters -.implementa.-> Ports
  PrismaRepos --> DB

  classDef pres fill:#F5F1EA,stroke:#1A1612,color:#1A1612
  classDef app fill:#FBF8F2,stroke:#B85342,stroke-width:1.5px,color:#1A1612
  classDef domain fill:#ECE5D8,stroke:#3D4F2E,stroke-width:1.5px,color:#1A1612
  classDef infra fill:#FBF8F2,stroke:#8A7E6F,color:#1A1612
  classDef shared fill:#1A1612,color:#F5F1EA,stroke:#1A1612

  class Pages,Forms,Actions,Routes pres
  class UC,Errors,Sch app
  class Types,Pure domain
  class PrismaRepos,Adapters infra
  class Ports,DB,Auth shared
```

## Reglas de no-negociables (del CLAUDE.md)

1. **Cross-module solo por `services/`** — un módulo nunca lee `repo/`
   o `domain/` de otro. Si bookings necesita datos de stay, llama a un
   service de stays (o, en lectura directa, query Prisma con cuidado).
2. **Prisma solo en `repo/`** — los services dependen de las interfaces
   del domain. Hace los tests posibles sin DB.
3. **Sin lógica de negocio en Actions** — la action parsea FormData,
   llama un service, retorna/redirige. Si hay aritmética o branching
   sobre estado de entidad, va en `services/`.
4. **Servicios externos detrás de ports** — nunca `import "stripe"` en
   un service. Solo en un adapter dentro de `repo/`.
5. **Money es `Decimal`** — nunca `Float`, ni en Prisma ni en TS.

## Composition root por módulo

Cada módulo tiene un `composition.ts` que arma las dependencias reales
(Prisma + adapters configurados por env). Las páginas/actions importan
ese helper en lugar de instanciar repositorios manualmente:

```ts
// src/modules/payments/composition.ts
export function paymentsDeps() {
  return {
    db: prisma,
    payments: new PrismaPaymentRepository(prisma),
    gateway: pickGateway(),       // fake o stripe según env
    receipts: new HtmlReceiptRenderer(),
    mailer: getMailer(),
  };
}
```

Esto hace que los tests pasen un objeto custom de deps (con fakes/mocks)
sin tocar nada más.
