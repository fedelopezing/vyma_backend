# Resumen Ejecutivo: Módulo de Eventos (Events)

Este documento detalla el propósito de negocio, la arquitectura técnica y el comportamiento del módulo `events` en el sistema.

---

## 1. Propósito de Negocio

El módulo `events` permite la administración y visualización de la agenda de eventos y actividades institucionales de una organización o cámara (ej. CCPS). Este módulo soporta eventos organizados directamente por la propia cámara o bien por uno de sus socios afiliados.

Los administradores pueden publicar convocatorias a seminarios, asambleas, conferencias y talleres. Admite la inclusión de enlaces externos de registro (e.g. Google Forms, Eventbrite) para la captación de participantes.

En la arquitectura multi-tenant, cada evento está asociado de manera obligatoria a una empresa (`Company`) mediante su `companyId`.

---

## 2. Estructura de Datos (Entidad Event)

La entidad `Event` cuenta con la siguiente estructura de campos:

*   **Identificación e Inquilinato:** `id` (UUID principal), `companyId` (Tenant-scoped) y `autorId` (usuario del sistema que creó el evento).
*   **Bilingüismo:** Soporta internacionalización en campos clave: `slugEs` / `slugEn`, `tituloEs` / `tituloEn`, `resumenEs` / `resumenEn`, `contenidoEs` (HTML sanitizado) / `contenidoEn`, y `ubicacionEs` / `ubicacionEn`.
*   **Detalles del Evento:** `fechaEvento` (fecha y hora del evento), `linkRegistro` (enlace externo para registro de participantes) e `imagenPortada` (URL de imagen de Cloudinary).
*   **Organización:** `organizador` (Enum: `CCPS` o `SOCIO`) y `organizadorNombre` (nombre opcional del socio u organizador).
*   **Estado:** `estado` (Enum: `BORRADOR` o `PUBLICADO`).
*   **Indexado:** Cuenta con índices compuestos de base de datos optimizados para la carga de agendas en base a la fecha, estado de publicación y no borrados (`deletedAt`).

---

## 3. Flujo de Entrada (Endpoints y API)

El módulo distribuye su consumo en dos contextos bajo el prefijo `/events`:

### A. Endpoints Públicos (Portal Web)
Accesibles de forma pública y cross-tenant bajo `/events`:

*   `GET /api/v1/events`: Retorna el listado paginado de eventos publicados. Requiere el parámetro de consulta `companyUuid` para filtrar los eventos correspondientes a la organización.
*   `GET /api/v1/events/:slug`: Obtiene el detalle completo del evento utilizando su slug.

### B. Endpoints Administrativos (Dashboard del Tenant)
Protegidos bajo los guards de autenticación, aislamiento (`TenantGuard`) y limitación por licencias (`ModuleAccessGuard` que valida que el tenant posea activo `CompanyModule.EVENTS`):

*   `GET /api/v1/events/admin`: Retorna todos los eventos (borradores y publicados) filtrados por el inquilino activo del administrador. Requiere permiso `read:events`.
*   `POST /api/v1/events/admin`: Crea un nuevo evento. Se asocia al administrador como autor y a su `companyId` como inquilino. Requiere permiso `create:events`.
*   `PUT /api/v1/events/admin/:id`: Actualiza la información de un evento existente, validando permisos de SuperAdmin o pertenencia al mismo tenant. Requiere permiso `update:events`.
*   `DELETE /api/v1/events/admin/:id`: Realiza el borrado lógico (soft-delete) del evento. Requiere permiso `delete:events`.
