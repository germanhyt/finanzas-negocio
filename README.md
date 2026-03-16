# Documentación Funcional y Técnica: Finanzas Negocio

## 🎯 1. Objetivo
Proporcionar un panel de control (Dashboard) integral para la gestión financiera de un negocio, permitiendo registrar, visualizar, analizar y exportar transacciones de ingresos y egresos en tiempo real. La solución facilita el seguimiento del balance general y los presupuestos, utilizando herramientas tecnológicas de fácil acceso como Google Sheets como base de datos principal, e integrando Inteligencia Artificial para la automatización en el registro de comprobantes (OCR).

## 👤 2. Casos de Uso

### 2.1. Visualización y Análisis Financiero
- **Resumen Estadístico:** El usuario visualiza de manera inmediata el total de ingresos, egresos y balance del rango de fechas seleccionado.
- **Gráficos Interactivos:** Análisis del balance por día, distribución de transacciones por tipo (pago QR, transferencia, efectivo, etc.) y la tendencia de operaciones según la hora del día.
- **Filtros Avanzados:** El usuario puede filtrar datos por fechas, tipo de movimiento (Ingreso/Egreso) y búsqueda de texto (Destinatario o Número de Operación).

### 2.2. Gestión de Transacciones
- **Registro de Nueva Transacción:** El usuario puede ingresar una operación financiera indicando banco, concepto, fecha, hora, monto, etc.
- **Lectura Automatizada (OCR) con IA:** El usuario tiene la opción de subir una imagen de un comprobante de pago bancario (Vouchers de Yape, Plin, BCP, BBVA, etc.). La IA procesa la imagen y autocompleta el formulario, evitando el tipeo manual.
- **Notificaciones en Tiempo Real:** Las operaciones recibidas externamente vía Webhook se muestran como notificaciones utilizando un sistema de in-memory global temporal (polling del Dashboard).

### 2.3. Gestión de Presupuestos
- **Seguimiento Presupuestal:** El usuario puede visualizar todas sus metas de presupuesto configuradas para un periodo.
- **Comparativa Presupuestado vs. Real:** Visualización gráfica del avance del gasto contra lo presupuestado y la respectiva diferencia porcentual.
- **CRUD de Presupuestos:** El usuario puede crear, editar o eliminar asignaciones presupuestales por categoría y mes/año.

### 2.4. Exportación y Cierre de Caja
- **Cuadre de Cierre del Día:** El usuario puede especificar rangos de fecha/hora para generar cuadres de caja.
- **Exportación de Reportes:** Se pueden descargar en formatos Excel (📊) y PDF (🧾) resumiendo total cobrado, total pagado, cantidad de transacciones y el balance resultante.

---

## 🏗️ 3. Arquitectura del Sistema

La aplicación sigue una arquitectura moderna, sin servidor tradicional de base de datos, apalancándose de APIs y servicios web:

- **Frontend (UI & Lógica de Cliente):** Construido sobre **Astro**, utilizando **React** para los componentes interactivos del Dashboard (Tablas, Filtros, Modal, Gráficos).
- **Backend (API Layer):** Astro API routes (`src/pages/api/*`) que interceptan todas las llamadas del cliente y orquestan la comunicación con los servicios externos.
- **Capa de Persistencia (Base de Datos):** Todos los datos permanentes de Transacciones y Presupuestos residen directamente en una Hoja de Cálculo de **Google Sheets**; operando como una base de datos distribuida y gratuita gestionada mediante `googleapis` + JWT (Service Account).
- **Inteligencia Artificial (OCR):** Para la automatización en lectura de imágenes/vouchers, el backend se integra de manera directa con **Google Generative AI (Gemini 2.0 Flash)**.
- **Estado Dinámico Temporal / Webhooks:** Store en memoria (`src/lib/store.ts`) que es capaz de recibir payloads a través de un webhook de sistemas de terceros para notificar en la interfaz la llegada de un pago sin necesidad de intervención manual o una base de datos pub/sub tipo Redis.

---

## 🔄 4. Flujo de Procesos

1. **Carga Inicial del Dashboard:**
   - El navegador solicita `index.astro`. Astro devuelve la página con el componente `<Dashboard />` montado e hidratado (Client Load).
   - Inmediatamente, React lanza la consulta `GET /api/transacciones` hacia el servidor.
   - La API autentica contra la Google API usando JWT, lee el rango de celdas de _Google Sheets_, procesa la validación de montos y fechas, estructura el resumen financiero y retorna JSON.
   - El UI renderiza las estadísticas, gráficos generados en Recharts y la tabla de operaciones.
   - Un mecanismo de autoguardado/polling consulta periódicamente (`cada 8s`) para refrescar las notificaciones del store de webhooks y mantener la ventana actualizada.

2. **Registro de una Transacción vía OCR (Voucher):**
   - El usuario abre la modal "Nueva Transacción" y selecciona "Cargar Imagen".
   - El archivo viaja mediante `POST /api/ocr` a Astro.
   - En el backend, el archivo es convertido a base64, se adjunta un elaborado _Prompt_ instructivo para modelar entidades JSON y es enviado a la API de _Gemini-2.0-Flash_.
   - Gemini analiza, extrae el texto (Banco, Hora, Fecha, Destinatario, Num_Operacion, etc.) y devuelve un String JSON crudo.
   - La respuesta es limpiada y enviada de nuevo al Browser para llenar los _inputs_ del formulario del usuario.
   - Tras validar o corregir, el usuario hace click en guardar: `POST /api/transacciones/save`, que termina insertando una nueva fila (Record) vía `values.append` en la BD de Google Sheets.

3. **Flujo de Cierre de Caja:**
   - En la sección "Cuadre del Cierre", el usuario delimita su filtro por "Desde - Hasta".
   - El UI procesa la información ya cargada en memoria, realizando cálculos locales sobre el arreglo de `transacciones`.
   - Si el usuario requiere el Excel o PDF, el flujo invoca funciones estáticas que construyen el blob o documento de manera programática para forzar la descarga en el equipo local.

4. **Flujo de Recepción Webhook Externa:**
   - Un cliente externo de cobros hace `POST /api/webhook`.
   - Se valida un `X-Webhook-Secret`.
   - Se convierte la trama a un objeto de Transacción y se almacena estáticamente en la memoria del runtime (Store TS), publicando la alerta en el array. La UI por defecto consultará esto e informará como _Notificación_.

---

## 💻 5. Stack Tecnológico

| Capa | Tecnología Utilizada |
|---------|---------------------|
| **Framework Base** | Astro (Static & SSR) |
| **Librería UI** | React 19.x |
| **Gráficos** | Recharts |
| **Lenguaje** | TypeScript / JavaScript (ESModules) |
| **Manejo de Fechas** | `date-fns` |
| **Inteligencia Artificial** | `@google/generative-ai` (Gemini API) |
| **Base de Datos / Backend Persistencia** | `googleapis` (Conexiones con Google Sheets) |
| **Entorno de Despliegue Configurado** | Compatibilidad con Vercel (`@astrojs/vercel`) |
| **Gestor de Paquetes** | Yarn / NPM |
