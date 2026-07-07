# Resumen Ejecutivo: Módulo de Cotizaciones de Monedas (Exchange Rates)

Este documento detalla el propósito de negocio, la arquitectura técnica y el comportamiento del módulo `exchange-rates` en el sistema.

---

## 1. Propósito de Negocio

El módulo `exchange-rates` se encarga de proveer y mantener actualizadas las cotizaciones de compra y venta de las principales monedas extranjeras (e.g. Dólar Estadounidense, Euro, Real Brasileño, Peso Argentino) de cara a los usuarios de los portales web de las organizaciones o cámaras (ej. CCPS).

Para evitar la carga manual diaria por parte de los administradores de la organización, el backend automatiza la obtención de cotizaciones mediante tareas programadas (cron jobs) que realizan scraping de datos de proveedores de cambios financieros reconocidos en el mercado.

En la arquitectura multi-tenant, cada listado de cotizaciones está asociado a una empresa (`Company`) mediante su `companyId`.

---

## 2. Origen de Datos y Automatización (Cron & Scraping)

Las cotizaciones del sistema se mantienen actualizadas a través de un flujo automatizado de scraping externo:

1.  **Proveedor de Datos:** El servicio consume la API pública de **Cambios Chaco** (`https://www.cambioschaco.com.py/api/branch_office/1/exchange`).
2.  **Scraping y Guardado:** La función interna `fetchChacoRates()` extrae las cotizaciones en tiempo de ejecución. El servicio procesa y normaliza los precios mediante la utilidad `extractRelevantRates()`, persistiendo las cotizaciones correspondientes e invalidando la caché de la aplicación.
3.  **Mecanismo de Fallback (Resiliencia):**
    *   Si la API externa falla (debido a caída del proveedor, timeout o cambios de formato), el sistema activa una política de resiliencia: recupera las últimas cotizaciones guardadas en la base de datos para ese tenant y las vuelve a guardar marcando la columna `isFallback: true` y emitiendo el evento de desacoplamiento `'rates.scraping_failed'`.
    *   Esto garantiza que los portales web públicos sigan mostrando datos históricos en lugar de quedar vacíos o lanzar errores ante problemas de red externa.
4.  **Tarea Programada (Cron):** El sistema cuenta con la clase `ExchangeRatesCron` que ejecuta automáticamente la sincronización de cotizaciones para todos los inquilinos que posean activo el módulo `EXCHANGE_RATES`.
    *   **Frecuencia del Cron:** De Lunes a Viernes a las 06:00 AM (`0 0 6 * * 1-5`).

---

## 3. Estructura de Datos (Entidad ExchangeRate)

La entidad `ExchangeRate` posee los siguientes campos:

*   **Identificación e Inquilinato:** `id` (UUID principal) y `companyId` (Tenant-scoped).
*   **Datos Monetarios:**
    *   `currency` (Nombre o identificador de la divisa, ej: `Dolar`, `Euro`).
    *   `purchasePrice` (Precio de compra).
    *   `salePrice` (Precio de venta).
*   **Estado:** `isFallback` (Indicador booleano que determina si el dato proviene de una cotización histórica debido a una falla de scraping del proveedor).
*   **Auditoría:** `createdAt` y `updatedAt` (soporte nativo para fecha y hora de la última cotización guardada).

---

## 4. Estructura de Endpoints y API

El módulo expone sus servicios a través del ruteador `/exchange-rates`:

### A. Endpoint Público (Visualización de Cotizaciones)
Cross-tenant y accesible de forma libre sin autenticación:

*   `GET /api/v1/exchange-rates`: Retorna las cotizaciones vigentes para la cámara. Requiere el parámetro de consulta `companyUuid` para identificar el tenant a consultar. El servicio lee los datos de la caché (con expiración de 24 horas) o, en su defecto, consulta el repositorio.

### B. Endpoint Administrativo (Scraping Manual)
Ruta restringida protegida bajo autenticación JWT, aislamiento por `TenantGuard` y validación de característica activa `ModuleAccessGuard` (modulo `EXCHANGE_RATES`):

*   `POST /api/v1/exchange-rates/scrape`: Permite a un administrador forzar de manera inmediata el scraping y actualización de cotizaciones desde el API de Cambios Chaco para su tenant en tiempo real, invalidando la caché. Requiere el permiso `exchange_rates:manage`.
