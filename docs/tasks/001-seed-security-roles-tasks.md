# Tasks: Seed, Security & Roles Refactor (RFC-001)

## Status Overview
- [x] Total Tasks
- [x] Database & Persistencia
- [x] Domain & Business Logic (inc. Unit Tests)
- [x] API & Controllers (inc. Unit Tests)
- [x] Events & Integrations (inc. Unit Tests)

---

## 🗄️ Layer 1: Database & Persistencia
### Task 1.1: Actualizar Enumeraciones de Roles
- **Description:** El rol `admin` es el que cuenta con el bypass global. Asegurar que los roles requeridos estén definidos (`admin`, `client`, `professional`, `user`, `ccps`).
- **Files to create/modify:** `src/auth/interfaces/valid-roles.ts`
- **Acceptance Criteria:**
  - El enum contiene todos los roles especificados de forma tipada.

---

## 🧠 Layer 2: Domain & Business Logic (Self-Tested Phase)
### Task 2.1: Refactor de Guards de Seguridad (admin bypass)
- **Description:** Modificar la lógica de `UserRoleGuard` y `PermissionsGuard` para otorgar acceso irrestricto si el rol del usuario es `admin`.
- **Files to create/modify:** 
  - `src/auth/guards/user-role.guard.ts`
  - `src/auth/guards/permissions.guard.ts`
- **Acceptance Criteria:**
  - Si `user.role?.name === 'admin'`, los guards retornan `true` inmediatamente sin consultar permisos en BD ni roles estáticos requeridos.

### Task 2.2: Implementar Limpieza de BD en el Seed
- **Description:** Crear la lógica de limpieza global de la base de datos dentro del servicio de Seed, respetando el orden de las dependencias (Foreign Keys) para borrar el contenido de las 11 tablas del sistema.
- **Files to create/modify:** `src/seed/seed.service.ts`
- **Acceptance Criteria:**
  - La base de datos queda vacía y lista para sembrar datos limpios sin errores de llaves foráneas.

### Task 2.3: Configurar Siembra de Roles, Permisos, Usuario Root y News
- **Description:** Implementar la siembra de la configuración de acceso inicial y datos mock:
  - Crear roles: `admin`, `professional`, `client`, `user`, `ccps`.
  - Asignar permisos:
    - `admin`: Acceso total (bypass, pero igual registrar permisos base y todos los perms).
    - `client` / `professional` / `user`: Mismos permisos básicos (acceso a profesiones, servicios y agendas).
    - `ccps`: Solo permisos de noticias (`read`, `write`, `create`, `update`, `delete` news).
  - El seed debe tener la lógica para limpiar la base de datos (`TRUNCATE TABLE ... CASCADE`) si se llama en desarrollo.
  - Crear usuario root: `admin@mail.com`, nombre `System Admin`, pass `Admin123!` con el rol `admin`.
  - Sembrar 5 noticias iniciales bilingües.
- **Files to create/modify:** `src/seed/seed.service.ts`
- **Acceptance Criteria:**
  - Los datos base se siembran correctamente en la DB al ejecutar el servicio.

### Task 2.4: Actualizar Unit Tests del Seed y Guards
- **Description:** Mockear las dependencias de limpieza (`roleRepository.manager`, etc.) y actualizar pruebas para cubrir el bypass de `admin`.
- **Files to create/modify:** 
  - `src/seed/seed.service.spec.ts`
  - `src/auth/guards/user-role.guard.spec.ts`
  - `src/auth/guards/permissions.guard.spec.ts`
- **Acceptance Criteria:**
  - Todas las pruebas unitarias de capa lógica pasan con éxito (`npm run test`).

---

## 🔌 Layer 3: API & Controllers (Self-Tested Phase)
### Task 3.1: Migrar Creación de Usuarios a ABAC (Permisos)
- **Description:** Cambiar la protección del endpoint `POST /users` para que utilice verificación por permisos en vez de verificación por rol.
- **Files to create/modify:** 
  - `src/users/users.controller.ts`
  - `src/users/users.module.ts` (si falta export/import del AuthModule)
- **Acceptance Criteria:**
  - Quitar `@RoleProtected(ValidRoles.admin)`.
  - Agregar `@RequirePermissions('write:users')` usando `PermissionsGuard`.

### Task 3.2: Permitir Actualización de Perfil a cualquier Rol (Owner Validation)
- **Description:** Modificar el endpoint de actualización de perfil para que en lugar de requerir el permiso `write:users` (o ser un rol estricto), cualquier usuario autenticado pueda actualizar SU PROPIO perfil, y que adicionalmente los `admin` puedan actualizar el de otros.
  - Usar un Helper `checkOwnershipOrAdmin` para validar contra `user.id`.
  - Falla con 403 Forbidden si intenta editar el perfil de otro (a menos que sea admin).

### Task 3.3: Escribir Unit Tests de Controladores
- **Description:** Actualizar/Añadir pruebas para los cambios en `users.controller` y `profiles.controller` asegurando las validaciones de acceso.
- **Files to create/modify:** 
  - `src/users/users.controller.spec.ts`
  - `src/profiles/profiles.controller.spec.ts`
- **Acceptance Criteria:**
  - Todas las pruebas de controladores pasan con éxito.

---

## 📡 Layer 4: Events, Integrations & Secondary Flows (Self-Tested Phase)
### Task 4.1: (N/A)
- **Description:** Para esta implementación no hay listeners o flujos secundarios nuevos, ya que los roles iniciales se siembran y el `RoleUpdatedEvent` se mantiene intacto.

---

## 🧪 Layer 5: Manual E2E & API Verification
### Task 5.1: Probar Ejecución del Seed y Accesos Localmente
- **Description:** Verificar los endpoints contra la base de datos real en un entorno de desarrollo.
- **Acceptance Criteria:**
  - El request `GET /seed` retorna HTTP 200 y limpia correctamente todas las tablas antes de sembrar.
  - El usuario `admin` NO puede crear un usuario nuevo.
  - El usuario `ccps` puede crear/editar noticias pero no acceder a usuarios.
  - El `admin` puede crear usuarios sin restricciones y acceder a todos los endpoints.
