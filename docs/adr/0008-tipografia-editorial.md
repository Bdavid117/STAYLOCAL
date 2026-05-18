# ADR-0008 · Identidad visual "Editorial Hospitality"

**Estado:** Aceptado · **Fecha:** 2026-05-18

## Contexto

El proyecto necesitaba una identidad visual que:

- No copiara la estética roja brutalista de Airbnb (es un proyecto
  académico, no un clon).
- Comunicara "local" / "auténtico" / "latino" (núcleo del producto).
- Pudiera ejecutarse sin pagar fuentes propietarias.
- Sirviera tanto para UI web como para correos editoriales
  (comprobante, recordatorios).

## Decisión

**Dirección creativa:** *Editorial Hospitality* — revista de viajes
latinoamericana, con tipografía editorial seria mezclada con sans
humanista y números monoespaciados.

### Tipografías (vía `next/font/google`)

| Rol | Familia | Justificación |
|---|---|---|
| Display | **Fraunces** (variable, opsz + italic) | Serif moderna con carácter — pares opsz e italic alternates dan presencia editorial |
| Body | **DM Sans** | Sans humanista, legible en todos los tamaños, neutra |
| Mono | **IBM Plex Mono** | Para precios, fechas y metadatos — números tabulares |

### Paleta (CSS variables, `globals.css`)

```
--bone         #F5F1EA   fondo principal (papel cálido)
--bone-2       #ECE5D8   alternancias de superficie
--paper        #FBF8F2   superficie de cards
--ink          #1A1612   tinta principal (más cálida que negro puro)
--ink-soft     #4A413A   tinta secundaria
--ink-mute     #8A7E6F   tinta para metadatos
--terracotta   #B85342   acento de marca (deep #93392A)
--moss         #3D4F2E   éxito/confirmaciones
--ochre        #C99342   advertencias suaves / pendientes
```

### Detalles que dan personalidad

- **Wordmark `Stay·local`** con la palabra "local" en serif italic
  terracota y un punto al final (visualmente, una marca registrada).
- **Grano de papel** SVG inline en el `body` — añade textura cálida
  sin requests extra.
- **Numeración editorial** `№001..№###` en cards de alojamiento,
  derivada del id (función `serialFrom`).
- **Drop-cap** terracota en la primera letra de la descripción del
  alojamiento (`first-letter:` CSS).
- **`rule-stamp`** divisor con sello al centro (uppercase, mono,
  tracking generoso) — separa secciones con identidad.
- **Animación `rise`** con stagger en el hero (CSS keyframes + delays
  escalonados) — entrada cinematográfica sin libraries.

## Consecuencias

**Positivas**

- Identidad reconocible al instante, distinta de cualquier clon de
  Airbnb que un estudiante pueda haber visto.
- Coherencia entre web y correos (el comprobante usa la misma paleta y
  tipografías que la UI).
- Cero dependencias de Figma, Sketch o assets pagados.

**Negativas / mitigación**

- Fraunces es una fuente variable pesada (~140 KB). **Mitigación:**
  `display: "swap"` evita FOIT, `next/font` la inlinea solo donde se
  usa.
- Tres familias tipográficas son más de lo "mínimo". **Mitigación:** el
  rol de cada una es claro (display / body / mono); ninguna es
  decorativa redundante.

## Referencias

- `src/app/globals.css` — variables CSS y grano.
- `src/app/layout.tsx` — carga de fuentes con `next/font`.
- `tailwind.config.ts` — mapeo de variables a clases utility.
- `src/components/ui/Logo.tsx` — wordmark.
- `src/components/ui/StayCard.tsx` — numeración editorial.
