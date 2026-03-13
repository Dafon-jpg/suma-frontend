# 🔧 MANUAL TÉCNICO — Backend Handover para Tomas

> **Proyecto:** Suma Digital  
> **Fecha:** 5 de Marzo de 2026  
> **Autor:** Equipo Frontend  
> **Stack:** Next.js 13 (App Router) + Prisma + Supabase (PostgreSQL) + Vercel + Resend

---

## 1. Resumen de lo Realizado (Mercado Pago)

Se implementó la infraestructura completa para suscripciones recurrentes usando la **API de Preapproval** de Mercado Pago.

### Archivos Creados

| Archivo | Propósito |
|---------|-----------|
| `app/api/mercadopago/create-subscription/route.ts` | Crea un Preapproval (suscripción recurrente) |
| `app/api/webhooks/mercadopago/route.ts` | Recibe y procesa notificaciones de MP |
| `.env.local` | Credenciales de test de MP |

### API Route: `/api/mercadopago/create-subscription`

- **Método:** `POST`
- **Autenticación:** Requiere sesión de NextAuth
- **Qué hace:** Llama a `https://api.mercadopago.com/preapproval` con:
  ```json
  {
    "reason": "Suma Pro — Suscripción Mensual",
    "auto_recurring": {
      "frequency": 1,
      "frequency_type": "months",
      "transaction_amount": 9000,
      "currency_id": "ARS"
    },
    "back_url": "https://tudominio.com/dashboard/billing",
    "external_reference": "userId_del_usuario",
    "payer_email": "email@del.usuario",
    "status": "pending"
  }
  ```
- **Respuesta:** Devuelve `{ url: "init_point_de_mp", id: "preapproval_id" }`
- El frontend redirige al `url` para que el usuario autorice el cobro recurrente.

### Webhook: `/api/webhooks/mercadopago`

- **Método:** `POST`
- **Eventos procesados:** `subscription_preapproval` (webhook v2) y `preapproval` (IPN)
- **Flujo:**
  1. Recibe la notificación con el `preapproval_id`
  2. Consulta `GET https://api.mercadopago.com/preapproval/{id}` para verificar el estado
  3. Obtiene el `external_reference` (userId) del preapproval
  4. Actualiza la DB según el estado:
     - `authorized` → `subscriptionStatus = "active"`
     - `pending` → `subscriptionStatus = "pending"`
     - `paused` / `cancelled` → `subscriptionStatus = "cancelled"`

---

## 2. Estructura de Datos (Prisma Schema)

Se agregaron 3 campos al modelo `User` en `prisma/schema.prisma`:

```prisma
model User {
  // ... campos existentes ...

  // Stripe (ya existían)
  stripeCustomerId       String?   @unique @map(name: "stripe_customer_id")
  stripeSubscriptionId   String?   @unique @map(name: "stripe_subscription_id")
  stripePriceId          String?   @map(name: "stripe_price_id")
  stripeCurrentPeriodEnd DateTime? @map(name: "stripe_current_period_end")

  // Mercado Pago (NUEVOS)
  mpSubscriptionId       String?   @unique @map(name: "mp_subscription_id")
  mpCustomerId           String?   @map(name: "mp_customer_id")
  subscriptionStatus     String    @default("none") @map(name: "subscription_status")
}
```

### Valores de `subscriptionStatus`

| Valor | Significado |
|-------|-------------|
| `none` | Usuario free, nunca se suscribió |
| `pending` | Suscripción creada pero pendiente de autorización |
| `active` | Suscripción activa, usuario Pro |
| `cancelled` | Suscripción cancelada o pausada |

### Nota sobre el provider

El provider de Prisma fue cambiado de `mysql` a `postgresql` para compatibilidad con Supabase.

---

## 3. Pasos de Activación

### Paso 1: Configurar `DATABASE_URL` de Supabase

En el archivo `.env`, reemplazá la línea 14:

```diff
- DATABASE_URL=file:./dev.db
+ DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

> 📍 Encontrá esta URL en: [Supabase Dashboard](https://app.supabase.com) → Settings → Database → Connection string → URI

### Paso 2: Ejecutar la migración

```bash
npx prisma db push
```

Esto creará todas las tablas (`users`, `accounts`, `sessions`, `posts`, `verification_tokens`) con los nuevos campos de Mercado Pago en la base de Supabase.

Para generar el cliente Prisma:

```bash
npx prisma generate
```

### Paso 3: Configurar credenciales de MP

Las credenciales de test ya están en `.env.local`:

```env
NEXT_PUBLIC_MP_PUBLIC_KEY=TEST-36ab0a85-99e5-4b6b-a9d5-892c32679f2e
MP_ACCESS_TOKEN=TEST-192926946774047-030515-6f2b1e1db5277830af1da172f74368c7-3244976770
```

Para producción, reemplazar por las credenciales productivas desde el [Panel de Desarrolladores de MP](https://www.mercadopago.com.ar/developers/panel/app).

### Paso 4: Configurar Webhook en MP

1. Ir al [Panel de aplicaciones de MP](https://www.mercadopago.com.ar/developers/panel/app)
2. Seleccionar tu aplicación
3. En **Webhooks**, configurar:
   - **URL:** `https://tu-dominio-vercel.com/api/webhooks/mercadopago`
   - **Eventos:** `subscription_preapproval`

### Paso 5: Testing local con ngrok

Para probar webhooks en desarrollo local:

```bash
# Instalar ngrok (si no lo tenés)
npm install -g ngrok

# Exponer localhost:3000
ngrok http 3000

# Esto te dará una URL como: https://abc123.ngrok.io
# Usá esa URL en la config de webhooks de MP:
# https://abc123.ngrok.io/api/webhooks/mercadopago
```

### Paso 6: Validar con tarjetas de test

Mercado Pago provee tarjetas de test para el sandbox:

| Tarjeta | Número | CVV | Vencimiento |
|---------|--------|-----|-------------|
| Visa (aprobada) | 4509 9535 6623 3704 | 123 | 11/25 |
| Mastercard (aprobada) | 5031 7557 3453 0604 | 123 | 11/25 |
| Visa (rechazada) | 4000 0000 0000 0036 | 123 | 11/25 |

---

## 4. Variables de Entorno Completas

El archivo `env.mjs` valida con Zod. Las variables de MP son **opcionales** para no romper el build sin ellas:

```
# Server-side
MP_ACCESS_TOKEN=TEST-xxx          # opcional

# Client-side  
NEXT_PUBLIC_MP_PUBLIC_KEY=TEST-xxx  # opcional
```

---

## 5. Frontend (Estado Actual)

- Existe un **mock** `const isPro = true` en `page.tsx` que desbloquea todas las secciones Pro visualmente
- Cuando el backend esté listo, reemplazar por una consulta real al estado de suscripción del usuario
- El botón de pago ya está conectado a la API route (redirige a MP checkout)
- Para usuarios internacionales (PT/EN), se muestra un modal visual de **Lemon Squeezy** (a integrar)

---

## 6. Archivos Clave para Referencia

```
prisma/schema.prisma                              ← Schema completo
app/api/mercadopago/create-subscription/route.ts   ← Crear suscripción
app/api/webhooks/mercadopago/route.ts              ← Webhook MP
app/api/webhooks/stripe/route.ts                   ← Webhook Stripe (referencia)
lib/subscription.ts                                ← Lógica actual de isPro (Stripe)
env.mjs                                            ← Validación de env vars
.env.local                                         ← Credenciales MP (gitignored)
```
