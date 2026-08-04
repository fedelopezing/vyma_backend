# Definition of Done (DoD): Módulo Clientes + Staff

- **Versión:** 1.0
- **Fecha:** 2026-08-03
- **Cubre:** [RFC-012 — StaffModule](file:///c:/Users/fedel/NestJs/vyma_backend/docs/RFCs/RFC-012-modulo-personal.md) + [RFC-013 — ClientsModule](file:///c:/Users/fedel/NestJs/vyma_backend/docs/RFCs/RFC-013-clientes-empresas.md)
- **Ambiente de prueba:** Local (`http://localhost:3000`) con PostgreSQL y JWT activo.
- **Herramienta recomendada:** Postman / Thunder Client / cURL

> ✅ Una funcionalidad está **Done** cuando pasa **todos** los checks de su sección.  
> ❌ Un check fallido bloquea el merge a `main`.

---

## 📋 Tabla de Contenidos

1. [Prerequisitos Globales](#1-prerequisitos-globales)
2. [Bloque A — StaffModule (RFC-012)](#2-bloque-a--staffmodule-rfc-012)
3. [Bloque B — ClientsModule (RFC-013)](#3-bloque-b--clientsmodule-rfc-013)
4. [Bloque C — Integración N:M Staff ↔ Establecimiento](#4-bloque-c--integración-nm-staff--establecimiento)
5. [Bloque D — Seguridad y Autorización](#5-bloque-d--seguridad-y-autorización)
6. [Bloque E — Calidad de Código](#6-bloque-e--calidad-de-código)
7. [Checklist Final de Merge](#7-checklist-final-de-merge)

---

## 1. Prerequisitos Globales

Antes de ejecutar cualquier prueba, verificar que el entorno está listo:

```bash
# 1. Servidor corriendo en modo desarrollo
npm run start:dev

# 2. Migraciones aplicadas correctamente
npm run typeorm:run

# 3. Verificar tablas creadas en PostgreSQL
# Esperado: clients, client_representatives, establishments, contracts,
#            staff_establishment_assignments, staff_members
```

- [ ] El servidor arranca sin errores en consola.
- [ ] Las 5 tablas nuevas existen en la BD (`\dt` en psql).
- [ ] La tabla `staff_members` ya **no tiene** el campo `assignedLocation` (o está marcado como DEPRECATED).
- [ ] Swagger disponible en `http://localhost:3000/api/docs` con los endpoints de `/clients` y `/staff` documentados.
- [ ] Se tiene un token JWT válido con rol `ADMIN` y otro con rol `MANAGER` del mismo tenant.

```bash
# Obtener tokens (adaptar con credenciales del seed)
POST /api/v1/auth/login
{ "email": "admin@tenant.com", "password": "..." }   → guardar como $TOKEN_ADMIN
{ "email": "manager@tenant.com", "password": "..." } → guardar como $TOKEN_MANAGER
```

---

## 2. Bloque A — StaffModule (RFC-012)

### A1. Crear Staff Member

```http
POST /api/v1/staff
Authorization: Bearer $TOKEN_ADMIN
Content-Type: application/json

{
  "firstName": "Ana",
  "lastName": "González",
  "nationalId": "4123456",
  "gender": "FEMALE",
  "birthDate": "1990-05-15",
  "position": "Personal de Limpieza",
  "contractType": "FULL_TIME",
  "hireDate": "2025-01-10",
  "baseSalary": 2800000,
  "paymentType": "MONTHLY",
  "hasIpsCoverage": true,
  "bankName": "Banco Continental",
  "bankAccountNumber": "001-123456-7"
}
```

- [ ] Respuesta `201 Created` con `id`, `uuid` y todos los campos enviados.
- [ ] `status` por defecto es `ACTIVE`.
- [ ] `companyId` en la respuesta coincide con el tenant del token.

---

### A2. Prevenir CI duplicada en el mismo tenant

```http
POST /api/v1/staff
# Mismo payload que A1 (mismo nationalId)
```

- [ ] Respuesta `409 Conflict` con mensaje descriptivo (sin exponer stack trace).

---

### A3. Listar Staff con filtros y paginación

```http
GET /api/v1/staff?page=1&limit=10&status=ACTIVE
Authorization: Bearer $TOKEN_MANAGER
```

- [ ] Respuesta `200 OK` con estructura `{ data: [...], total: N, page: 1, limit: 10 }`.
- [ ] Solo devuelve staff del tenant del token (aislamiento multi-tenant).

```http
GET /api/v1/staff?nationalId=4123456
```

- [ ] Devuelve exactamente el staff member creado en A1.

---

### A4. Obtener detalle por ID

```http
GET /api/v1/staff/:id
Authorization: Bearer $TOKEN_MANAGER
```

- [ ] Respuesta `200 OK` con todos los campos del legajo.
- [ ] `GET /api/v1/staff/99999` → `404 Not Found`.

---

### A5. Actualizar datos del legajo

```http
PATCH /api/v1/staff/:id
Authorization: Bearer $TOKEN_MANAGER
Content-Type: application/json

{
  "phone": "+595981234567",
  "address": "Av. España 1234, Asunción",
  "baseSalary": 3200000
}
```

- [ ] Respuesta `200 OK` con campos actualizados.
- [ ] Campos no enviados (`firstName`, `nationalId`, etc.) permanecen sin cambios.

---

### A6. Cambiar estado operativo

```http
PATCH /api/v1/staff/:id/status
Authorization: Bearer $TOKEN_ADMIN
Content-Type: application/json

{ "status": "ON_LEAVE" }
```

- [ ] Respuesta `200 OK` con `status: "ON_LEAVE"`.

```http
PATCH /api/v1/staff/:id/status
{ "status": "TERMINATED" }
```

- [ ] Respuesta `200 OK` con `status: "TERMINATED"` y `terminationDate` seteado a hoy.

---

### A7. Eliminación lógica

```http
DELETE /api/v1/staff/:id
Authorization: Bearer $TOKEN_ADMIN
```

- [ ] Respuesta `204 No Content`.
- [ ] `GET /api/v1/staff/:id` → `404 Not Found` (excluido de queries activos).
- [ ] El registro **sigue existiendo** en la BD con `isActive: false` / `status: TERMINATED`.

---

## 3. Bloque B — ClientsModule (RFC-013)

### B1. Crear Cliente Persona Jurídica

```http
POST /api/v1/clients
Authorization: Bearer $TOKEN_ADMIN
Content-Type: application/json

{
  "clientType": "PERSONA_JURIDICA",
  "ruc": "80012345-6",
  "businessName": "Constructora ABC S.R.L.",
  "fantasyName": "ABC Construcciones",
  "taxCondition": "IVA_10",
  "businessForm": "SRL",
  "emailPrimary": "admin@abc.com.py",
  "phone": "+59521123456",
  "fiscalDepartment": "Central",
  "fiscalDistrict": "Asunción",
  "fiscalLocality": "Asunción",
  "fiscalAddress": "Av. Mcal. López 1500"
}
```

- [ ] Respuesta `201 Created` con `id`, `uuid` y todos los campos.
- [ ] `companyId` coincide con el tenant del token.
- [ ] Campos exclusivos de PF (`firstName`, `lastName`, `birthDate`) están `null`.

---

### B2. Crear Cliente Persona Física

```http
POST /api/v1/clients
{
  "clientType": "PERSONA_FISICA",
  "ruc": "1234567-8",
  "businessName": "Juan Pérez",
  "firstName": "Juan",
  "lastName": "Pérez",
  "birthDate": "1975-03-20",
  "taxCondition": "IVA_10",
  "businessForm": "EIRL",
  "emailPrimary": "juan@correo.com"
}
```

- [ ] Respuesta `201 Created`.

```http
# Persona Física sin firstName (campo obligatorio para PF)
POST /api/v1/clients
{ "clientType": "PERSONA_FISICA", "ruc": "9999999-1", "businessName": "Sin nombre" }
```

- [ ] Respuesta `400 Bad Request` indicando que `firstName` y `lastName` son requeridos para `PERSONA_FISICA`.

---

### B3. Prevenir RUC duplicado por tenant

```http
POST /api/v1/clients
# Mismo ruc que B1 (80012345-6)
```

- [ ] Respuesta `409 Conflict`.

---

### B4. Listar clientes con paginación y filtros

```http
GET /api/v1/clients?page=1&limit=10
Authorization: Bearer $TOKEN_MANAGER
```

- [ ] `200 OK` con estructura paginada. Solo clientes del tenant del token.

```http
GET /api/v1/clients?ruc=80012345-6
GET /api/v1/clients?clientType=PERSONA_JURIDICA
GET /api/v1/clients?isActive=true
```

- [ ] Cada filtro devuelve resultados correctos.

---

### B5. Obtener detalle del cliente (con relaciones)

```http
GET /api/v1/clients/:id
Authorization: Bearer $TOKEN_MANAGER
```

- [ ] `200 OK` con arrays `representatives` y `establishments` incluidos (pueden estar vacíos `[]`).
- [ ] `GET /api/v1/clients/99999` → `404 Not Found`.

---

### B6. Representantes

```http
POST /api/v1/clients/:clientId/representatives
Authorization: Bearer $TOKEN_ADMIN
{
  "firstName": "Carlos",
  "lastName": "Rodríguez",
  "documentType": "CEDULA_PY",
  "documentNumber": "3456789",
  "role": "GERENTE",
  "profession": "Administrador de Empresas",
  "roleStartDate": "2023-01-01",
  "roleEndDate": "2026-12-31"
}
```

- [ ] `201 Created` con `clientId` correcto.

```http
GET /api/v1/clients/:clientId/representatives
```

- [ ] `200 OK` con array que contiene el representante creado.

```http
PATCH /api/v1/clients/:clientId/representatives/:id
{ "profession": "Contador Público" }
```

- [ ] `200 OK` con `profession` actualizada.

```http
# Representante tipo SOCIO — campos adicionales requeridos
POST /api/v1/clients/:clientId/representatives
{
  "firstName": "María",
  "lastName": "López",
  "documentType": "CEDULA_PY",
  "documentNumber": "5678901",
  "role": "SOCIO",
  "sharesCount": 1000,
  "shareValue": 50000,
  "totalSharesValue": 50000000
}
```

- [ ] `201 Created` con `sharesCount`, `shareValue` y `totalSharesValue` correctos.

```http
DELETE /api/v1/clients/:clientId/representatives/:id
Authorization: Bearer $TOKEN_MANAGER
```

- [ ] `204 No Content`.

---

### B7. Establecimientos

```http
POST /api/v1/clients/:clientId/establishments
Authorization: Bearer $TOKEN_ADMIN
{
  "name": "Sede Central — Asunción",
  "isHeadquarters": true,
  "phone": "+59521999888",
  "email": "sede.central@abc.com.py",
  "address": "Av. Mcal. López 1500, Asunción",
  "locationReference": "Frente al Shopping"
}
```

- [ ] `201 Created` con `clientId` correcto. `latitude`, `longitude`, `geofenceRadiusMeters` son `null`.

```http
# Sede con geocerca
POST /api/v1/clients/:clientId/establishments
{
  "name": "Planta Luque",
  "isHeadquarters": false,
  "address": "Ruta 2 Km 18, Luque",
  "latitude": -25.2714,
  "longitude": -57.4891,
  "geofenceRadiusMeters": 150
}
```

- [ ] `201 Created` con `latitude`, `longitude` y `geofenceRadiusMeters` correctos (precisión decimal).

```http
GET /api/v1/clients/:clientId/establishments
```

- [ ] `200 OK` con array de 2 establecimientos.

```http
GET /api/v1/clients/:clientId/establishments/:id
```

- [ ] `200 OK` con arrays `contracts` y `staffAssignments` incluidos (pueden ser `[]`).

```http
PATCH /api/v1/clients/:clientId/establishments/:id
{ "geofenceRadiusMeters": 200 }
```

- [ ] `200 OK` con el radio actualizado.

---

### B8. Contratos

```http
POST /api/v1/clients/:clientId/establishments/:establishmentId/contracts
Authorization: Bearer $TOKEN_ADMIN
{
  "contractType": "ABONO_FIJO",
  "monthlyAmount": 8500000,
  "currency": "PYG",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "notes": "Servicio de limpieza mensual — 3 operarios"
}
```

- [ ] `201 Created` con `status: "ACTIVO"` por defecto.

```http
# Contrato tipo BOLSA_HORAS
POST .../contracts
{
  "contractType": "BOLSA_HORAS",
  "monthlyAmount": 0,
  "hoursBundleTotal": 80,
  "hourlyRate": 25000,
  "currency": "PYG",
  "startDate": "2025-03-01"
}
```

- [ ] `201 Created` con `hoursBundleTotal: 80` y `hourlyRate: 25000`.

```http
GET .../contracts
```

- [ ] `200 OK` con array de 2 contratos del establecimiento.

```http
PATCH .../contracts/:id
{ "status": "RENOVANDO", "notes": "En proceso de renovación para 2026" }
```

- [ ] `200 OK` con campos actualizados.

```http
DELETE .../contracts/:id
Authorization: Bearer $TOKEN_ADMIN
```

- [ ] `204 No Content`.
- [ ] El contrato ya no aparece en `GET .../contracts` (eliminación lógica: `isActive: false`).

---

## 4. Bloque C — Integración N:M Staff ↔ Establecimiento

> Prerequisito: tener un `StaffMember` activo (de A1) y un `Establishment` creado (de B7).

### C1. Asignar staff a establecimiento

```http
POST /api/v1/clients/:clientId/establishments/:id/staff
Authorization: Bearer $TOKEN_ADMIN
{
  "staffMemberId": <id del staff de A1>,
  "startDate": "2025-02-01"
}
```

- [ ] `201 Created` con `staffMemberId`, `establishmentId`, `startDate` y `isActive: true`.
- [ ] `endDate` es `null`.

---

### C2. Listar staff asignado a la sede

```http
GET /api/v1/clients/:clientId/establishments/:id/staff
Authorization: Bearer $TOKEN_MANAGER
```

- [ ] `200 OK` con el staff member del paso C1.
- [ ] La respuesta incluye al menos `staffMemberId`, `startDate`, `isActive`.

---

### C3. Ver detalle del establecimiento con asignaciones

```http
GET /api/v1/clients/:clientId/establishments/:id
```

- [ ] `staffAssignments` en la respuesta contiene la asignación creada en C1.

---

### C4. Asignar el mismo staff a una segunda sede

```http
# Crear segundo establecimiento primero (B7), luego:
POST /api/v1/clients/:clientId/establishments/:id2/staff
{
  "staffMemberId": <mismo staff>,
  "startDate": "2025-02-15"
}
```

- [ ] `201 Created` — un staff puede estar asignado a múltiples sedes en Fase 1 (la restricción de concurrencia geolocalizada se activa en Fase 2).

---

### C5. Desasignar staff de una sede

```http
DELETE /api/v1/clients/:clientId/establishments/:id/staff/:staffId
Authorization: Bearer $TOKEN_ADMIN
```

- [ ] `204 No Content`.
- [ ] En BD: el registro en `staff_establishment_assignments` tiene `isActive: false` y `endDate` seteado a la fecha de hoy.
- [ ] `GET .../establishments/:id/staff` ya no muestra esa asignación activa.

---

### C6. Verificar en PostgreSQL la tabla pivot

```sql
-- Ejecutar en psql / DBeaver
SELECT
  sea.id,
  sm."firstName" || ' ' || sm."lastName" AS staff,
  e.name AS establishment,
  sea."startDate",
  sea."endDate",
  sea."isActive"
FROM staff_establishment_assignments sea
JOIN staff_members sm ON sm.id = sea."staffMemberId"
JOIN establishments e ON e.id = sea."establishmentId"
ORDER BY sea.id;
```

- [ ] Los registros creados en C1 y C4 están presentes.
- [ ] El registro desasignado en C5 tiene `isActive = false` y `endDate` correcta.

---

## 5. Bloque D — Seguridad y Autorización

### D1. Acceso sin token rechazado

```http
GET /api/v1/clients
# Sin header Authorization
```

- [ ] `401 Unauthorized`.

```http
GET /api/v1/staff
# Sin header Authorization
```

- [ ] `401 Unauthorized`.

---

### D2. Token de otro tenant no accede a datos ajenos

```bash
# Obtener token de un tenant diferente (tenant B)
POST /api/v1/auth/login
{ "email": "admin@tenant-b.com", "password": "..." } → $TOKEN_TENANT_B
```

```http
GET /api/v1/clients
Authorization: Bearer $TOKEN_TENANT_B
```

- [ ] `200 OK` pero con `data: []` (sin datos del tenant A).

```http
GET /api/v1/clients/:id_del_tenant_A
Authorization: Bearer $TOKEN_TENANT_B
```

- [ ] `404 Not Found` (el servicio filtra por `companyId` del token).

---

### D3. DELETE solo permitido a ADMIN

```http
DELETE /api/v1/clients/:id
Authorization: Bearer $TOKEN_MANAGER
```

- [ ] `403 Forbidden`.

```http
DELETE /api/v1/staff/:id
Authorization: Bearer $TOKEN_MANAGER
```

- [ ] `403 Forbidden`.

---

### D4. MANAGER puede leer y crear, pero no eliminar

```http
POST /api/v1/clients
Authorization: Bearer $TOKEN_MANAGER
{ ...payload válido... }
```

- [ ] `201 Created`.

```http
GET /api/v1/clients
Authorization: Bearer $TOKEN_MANAGER
```

- [ ] `200 OK`.

---

## 6. Bloque E — Calidad de Código

### E1. Tests unitarios

```bash
# Ejecutar suite completa con cobertura
npm run test:cov
```

- [ ] `clients.service.spec.ts` — todos los tests pasan ✅
- [ ] `clients.controller.spec.ts` — todos los tests pasan ✅
- [ ] `staff.service.spec.ts` — todos los tests pasan ✅
- [ ] `staff.controller.spec.ts` — todos los tests pasan ✅
- [ ] Cobertura global ≥ 80% statements/functions/lines.
- [ ] Cobertura de branches ≥ 78%.

---

### E2. Lint sin errores

```bash
npm run lint
```

- [ ] 0 errores de ESLint.
- [ ] 0 warnings críticos (unused-vars, no-explicit-any, etc.).

---

### E3. Build de producción limpio

```bash
npm run build
```

- [ ] Build completa sin errores de TypeScript.

---

### E4. Swagger completo

- [ ] `GET /api/docs` — sección `/clients` visible con todos los endpoints documentados.
- [ ] Cada endpoint tiene descripción, ejemplos de DTO y códigos de respuesta (`200`, `201`, `400`, `401`, `403`, `404`, `409`).
- [ ] Los decoradores Swagger están en `clients-swagger.decorators.ts`, **no inline** en el controller.

---

### E5. Verificación de arquitectura

```bash
# No debe haber @InjectRepository directamente en servicios
grep -r "@InjectRepository" src/clients/
grep -r "@InjectRepository" src/staff/
```

- [ ] El grep devuelve **0 resultados** en los servicios (solo permitido en repositories).

```bash
# No debe haber lógica de negocio en controllers
# (verificación manual — el controller solo delega al service)
```

- [ ] Controllers no contienen `if/else` de lógica de negocio — solo delegación al service.

---

## 7. Checklist Final de Merge

Este checklist resume el estado de todos los bloques. **Todos deben estar marcados** antes de hacer merge a `main`.

### 🟢 StaffModule (RFC-012)

- [ ] **A1** — Crear staff member exitosamente
- [ ] **A2** — CI duplicada rechazada (409)
- [ ] **A3** — Listado paginado y filtros funcionan
- [ ] **A4** — Detalle por ID (200 + 404)
- [ ] **A5** — PATCH parcial de datos
- [ ] **A6** — Cambio de estado operativo
- [ ] **A7** — Eliminación lógica verificada en BD

### 🔵 ClientsModule (RFC-013)

- [ ] **B1** — Crear cliente PJ exitosamente
- [ ] **B2** — Crear cliente PF con validación condicional
- [ ] **B3** — RUC duplicado rechazado (409)
- [ ] **B4** — Listado paginado y filtros
- [ ] **B5** — Detalle con relaciones embebidas
- [ ] **B6** — CRUD completo de representantes (incluyendo tipo SOCIO)
- [ ] **B7** — CRUD completo de establecimientos (con y sin geocerca)
- [ ] **B8** — CRUD completo de contratos (ABONO_FIJO + BOLSA_HORAS)

### 🔗 Integración N:M (RFC-012 + RFC-013)

- [ ] **C1** — Asignación staff → sede creada
- [ ] **C2** — Listado de staff por sede
- [ ] **C3** — Detalle de sede incluye asignaciones
- [ ] **C4** — Staff asignado a múltiples sedes
- [ ] **C5** — Desasignación con endDate correcto en BD
- [ ] **C6** — Verificación directa en PostgreSQL

### 🔐 Seguridad

- [ ] **D1** — Sin token → 401
- [ ] **D2** — Aislamiento multi-tenant verificado
- [ ] **D3** — DELETE bloqueado para MANAGER (403)
- [ ] **D4** — MANAGER puede leer y crear

### 📐 Calidad

- [ ] **E1** — Tests unitarios pasan, cobertura ≥ 80%
- [ ] **E2** — Lint sin errores
- [ ] **E3** — Build de producción limpio
- [ ] **E4** — Swagger completo
- [ ] **E5** — Arquitectura respeta convenciones (sin @InjectRepository en services)

---

> **¿Algún check falló?** → No merge. Abrir issue con el número del check fallido (ej: `DoD-D3 FAIL`) y asignarlo al desarrollador responsable.
