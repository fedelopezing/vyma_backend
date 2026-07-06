# 📜 Resumen Ejecutivo: Arquitectura de Tenants, Caché y Resolución

Este documento resume el comportamiento técnico, flujo y estado del aislamiento de Tenants, Control de Acceso a Módulos, Inicialización de Semillas (Seeds), la Capa de Caché en Repositorios y el Helper de Resolución de Compañías en el backend NestJS.

---

## 1. Identificación y Aislamiento de Tenants (UUIDs)

El backend de Vyma utiliza una estrategia de aislamiento lógico a nivel de base de datos usando identificadores únicos de tipo UUID expuestos al exterior, mientras mantiene claves primarias numéricas secuenciales autoincrementales a nivel interno para optimizar el rendimiento y las relaciones indexadas.

*   **Peticiones Administrativas**: Deben enviar el header `X-Company-Id` con el UUID de la compañía. El [TenantGuard](file:///c:/Users/fedel/NestJs/vyma_backend/src/common/guards/tenant.guard.ts) se encarga de:
    1.  Extraer y validar que sea un UUID válido.
    2.  Resolver la compañía a su ID numérico interno mediante `CompaniesRepository.findByUuid(...)`.
    3.  Adjuntar `companyId` (número) y los `activeModules` (lista de módulos activos) a la petición HTTP (`request.companyId`).
*   **Peticiones Públicas**: Reciben el parámetro `companyUuid` (por query string o ruta) y usan el helper `resolveActiveCompany` para traducir el UUID externo al ID numérico antes de llamar a la capa del servicio de negocio.

---

## 2. Control de Acceso a Módulos (`ModuleAccessGuard`)

Para garantizar que un tenant no consuma recursos de un módulo que no tiene contratado o activo, se implementó el guard [ModuleAccessGuard](file:///c:/Users/fedel/NestJs/vyma_backend/src/common/guards/module-access.guard.ts).

*   **Funcionamiento**:
    1.  Se decora un endpoint o controlador administrativo con `@RequireModule(CompanyModule.X)` (por ejemplo, `CompanyModule.ADS`).
    2.  El guard compara el módulo requerido contra la lista de `request.activeModules` inyectada previamente por el `TenantGuard`.
    3.  Si el módulo no está activo para el tenant, se lanza un `ForbiddenException`.

---

## 3. Dominios Personalizados (`domain`)

La entidad `Company` posee una columna `domain` que contiene el dominio web personalizado (por ejemplo, `ccps.org.py` o `biolimpieza.com`) con una restricción de unicidad (`UQ_companies_domain`).

*   **Uso Futuro**: Este campo está preparado para habilitar en el futuro la resolución automática del tenant basándose en el origen o el dominio de la request HTTP (`Origin` o `Host` headers), lo que permitirá ruteos automáticos sin necesidad de parámetros explícitos en los portales web públicos.

---

## 4. Datos Iniciales de Semilla (Seeds)

El proceso de inicialización de la base de datos (`POST /seed`) dota a las compañías de prueba de dominios, módulos activos y UUIDs fijos y predecibles para simplificar el desarrollo e integración frontend:

| Compañía | UUID Estático (Seed) | Dominio (Seed) | Módulos Activos (Seed) |
| :--- | :--- | :--- | :--- |
| **CCPS** | `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11` | `ccps.org.py` | `NEWS`, `EVENTS`, `MEMBERS`, `ADS`, `EXCHANGE_RATES` |
| **biolimpieza** | `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22` | `biolimpieza.com` | `SERVICES`, `SCHEDULES`, `SCHEDULE_BREAKS`, `MEMBERS` |
| **natynails** | `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33` | `natynails.com` | `SERVICES`, `SCHEDULES`, `SCHEDULE_BREAKS` |

---

## 5. Capa de Caché en Repositorios (Companies & Memberships)

Para evitar la sobrecarga de consultas a la base de datos por cada request entrante (tanto por el `TenantGuard` en rutas privadas como en las resoluciones de UUID en rutas públicas), se ha implementado una capa de caché transparente y autocontenida a nivel de persistencia de datos.

### Beneficios Principales:
*   **Cero Consultas Repetitivas**: Tras la primera petición de una compañía o validación de membresía, los datos se sirven directamente de la memoria RAM del servidor.
*   **Latencia Mínima**: Se evitan tiempos de ida y vuelta (*roundtrips*) a la base de datos para comprobaciones de infraestructura.
*   **Transparencia de Diseño**: Ni los guards, ni los controladores, ni los servicios saben que existe una caché. Se mantiene el flujo limpio `Controller → Service → Repository`.

### Estructura de Claves y Tiempos de Expiración (TTL):

| Repositorio | Operación | Clave de Caché | TTL | invalidación |
| :--- | :--- | :--- | :--- | :--- |
| [CompaniesRepository](file:///c:/Users/fedel/NestJs/vyma_backend/src/companies/repositories/companies.repository.ts) | `findByUuid` | `company:uuid:${uuid}` | 10 Minutos (`600s`) | Se invalida al ejecutar `update(...)`. |
| [CompaniesRepository](file:///c:/Users/fedel/NestJs/vyma_backend/src/companies/repositories/companies.repository.ts) | `findById` | `company:id:${id}` | 10 Minutos (`600s`) | Se invalida al ejecutar `update(...)`. |
| [UserCompanyRepository](file:///c:/Users/fedel/NestJs/vyma_backend/src/companies/repositories/user-company.repository.ts) | `isActiveMember` | `company:membership:${userId}:${companyId}` | 5 Minutos (`300s`) | Se invalida al ejecutar `addMember(...)` o `removeMember(...)`. |

### Estrategia de Coherencia de Datos (Invalidación Activa):
1.  **Actualización de Compañía (`update`)**: Antes de actualizar los datos de la compañía, se consulta su UUID original. Al completarse el update, se eliminan del caché tanto la entrada por ID (`company:id:${id}`) como la entrada por UUID (`company:uuid:${uuid}`).
2.  **Alta de Miembro (`addMember`)**: Al añadir un usuario a una compañía, se elimina de forma inmediata la clave `company:membership:${userId}:${companyId}` para obligar a una re-consulta activa en su próximo acceso.
3.  **Baja de Miembro (`removeMember`)**: Al retirar un miembro, se elimina la clave del caché `company:membership:${userId}:${companyId}`, revocando el acceso inmediato en la siguiente request HTTP.

---

## 6. Helper de Resolución de Compañías (`resolveActiveCompany`)

Para evitar la duplicación de código de validación en los controladores públicos, se centralizó la validación en el helper reutilizable [resolveActiveCompany](file:///c:/Users/fedel/NestJs/vyma_backend/src/common/helpers/company-resolver.helper.ts).

### Flujo de Trabajo:
```
Petición Pública 
      │ (con companyUuid)
      ▼
Controlador Público (e.g. AdsController)
      │
      ▼
resolveActiveCompany(companyUuid, companiesRepository)
      │
      ├───► 1. ¿Falta uuid? ──► BadRequestException
      ├───► 2. Consultar repositorio findByUuid (se lee de Caché RAM)
      │         │
      │         ├───► ¿No existe? ──► NotFoundException
      │         └───► ¿Inactiva?  ──► NotFoundException
      ▼
Retorna Company (activa)
```

Este helper unifica el comportamiento de errores y se beneficia automáticamente del caché de persistencia, garantizando un código de controlador extremadamente limpio, mantenible y DRY.
