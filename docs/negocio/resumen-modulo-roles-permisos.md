# Resumen Ejecutivo: Módulo de Roles y Permisos

Este documento detalla el propósito de negocio, la arquitectura técnica y el comportamiento de la autorización basada en roles y permisos (RBAC) en el sistema.

---

## 1. Propósito de Negocio

El sistema implementa un control de acceso basado en roles y permisos (RBAC - Role-Based Access Control). Su objetivo es garantizar la granularidad en las autorizaciones, permitiendo a los administradores definir perfiles (Roles) y asociarles capacidades específicas de acción (Permisos), las cuales se evalúan dinámicamente en cada petición del usuario.

---

## 2. Relación de Entidades

*   **Permiso (`Permission`):** Representa una acción unitaria permitida en el sistema (ej. `read:users`, `write:users`). Los permisos se definen de forma global en la plataforma.
*   **Rol (`Role`):** Agrupación de permisos que define un perfil (ej. `admin`, `manager`, `client`). Posee una relación de muchos a muchos con la entidad `Permission`. Los roles también se configuran de forma global. El catálogo fue refactorado para eliminar el rol rígido `ccps` (pasa a ser una empresa) e incorporar el rol `manager`.
*   **Usuario (`User`) y Membresía (`UserCompany`):** En el esquema multi-tenant, los roles ya no están acoplados de forma rígida directamente al usuario. La relación se define a nivel de la membresía (`UserCompany`). Así, un usuario puede tener asignado un rol específico por cada empresa a la que pertenece (por ejemplo, `admin` en la Empresa A y `professional` en la Empresa B).
    *   *Nota de Compatibilidad:* La relación directa `role` en la entidad `User` se mantiene temporalmente para asegurar la compatibilidad con el sistema de autorización heredado, pero el rol activo de la sesión del usuario se determina en tiempo de ejecución a partir de la membresía activa elegida al iniciar sesión.


---

## 3. Endpoints del Módulo (API)

Todos los endpoints administrativos requieren autenticación JWT y el permiso correspondiente evaluado por el `PermissionsGuard`:

### Gestión de Roles (`/roles`)
*   `GET /roles`: Retorna el catálogo completo de roles junto con sus permisos asignados. *(Requiere permiso: `read:users`)*
*   `POST /roles`: Registra un nuevo rol asociándole un listado de acciones/permisos. *(Requiere permiso: `write:users`)*
*   `PUT /roles/:id`: Modifica la información de un rol y re-asocia sus permisos en la base de datos. Dispara el evento `role.updated`. *(Requiere permiso: `write:users`)*

### Catálogo de Permisos (`/permissions`)
*   `GET /permissions`: Retorna la lista plana de todos los permisos disponibles en el sistema para auditoría y asignación. *(Requiere permiso: `read:users`)*

---

## 4. Rendimiento y Caché de Autorización

Evaluar los permisos directamente en la base de datos para cada petición HTTP deteriora el rendimiento del backend. Para optimizar esto, el sistema implementa una **estrategia de caché híbrida**:

1.  **Carga e Inserción en Caché:** Al validar un endpoint mediante `PermissionsGuard`, el sistema llama a `getUserPermissions(userId)`. 
    *   Intenta recuperar los permisos del usuario desde el motor de caché (`CacheService`).
    *   Si no existen en caché, los consulta en la base de datos una sola vez, los almacena con una expiración (TTL) de 1 hora y los retorna.
2.  **Invalidación Reactiva (Event-Driven):** Si un administrador modifica la configuración de permisos de un rol mediante `PUT /roles/:id`:
    *   Se emite el evento `role.updated`.
    *   El escuchador `RoleCacheListener` reacciona de inmediato, consulta los usuarios que tienen asignados dicho rol y **elimina sus entradas en la caché**.
    *   En su siguiente petición HTTP, el sistema volverá a consultar a la base de datos reflejando instantáneamente los nuevos permisos sin que el usuario deba reiniciar sesión.
