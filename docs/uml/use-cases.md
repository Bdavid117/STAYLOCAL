# Diagrama de Casos de Uso · StayLocal

Los 27 casos de uso del PDF de estimación, agrupados por módulo y por
actor. La numeración (CU-01..CU-27) y los pesos de complejidad
corresponden 1:1 con el documento `Estimacion_StayLocal.pdf`.

```mermaid
%%{init: { 'theme': 'neutral' }}%%
graph LR
  %% Actores
  Visitor((Visitante<br/>no autenticado))
  Guest((Turista))
  Host((Anfitrión))
  Cron((Scheduler<br/>cron))
  Mailer[(Servicio<br/>de correo)]
  Gateway[(Pasarela<br/>de pagos)]

  %% Users
  subgraph U[users]
    CU01[CU-01 Registrarse]
    CU02[CU-02 Iniciar sesión]
    CU03[CU-03 Recuperar contraseña]
    CU04[CU-04 Editar perfil]
    CU05[CU-05 Ver perfil anfitrión]
    CU06[CU-06 Cerrar sesión]
  end

  %% Stays
  subgraph S[stays]
    CU07[CU-07 Publicar alojamiento]
    CU08[CU-08 Subir imágenes]
    CU09[CU-09 Editar alojamiento]
    CU10[CU-10 Eliminar alojamiento]
    CU11[CU-11 Gestionar disponibilidad]
    CU12[CU-12 Listar alojamientos]
    CU13[CU-13 Buscar por ubicación]
    CU14[CU-14 Filtrar por precio]
    CU15[CU-15 Filtrar por capacidad]
    CU16[CU-16 Filtrar por fechas]
  end

  %% Bookings
  subgraph B[bookings]
    CU17[CU-17 Realizar reserva]
    CU18[CU-18 Cancelar reserva]
    CU19[CU-19 Ver historial]
    CU20[CU-20 Validar disponibilidad]
  end

  %% Payments
  subgraph P[payments]
    CU21[CU-21 Realizar pago]
    CU22[CU-22 Generar comprobante]
  end

  %% Reviews
  subgraph R[reviews]
    CU23[CU-23 Calificar]
    CU24[CU-24 Dejar comentario]
    CU25[CU-25 Ver promedio]
  end

  %% Notifications
  subgraph N[notifications]
    CU26[CU-26 Enviar notificación]
    CU27[CU-27 Enviar recordatorio]
  end

  %% Actor → CU
  Visitor --> CU01
  Visitor --> CU02
  Visitor --> CU03
  Visitor --> CU05
  Visitor --> CU12
  Visitor --> CU13
  Visitor --> CU14
  Visitor --> CU15
  Visitor --> CU16
  Visitor --> CU25

  Guest --> CU04
  Guest --> CU06
  Guest --> CU17
  Guest --> CU18
  Guest --> CU19
  Guest --> CU20
  Guest --> CU21
  Guest --> CU23
  Guest --> CU24

  Host --> CU07
  Host --> CU08
  Host --> CU09
  Host --> CU10
  Host --> CU11

  Cron --> CU27

  %% Sistema → externos
  CU03 -.->|envía enlace| Mailer
  CU21 -.->|cobra| Gateway
  CU22 -.->|envía PDF/HTML| Mailer
  CU26 -.->|envía aviso| Mailer
  CU27 -.->|envía recordatorio| Mailer

  %% Inclusiones (sistema dispara CU automáticamente)
  CU17 -.includes.-> CU26
  CU18 -.includes.-> CU26
  CU21 -.includes.-> CU22
  CU21 -.includes.-> CU26
  CU23 -.includes.-> CU26

  classDef cu fill:#FBF8F2,stroke:#B85342,stroke-width:1px,color:#1A1612
  classDef actor fill:#1A1612,color:#F5F1EA,stroke:#1A1612
  classDef ext fill:#ECE5D8,stroke:#8A7E6F,color:#1A1612
  class CU01,CU02,CU03,CU04,CU05,CU06,CU07,CU08,CU09,CU10,CU11,CU12,CU13,CU14,CU15,CU16,CU17,CU18,CU19,CU20,CU21,CU22,CU23,CU24,CU25,CU26,CU27 cu
  class Visitor,Guest,Host,Cron actor
  class Mailer,Gateway ext
```

## Resumen por actor

| Actor | CU directos | Notas |
|---|---|---|
| Visitante (no autenticado) | 01, 02, 03, 05, 12-16, 25 | Cualquier acción que requiera identidad redirige a `/login` |
| Turista | 04, 06, 17-21, 23, 24 | Hereda lo del visitante |
| Anfitrión | 07-11 | Hereda lo del turista (un usuario puede ser ambos) |
| Cron | 27 | `POST /api/cron/reminders` con `Bearer CRON_SECRET` |

Las relaciones punteadas marcadas como `includes` indican efectos que
el sistema dispara automáticamente (notificaciones y comprobantes).
