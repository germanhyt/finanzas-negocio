# Finanzas Negocio - Dashboard

## Descripción
Dashboard de control financiero en tiempo real integrado con workflow n8n y Google Sheets.

## Arquitectura

```
src/
├── components/        # Componentes React
│   ├── Dashboard.tsx       # Componente principal
│   ├── StatsCards.tsx      # Tarjetas de estadísticas
│   ├── BalanceChart.tsx    # Gráfico de barras (ingresos/egresos)
│   ├── TiposPieChart.tsx   # Gráfico circular por tipo
│   ├── TransaccionesTable.tsx  # Tabla de transacciones
│   └── DateFilter.tsx      # Filtro de fechas
├── lib/               # Lógica de negocio
│   ├── types.ts       # Tipos TypeScript
│   ├── sheets.ts      # Integración Google Sheets
│   ├── analytics.ts   # Cálculos y agregaciones
│   └── store.ts       # Store en memoria (webhook)
├── pages/
│   ├── api/
│   │   ├── transacciones/index.ts  # GET transacciones
│   │   ├── resumen.ts              # GET resumen financiero
│   │   └── webhook.ts              # POST webhook n8n
│   └── index.astro    # Página principal
├── styles/
│   └── dashboard.css  # Estilos del dashboard
└── layouts/
    └── Layout.astro   # Layout base
```

## Configuración

### 1. Variables de entorno
Crea un archivo `.env` basándote en `.env.example`:

```bash
cp .env.example .env
```

Configura:
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Email de la cuenta de servicio
- `GOOGLE_PRIVATE_KEY`: Clave privada (con saltos de línea escapados)
- `GOOGLE_SPREADSHEET_ID`: ID del Google Sheet (ya configurado: `11C-PJF495WQluU2SE5XarnaGHEN7WZ5hmu1CjS_Z7J0`)
- `WEBHOOK_SECRET`: Secreto para validar requests del webhook

### 2. Google Cloud
1. Crear proyecto en Google Cloud Console
2. Habilitar Google Sheets API
3. Crear cuenta de servicio
4. Descargar credenciales JSON
5. Compartir el Sheet con el email de la cuenta de servicio

### 3. n8n Webhook
Agregar un nodo HTTP Request al final del workflow n8n:
- **URL**: `https://tu-dominio.com/api/webhook`
- **Method**: POST
- **Headers**: `X-Webhook-Secret: tu-secreto-seguro`
- **Body**: JSON con los campos parseados

## Endpoints API

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/transacciones` | GET | Lista transacciones (parámetros: `desde`, `hasta`) |
| `/api/resumen` | GET | Resumen financiero agregado |
| `/api/webhook` | POST | Recibir nuevas transacciones de n8n |

## Ejecución

```bash
# Desarrollo
yarn dev

# Build producción
yarn build

# Preview
yarn preview
```

## Stack
- **Astro** - Framework
- **React** - Componentes interactivos
- **Recharts** - Gráficos
- **googleapis** - Integración Google Sheets
- **date-fns** - Manejo de fechas




Google Sheets API Configuration Steps
Paso a paso

En Google Cloud Console, crea (o usa) un proyecto y habilita Google Sheets API.
Ve a IAM y administración → Cuentas de servicio y crea una cuenta de servicio.
En esa cuenta, crea una clave JSON y descárgala. De ahí obtienes:
GOOGLE_SERVICE_ACCOUNT_EMAIL = campo client_email
GOOGLE_PRIVATE_KEY = campo private_key (en una sola línea, con \n en lugar de saltos reales).
Abre tu Google Sheet y compártelo con el correo de la cuenta de servicio (client_email) con permiso Editor o Lector según necesites.
GOOGLE_SPREADSHEET_ID se saca de la URL del sheet:
https://docs.google.com/spreadsheets/d/<ESTE_ES_EL_ID>/edit...
WEBHOOK_SECRET: genera un secreto largo aleatorio. En Windows PowerShell:
-join ((65..90)+(97..122)+(48..57) | Get-Random -Count 64 | % {[char]$_})
Guarda todo en tus variables de entorno y reinicia el servidor para que tome los cambios.
Formato correcto de la clave privada

GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
Importante: no publiques esa clave en Git n




Usa este comando:
npm create astro@latest mi-proyecto
Opcional según tu gestor:

yarn create astro mi-proyecto
pnpm create astro@latest mi-proyecto
Luego entra a la carpeta y levanta el proyecto:

cd mi-proyecto
npm run dev



## Instalar libreria de google
 npm install @google/generative-ai