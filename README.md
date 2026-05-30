# 🪐 Cosmos Bank — Frontend premium para API_Banco

Frontend moderno tipo **Revolut / Nubank / Wise** para consumir la API REST de
`API_Banco` (ASP.NET Core + JWT + MySQL). Construido con **Vite + React 18 +
TailwindCSS + Framer Motion + Chart.js + Zustand**.

> El backend ya está configurado para aceptar este frontend en
> `http://localhost:5173` (ver `FrontendUrl` en `appsettings.json`).

---

## ✨ Características

- 🎨 **Diseño premium fintech**: glassmorphism, gradientes, tarjetas virtuales
  3D con tilt al hover, malla degradada ambiental, dark mode elegante con
  toggle instantáneo.
- ⚡ **Microinteracciones fluidas**: stagger en entrada de cards, page
  transitions, contadores animados (`useCountUp`), hover lifts, shimmer
  holográfico en tarjetas.
- 🔐 **JWT + roles**: rutas protegidas separadas para `ADMIN` y `CLIENTE`;
  interceptor de Axios que adjunta el token y detecta `401` para forzar
  logout.
- 📊 **Gráficas**: tendencia de saldo y distribución de egresos (Chart.js).
- 🧩 **Arquitectura limpia**: API → Hooks → Pages, con sistema de diseño
  reutilizable (`components/ui`) y componentes bancarios específicos
  (`components/banking`).
- 📱 **100% responsive**: móvil → tablet → desktop. Sidebar deslizable en
  móvil, layout adaptativo.

---

## 🧱 Stack

| Capa | Tecnología |
|------|------------|
| Build | Vite 5 |
| UI | React 18 + TailwindCSS 3 |
| Animaciones | Framer Motion |
| Iconos | Lucide React |
| Gráficas | Chart.js + react-chartjs-2 |
| HTTP | Axios (interceptors JWT) |
| Estado | Zustand (persistencia en localStorage) |
| Routing | React Router 6 (lazy + guards por rol) |
| JWT | jwt-decode |

---

## 📁 Estructura

```
src/
├── api/                # Cliente HTTP + 1 archivo por recurso del backend
│   ├── http.js
│   ├── auth.api.js
│   ├── cuentas.api.js
│   ├── operaciones.api.js
│   ├── pagos.api.js
│   └── bitacora.api.js
├── store/              # Zustand
│   ├── authStore.js
│   ├── uiStore.js
│   └── notificationStore.js
├── hooks/              # Hooks de datos y utilidades
│   ├── useCuentas.js
│   ├── useKardex.js
│   └── useCountUp.js
├── lib/                # Formatos (currency/fecha), enums TipoServicio…
├── components/
│   ├── ui/             # Sistema de diseño (Button, Input, Card, Modal…)
│   ├── layout/         # Sidebar, Topbar, DashboardLayout
│   ├── banking/        # VirtualCard, BalanceCard, TransactionRow…
│   ├── charts/         # BalanceTrendChart, CategoryDonut
│   ├── feedback/       # ToastContainer
│   └── auth/           # ProtectedRoute
├── pages/
│   ├── auth/LoginPage.jsx
│   ├── client/         # 8 vistas para CLIENTE
│   └── admin/          # 4 vistas para ADMIN
└── routes/AppRoutes.jsx
```

---

## 🚀 Puesta en marcha

Este proyecto usa **[pnpm](https://pnpm.io/)** como gestor de paquetes
(más rápido, eficiente en disco y con resolución estricta). Si no lo tienes:

```bash
# Opción 1: instalar pnpm globalmente
npm install -g pnpm

# Opción 2: vía Corepack (recomendado, viene con Node 16+)
corepack enable
corepack prepare pnpm@11.1.1 --activate
```

Luego:

```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar variables de entorno
cp .env.example .env
# Edita VITE_API_BASE_URL apuntando a tu backend

# 3. Levantar el dev server (puerto 5173, ya autorizado por CORS)
pnpm dev

# 4. Build de producción
pnpm build
pnpm preview
```

### Variables de entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | URL base de la API (incluye `/api`) | `https://bancocentroamericano.azurewebsites.net/api` |
| `VITE_APP_NAME` | Nombre visible de la marca | `Cosmos Bank` |
| `VITE_USE_PROXY` | `true` = el dev server reenvía `/api` → backend (evita CORS) | `true` |

### 🛰️ Modo Proxy (recomendado para Azure)

Cuando consumes la API **desplegada en Azure** desde el dev server local,
el navegador hace un preflight CORS y Azure suele rechazarlo (porque
`http://localhost:5173` no está en su whitelist).

La solución elegante: dejar `VITE_USE_PROXY=true`. Entonces:

- Las peticiones del navegador van a `http://localhost:5173/api/...`
  (mismo origen, **sin CORS**).
- Vite las reenvía internamente a `VITE_API_BASE_URL`.
- En `vite.config.js` está configurado `server.proxy` para hacer esto.

Si usas el backend **local** (`https://localhost:7160`) con CORS
permitiendo `localhost:5173`, puedes poner `VITE_USE_PROXY=false`.

> ⚠️ Para HTTPS local con certificado autofirmado, abre primero el backend
> en el navegador y acepta el certificado; o deja el proxy activo con
> `secure: false` (ya configurado).

---

## 🔐 Roles y rutas

| Ruta | Rol | Página |
|------|-----|--------|
| `/login` | público | Login premium |
| `/app` | CLIENTE | Dashboard |
| `/app/transacciones` | CLIENTE | Kardex + depósito/retiro |
| `/app/transferir` | CLIENTE | Transferencia entre cuentas |
| `/app/tarjetas` | CLIENTE | Tarjetas virtuales |
| `/app/pagos` | CLIENTE | Pago de servicios (univ./tel./energía) |
| `/app/estadisticas` | CLIENTE | Gráficas |
| `/app/notificaciones` | CLIENTE | Centro de actividad |
| `/app/ajustes` | CLIENTE | Tema, sesión |
| `/admin` | ADMIN | Dashboard admin |
| `/admin/clientes` | ADMIN | Padrón de cuentahabientes + emisión de tarjetas |
| `/admin/crear-cliente` | ADMIN | Alta de cuentahabiente |
| `/admin/activar-cuenta` | ADMIN | Depósito de activación |

---

## 🔌 Integración con la API

El backend devuelve errores con la forma `{ mensaje, error, detalles[] }`.
El interceptor en `src/api/http.js` los normaliza a:

```js
{ status, message, details, raw }
```

Todos los `.api.js` retornan **datos planos** (no la respuesta de Axios),
para que los componentes solo se preocupen por el dato.

El JWT se persiste en `localStorage` bajo la clave `cosmosbank.session.v1`.
Cuando `exp` caduca o el backend devuelve `401`, la sesión se cierra y se
muestra un toast amigable.

---

## 🎨 Sistema de diseño

- **Paleta**: brand `#6D5DFB` · accent `#22D3EE` · ink (escala neutra)
- **Tipografía**: Inter (UI) · JetBrains Mono (saldos / números)
- **Componentes base**: `Button`, `Input`, `Card`, `Modal`, `Skeleton`,
  `Badge`, `Spinner`, `EmptyState`, `PageHeader`, `ThemeToggle`
- **Componentes bancarios**: `VirtualCard` (con tilt 3D + shimmer),
  `BalanceCard` (con `useCountUp`), `TransactionRow`, `QuickAction`,
  `AccountSelector`
- **Animaciones**: Framer Motion + utilidades Tailwind (`shimmer`, `pop`,
  `slide-up`, `float`)

---

## 🛣️ Recomendaciones de escalabilidad

1. **Suspense + React Query**: si las páginas crecen, migrar los hooks
   (`useCuentas`, `useKardex`) a TanStack Query para cache, refetch en
   background, y polling.
2. **Form validation**: añadir Zod + react-hook-form si se incorporan
   formularios complejos (apertura de cuenta multi-step, etc.).
3. **i18n**: extraer strings a `src/locales/{es,en}.json` con
   `react-intl`/`i18next` para soportar más idiomas.
4. **Tests**: Vitest + Testing Library para componentes UI, MSW para mockear
   la API.
5. **PWA**: añadir `vite-plugin-pwa` para experiencia instalable.
6. **Refresh token**: cuando el backend lo exponga, agregar lógica en el
   interceptor de respuesta antes del logout.
7. **Sentry / OpenTelemetry**: para monitoreo de errores reales en
   producción.

---

## 📜 Scripts

| Script | Descripción |
|--------|-------------|
| `pnpm dev` | Servidor de desarrollo en puerto `5173` |
| `pnpm build` | Build optimizada para producción |
| `pnpm preview` | Sirve la build localmente |
| `pnpm lint` | Lint del código |

> El `package.json` declara `"packageManager": "pnpm@11.1.1"` y `engines.node >= 20`.
> Si intentas usar `npm install` aparecerá una advertencia: usa **pnpm**.

---

Hecho con cariño para el ecosistema **API_Banco**. ✨
