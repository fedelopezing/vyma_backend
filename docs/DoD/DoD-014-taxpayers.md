# Definition of Done (DoD): Módulo Taxpayers (Lookup, TuRuc API y Caché PostgreSQL)

- **Versión:** 2.0
- **Fecha:** 2026-08-19
- **Cubre:** [RFC-014 — Taxpayers Lookup & Cache (v2.0)](file:///c:/Users/fedel/NestJs/vyma_backend/docs/RFCs/RFC-014-taxpayers-lookup.md)
- **Ambiente de prueba:** Local (`http://localhost:3100` o puerto configurado) con PostgreSQL y JWT activo.
- **Herramienta recomendada:** Swagger UI (`/api/v1/docs`) / Postman / cURL / Frontend

> ✅ Una funcionalidad está **Done** cuando pasa **todos** los checks de su sección.  
> ❌ Un check fallido bloquea el pase a producción.

---

## 📋 Tabla de Contenidos

1. [Prerequisitos Globales](#1-prerequisitos-globales)
2. [Bloque A — Base de Datos y Persistencia](#2-bloque-a--base-de-datos-y-persistencia)
3. [Bloque B — Validación Offline de RUC (Módulo 11)](#3-bloque-b--validación-offline-de-ruc-módulo-11)
4. [Bloque C — Endpoint de Consulta (Lookup con TuRuc + Caché)](#4-bloque-c--endpoint-de-consulta-lookup-con-turuc--caché)
5. [Bloque D — Búsqueda por Nombre sobre Caché (FTS Trigram)](#5-bloque-d--búsqueda-por-nombre-sobre-caché-fts-trigram)
6. [Bloque E — Tarea Programada (Cron de Refresco Proactivo)](#6-bloque-e--tarea-programada-cron-de-refresco-proactivo)
7. [Bloque F — Seguridad, Resiliencia y Fallback](#7-bloque-f--seguridad-resiliencia-y-fallback)
8. [Checklist Final de Merge](#8-checklist-final-de-merge)

---

## 1. Prerequisitos Globales

Antes de ejecutar las pruebas, verificar que el entorno está listo:

```bash
# 1. Base de datos PostgreSQL activa con migraciones ejecutadas
npm run typeorm:run

# 2. Servidor corriendo en modo desarrollo
npm run start:dev

# 3. Obtener token JWT de autenticación para los headers (ej. /api/v1/auth/login)
# Headers requeridos: Authorization: Bearer <TOKEN>
```

> [!NOTE]
> No se requiere descargar ningún archivo de padrón ni configurar API Keys externas. La integración con **TuRuc API** funciona de forma nativa e inmediata.

---

## 2. Bloque A — Base de Datos y Persistencia

- [ ] Extensión `pg_trgm` habilitada en PostgreSQL.
- [x] Tabla `taxpayer_cache` creada con campos:
  - `id` (UUID, PK)
  - `countryCode` (VARCHAR 2, INDEX)
  - `documentNumber` (VARCHAR 20, INDEX)
  - `dv` (VARCHAR 2)
  - `ruc` (VARCHAR 25)
  - `businessName` (VARCHAR 255, GIN index trgm)
  - `taxpayerType`, `status`, `address`, `city`
  - `cacheExpiresAt` (TIMESTAMPTZ, INDEX)
  - `rawData` (JSONB)
  - `createdAt`, `updatedAt` (TIMESTAMPTZ)
- [x] Constraint UNIQUE `(countryCode, ruc)` en `taxpayer_cache`.

---

## 3. Bloque B — Validación Offline de RUC (Módulo 11)

### Test B.1: Cálculo y normalización de DV
- **Request:** `GET /api/v1/taxpayers/validate-dv?document=4484207`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Respuesta esperada (200 OK):**
```json
{
  "documentNumber": "4484207",
  "dv": "4",
  "ruc": "4484207-4"
}
```
- [x] Calcula el DV instantáneamente (<2ms) sin peticiones HTTP externas.
- [x] Acepta tanto formato sin guion (`4484207`) como con guion (`4484207-4`).

---

## 4. Bloque C — Endpoint de Consulta (Lookup con TuRuc + Caché)

### Test C.1: Consulta Persona Física (Cache Miss Inicial)
- **Request:** `GET /api/v1/taxpayers/lookup?document=4484207`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Respuesta esperada (200 OK):**
```json
{
  "found": true,
  "documentNumber": "4484207",
  "dv": "4",
  "ruc": "4484207-4",
  "businessName": "LOPEZ AYALA, FEDERICO JAVIER",
  "taxpayerType": "PERSONA_FISICA",
  "status": "ACTIVO",
  "fromCache": false,
  "manualEntryRequired": false
}
```
- [x] Obtiene la información real desde la API de TuRuc (datos de la DNIT).
- [x] Inserta el registro en la tabla `taxpayer_cache` con TTL de 30 días (`cacheExpiresAt = NOW() + 30d`).

### Test C.2: Cache Hit (Consulta subsiguiente inmediata)
- **Request:** Repetir `GET /api/v1/taxpayers/lookup?document=4484207`
- [x] Respuesta inmediata (<5ms).
- [x] Retorna `"fromCache": true`.
- [x] No genera ninguna llamada HTTP externa hacia TuRuc.

### Test C.3: Consulta Persona Jurídica (Empresa)
- **Request:** `GET /api/v1/taxpayers/lookup?document=80000001`
- **Respuesta esperada (200 OK):**
```json
{
  "found": true,
  "documentNumber": "80000001",
  "dv": "3",
  "ruc": "80000001-3",
  "businessName": "NAVIERA CONOSUR SOCIEDAD ANONIMA",
  "taxpayerType": "PERSONA_JURIDICA",
  "status": "ACTIVO",
  "fromCache": false,
  "manualEntryRequired": false
}
```
- [x] Detecta correctamente el tipo `PERSONA_JURIDICA` y la razón social oficial.

---

## 5. Bloque D — Búsqueda por Nombre sobre Caché (FTS Trigram)

### Test D.1: Búsqueda de registros previamente consultados
- **Request:** `GET /api/v1/taxpayers/search?q=CONOSUR`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Respuesta esperada (200 OK):**
```json
[
  {
    "found": true,
    "documentNumber": "80000001",
    "dv": "3",
    "ruc": "80000001-3",
    "businessName": "NAVIERA CONOSUR SOCIEDAD ANONIMA",
    "taxpayerType": "PERSONA_JURIDICA",
    "status": "ACTIVO",
    "fromCache": true,
    "manualEntryRequired": false
  }
]
```
- [x] Retorna resultados coincidentes ordenados por similitud trigram.
- [x] Soporta paginación (`limit`, `page`) heredada de `BasePaginationDto`.

---

## 6. Bloque E — Tarea Programada (Cron de Refresco Proactivo Mensual)

- [x] El servicio `TaxpayersCronService` está decorado con `@Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)`.
- [x] Busca registros próximos a vencer con límite `LIMIT 100`.
- [x] Consulta TuRuc en background y actualiza `taxpayer_cache` (renueva TTL a 30 días) sin bloquear peticiones del usuario.
- [x] Si detecta un cambio de estado (ej: `ACTIVO` a `SUSPENDIDO`), emite el evento `taxpayer.status_changed`.

---

## 7. Bloque F — Seguridad, Resiliencia y Fallback

### Test F.1: Documento Inexistente o Caída Externa (Fallback Elegante)
- **Request:** `GET /api/v1/taxpayers/lookup?document=99999999`
- **Respuesta esperada (200 OK):**
```json
{
  "found": false,
  "documentNumber": "99999999",
  "dv": "3",
  "ruc": "99999999-3",
  "fromCache": false,
  "manualEntryRequired": true
}
```
- [x] El backend **NUNCA** responde con error 500 ante un RUC no encontrado o fallo de conexión con TuRuc.
- [x] Devuelve el DV calculado por Módulo 11 y marca `"manualEntryRequired": true` para que el usuario ingrese la razón social manualmente en el formulario del frontend.

### Test F.2: Autenticación y Autorización
- [x] Request sin header `Authorization` retorna `401 Unauthorized`.
- [x] Swagger documentado correctamente en `/api/v1/docs` con esquema de DTOs y respuestas.

---

## 8. Checklist Final de Merge

- [ ] `npm run build` compila con 0 errores TypeScript.
- [ ] `npm run lint` pasa sin advertencias ni errores.
- [ ] Suite de tests unitarios: `npm test -- taxpayers` pasa al 100% (42/42 tests).
- [ ] No existen dependencias de API keys externas ni archivos de padrón locales.
