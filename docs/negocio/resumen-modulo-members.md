# Resumen Ejecutivo: Módulo de Miembros (Members)

Este documento detalla el propósito de negocio, la arquitectura técnica y el comportamiento del módulo `members` en el sistema.

---

## 1. Propósito de Negocio

El módulo `members` gestiona las postulaciones de empresas o personas físicas que desean asociarse como miembros (socios) de una organización o cámara (`Company`). 

Los usuarios externos pueden enviar solicitudes de registro, las cuales ingresan al sistema en estado pendiente. Posteriormente, el equipo administrativo de la organización evalúa y aprueba/rechaza las postulaciones. Los miembros aprobados pasan a formar parte del directorio de socios oficial y, si se los marca como destacados (`isFeatured: true`), pueden aparecer de forma prioritaria en los portales públicos de la cámara.

En la arquitectura multi-tenant, cada miembro está asociado estrictamente a una organización (`Company`) mediante el campo `companyId`.

---

## 2. Estructura de Datos (Entidad Member)

La entidad `Member` almacena los datos comerciales y de contacto del socio:

*   **Identificación e Inquilinato:** `id` (UUID principal), `companyId` (relación ManyToOne con `Company` mediante clave numérica externa para indexado eficiente).
*   **Datos del Socio:** `companyName` (nombre o razón social), `taxId` (RUC, CUIT, NIF), `email` (único del socio), `phone`, `address`, `city`, `country`, `logoUrl`, `category` (categoría de membrecía).
*   **Información de Contacto Adicional:**
    *   `representativeName`, `representativeEmail`, `representativePhone` (representante oficial ante la cámara).
    *   `marketingContact` (`jsonb` que almacena nombre, email y teléfono).
    *   `socialLinks` (`jsonb` que almacena enlaces a perfiles como LinkedIn, Twitter, etc.).
*   **Ciclo de Vida y Negocio:**
    *   `feeType` (Tipo de cuota: `ANNUAL` o `SEMIANNUAL`).
    *   `status` (Estado del socio: `PENDING`, `APPROVED`, `REJECTED`, `INACTIVE`).
    *   `isFeatured` (Indicador de socio destacado en portada).
    *   `version` (Control de concurrencia optimista para evitar sobrescrituras accidentales).
    *   `createdAt`, `updatedAt`, `deletedAt` (soporte nativo para auditoría básica y borrado lógico/soft-delete).

---

## 3. Flujo de Entrada (Endpoints y API)

El módulo divide sus operaciones en dos contextos bien diferenciados bajo el prefijo general de la API:

### A. Endpoints Públicos (Portal Externo)
Disponibles públicamente para los postulantes y el directorio web, ruteados bajo `/members`:

*   `POST /api/v1/members/apply`: Permite enviar una nueva solicitud de membresía. La postulación ingresa por defecto en estado `PENDING`.
*   `GET /api/v1/members/:companyUuid`: Retorna el listado paginado de miembros que ya han sido **aprobados** (`APPROVED`) por la organización asociada al UUID. Utiliza el helper `resolveActiveCompany` para traducir el UUID externo al ID numérico y optimizar la consulta.
*   `GET /api/v1/members/:companyUuid/featured`: Retorna el listado de los miembros destacados (`isFeatured: true` y `APPROVED`) de la organización.

### B. Endpoints Administrativos (Dashboard de la Organización)
Ruteados bajo `/admin/members`, protegidos de forma secuencial por `JwtAuthGuard`, `TenantGuard` (para asegurar que el administrador solo acceda a los socios de su propia empresa) y `ModuleAccessGuard` (que valida que la empresa tenga habilitado el módulo `CompanyModule.MEMBERS`):

*   `GET /api/v1/admin/members`: Lista todos los miembros (pendientes, aprobados, inactivos, etc.) con filtros y paginación para el tenant del administrador. Requiere permiso `read:members`.
*   `PUT /api/v1/admin/members/:id`: Modifica la información general de un miembro específico. Valida la coincidencia de versión (`version`) para evitar colisiones de edición. Requiere permiso `update:members`.
*   `PATCH /api/v1/admin/members/:id/status`: Aprueba, rechaza o inactiva a un miembro. Si el estado cambia, dispara eventos de notificación. Requiere permiso `update:members`.
*   `PATCH /api/v1/admin/members/:id/featured`: Marca o desmarca al miembro como destacado (`isFeatured`). Requiere permiso `update:members`.

---

## 4. Lógica de Eventos y Notificaciones

El servicio implementa un desacoplamiento basado en eventos (`EventEmitter2`) para extender el comportamiento al momento de procesar membresías:

1.  **`member.application.received`:**
    *   **Emisor:** `MembersService.apply`.
    *   **Payload:** `MemberApplicationReceivedEvent` (contiene la información del miembro recién registrado).
    *   **Acción:** Capturado por `MemberNotificationsListener` para encolar o simular notificaciones por correo (e.g. confirmar al postulante que su solicitud fue recibida o alertar a la cámara).
2.  **`member.application.status-changed`:**
    *   **Emisor:** `AdminMembersService.updateStatus` (solo si el nuevo estado es diferente al anterior).
    *   **Payload:** `MemberApplicationStatusChangedEvent` (contiene la entidad modificada y el nuevo estado).
    *   **Acción:** Capturado por `MemberNotificationsListener` para integrarse con proveedores de correo y notificar a la empresa del postulante el resultado de la revisión (aprobación o rechazo).
