# Resumen Ejecutivo: Módulo de Compañías (Companies)

Este documento detalla el propósito de negocio, la arquitectura técnica y el comportamiento del módulo `companies` en el sistema.

---

## 1. Propósito de Negocio

El módulo `companies` es el pilar central de la arquitectura **Multi-tenant** de Vyma Backend. Representa a los inquilinos (Tenants/Companies), como cámaras, asociaciones o empresas independientes, que comparten la base de datos y la aplicación.

Este módulo se encarga de:
1.  **Definir e Identificar Inquilinos:** Almacenar la información general de cada compañía (nombre, RUC, datos de contacto, dominio web personalizado).
2.  **Gestionar Licencias/Módulos Activos (`activeModules`):** Definir a qué características o módulos específicos (ej. noticias, anuncios, eventos) tiene acceso cada compañía.
3.  **Vincular Personal Administrativo (`UserCompany`):** Registrar qué usuarios del sistema son colaboradores de una compañía, asignándoles roles locales para que puedan administrar los recursos del tenant de manera aislada.

---

## 2. Aislamiento y Caché Transparente

Para evitar colapsar la base de datos con consultas recurrentes en cada request (ya que el `TenantGuard` y los helpers de resolución pública consultan la compañía en cada petición HTTP), el repositorio de compañías cuenta con una capa de caché en memoria RAM con políticas de invalidación activa:

*   **Lectura de Compañía:** Claves `company:uuid:${uuid}` y `company:id:${id}` con un TTL de 10 minutos (`600s`).
*   **Verificación de Membresía:** Clave `company:membership:${userId}:${companyId}` con un TTL de 5 minutos (`300s`).
*   **Invalidación Activa:** Cualquier actualización (`update`), alta de miembro (`addMember`) o baja de miembro (`removeMember`) elimina inmediatamente sus claves correspondientes del caché para que los cambios de acceso de los usuarios e inquilinos surtan efecto en tiempo real.

---

## 3. Estructura de Endpoints y API

El controlador `CompaniesController` expone endpoints bajo `/companies` divididos según el nivel de autorización requerido:

### A. Operaciones de Plataforma (Exclusivas de `SuperAdmin`)
Solo el usuario con el rol global de `isSuperAdmin: true` puede llamar a estos endpoints. Ningún administrador local de un tenant puede consumirlos.

*   `POST /api/v1/companies`: Crea una nueva compañía en la plataforma.
*   `GET /api/v1/companies`: Retorna un listado global de todas las compañías registradas para fines de facturación y soporte técnico de la plataforma.
*   `PATCH /api/v1/companies/:uuid`: Actualiza la información básica y de contacto de la compañía de manera global.
*   `POST /api/v1/companies/:uuid/modules/activate`: Activa atómicamente un módulo contratado (ej. `NEWS`, `MEMBERS`) validando el valor contra el enum `CompanyModule`. Es idempotente.
*   `POST /api/v1/companies/:uuid/modules/deactivate`: Desactiva atómicamente un módulo contratado de forma inmediata. Es idempotente.

### B. Consulta de Compañía (Admin / SuperAdmin)
*   `GET /api/v1/companies/:uuid`: Retorna los detalles de la compañía. Está protegido con `@AuthPermissions('read:companies')`, lo que permite que un administrador local vea los datos de su propia compañía o que un SuperAdmin vea cualquiera.

### C. Gestión de Miembros del Equipo (Control local de accesos)
Endpoints dedicados a asociar usuarios del sistema con el tenant para permitirles operar el panel de administración. Protegidos bajo el permiso `'write:companies'` (usuarios con rol de Admin del tenant o SuperAdmin global):

*   `POST /api/v1/companies/:uuid/members`: Asocia un usuario del sistema (identificado por su `userUuid`) a la compañía, asignándole un rol específico (ej. Editor, Administrador). Inserta un registro en `UserCompany` e invalida la caché de membresía para ese usuario de forma inmediata.
*   `DELETE /api/v1/companies/:uuid/members/:userUuid`: Remueve la relación del usuario con la compañía, revocándole inmediatamente el acceso al panel administrativo de la organización.
