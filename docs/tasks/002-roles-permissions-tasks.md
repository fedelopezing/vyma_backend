# Tareas: Sistema de Roles y Permisos (RBAC Dinámico) (RFC-002)

## Resumen del Estado
- [ ] Total de Tareas (14 tareas)
- [x] Base de Datos y Persistencia (2 tareas)
- [x] Dominio y Lógica de Negocio (inc. Pruebas Unitarias) (4 tareas)
- [x] API y Controladores (inc. Pruebas Unitarias) (5 tareas)
- [x] Eventos e Integraciones (inc. Pruebas Unitarias) (2 tareas)
- [ ] Verificación Manual E2E y API (1 tarea)

---

## 🗄️ Capa 1: Base de Datos y Persistencia

### Tarea 1.1: Crear Entidades de TypeORM
- **Descripción:** Definir las clases de entidad `Role` y `Permission` con sus respectivas propiedades, relaciones e índices. Actualizar la entidad `User` existente para realizar la transición del Enum `role` estático a una relación `ManyToOne` que haga referencia a `Role`.
- **Archivos a crear/modificar:**
  - [NEW] [role.entity.ts](file:///c:/Users/fedel/NestJs/vyma_backend/src/auth/entities/role.entity.ts)
  - [NEW] [permission.entity.ts](file:///c:/Users/fedel/NestJs/vyma_backend/src/auth/entities/permission.entity.ts)
  - [MODIFY] [user.entity.ts](file:///c:/Users/fedel/NestJs/vyma_backend/src/auth/entities/user.entity.ts)
- **Criterios de Aceptación:**
  - La entidad `Role` tiene `@PrimaryGeneratedColumn('increment') id: number`, `@Column({ unique: true }) name: string`, y una relación `@ManyToMany(() => Permission)` llamada `permissions` mapeada a través de `@JoinTable({ name: 'role_permissions' })`.
  - La entidad `Permission` tiene `@PrimaryGeneratedColumn('increment') id: number` y `@Column({ unique: true }) action: string`.
  - La entidad `User` tiene su antigua columna de rol `@Column('enum', ...)` eliminada/comentada y reemplazada con una relación `@ManyToOne(() => Role)` llamada `role` que se mapea a la columna de la base de datos `role_id` a través de `@JoinColumn({ name: 'role_id' })`.
  - Las clases de TypeORM están completa y estrictamente tipadas.
  - Las entidades se colocan dentro de los directorios escaneados automáticamente por el patrón glob de entidades de TypeORM en [data-source.ts](file:///c:/Users/fedel/NestJs/vyma_backend/src/database/data-source.ts).

### Tarea 1.2: Generar y Ejecutar la Migración de la Base de Datos
- **Descripción:** Generar la migración SQL para crear las tablas `roles`, `permissions` y la tabla de unión `role_permissions`, y modificar la tabla `users` para admitir la nueva relación de clave foránea (`role_id`).
- **Archivos a crear/modificar:**
  - [NEW] `src/database/migrations/*-dynamic-roles-permissions.ts`
- **Criterios de Aceptación:**
  - Generar la migración utilizando los comandos estándar de la CLI de TypeORM (por ejemplo, `npm run typeorm:generate -- -n NombreMigracion`).
  - El script de migración se ejecuta con éxito en la base de datos PostgreSQL utilizando `npm run typeorm:run`.
  - El esquema de la base de datos refleja correctamente todos los cambios: nuevas tablas, restricciones de clave foránea, índices y claves primarias.
  - La prueba de reversión es posible (`npm run typeorm:revert` se ejecuta sin errores).

---

## 🧠 Capa 2: Dominio y Lógica de Negocio (Fase Auto-Probada)

### Tarea 2.1: Implementar la Capa de Caché para RBAC
- **Descripción:** Implementar un `CacheService` en memoria para almacenar en caché los permisos de los usuarios y evitar consultas SQL redundantes para las comprobaciones de autorización. Diseñarlo de manera que pueda actualizarse fácilmente a Redis en el futuro.
- **Archivos a crear/modificar:**
  - [NEW] [cache.service.ts](file:///c:/Users/fedel/NestJs/vyma_backend/src/common/services/cache.service.ts)
  - [NEW] [cache.service.spec.ts](file:///c:/Users/fedel/NestJs/vyma_backend/src/common/services/cache.service.spec.ts)
  - [MODIFY] [common.module.ts](file:///c:/Users/fedel/NestJs/vyma_backend/src/common/common.module.ts)
- **Criterios de Aceptación:**
  - `CacheService` admite los siguientes métodos principales:
    - `set<T>(key: string, value: T, ttlSeconds?: number): void`
    - `get<T>(key: string): T | null`
    - `delete(key: string): void`
    - `clear(): void`
  - La implementación en memoria debe manejar correctamente la expiración de la caché (TTL).
  - Registrar el `CacheService` en `CommonModule` y exportarlo para que pueda inyectarse en otros módulos.

### Tarea 2.2: Implementar los Servicios de Roles y Permisos
- **Descripción:** Implementar la lógica de negocio para admitir la gestión de roles y permisos, incluyendo la consulta de los permisos activos de un usuario utilizando caché.
- **Archivos a crear/modificar:**
  - [NEW] [roles.service.ts](file:///c:/Users/fedel/NestJs/vyma_backend/src/auth/services/roles.service.ts)
  - [NEW] [permissions.service.ts](file:///c:/Users/fedel/NestJs/vyma_backend/src/auth/services/permissions.service.ts)
  - [MODIFY] [auth.module.ts](file:///c:/Users/fedel/NestJs/vyma_backend/src/auth/auth.module.ts)
- **Criterios de Aceptación:**
  - Proporcionar operaciones CRUD para roles y permisos utilizando los repositorios estándar de TypeORM.
  - Implementar un método `getUserPermissions(userId: number): Promise<string[]>` que:
    1. Verifique si los permisos están almacenados en caché usando la clave `permissions_user_${userId}`.
    2. Si están en caché, devuelva el array de acciones (strings) inmediatamente.
    3. Si no están en caché (cache miss), consulte la base de datos para obtener el rol del usuario y las acciones de permisos asociadas.
    4. Guarde en el `CacheService` los permisos recuperados y los devuelva.
  - Registrar y exportar los servicios en `AuthModule`.

### Tarea 2.3: Implementar el Seeder de la Base de Datos para Roles y Permisos
- **Descripción:** Implementar o actualizar la lógica de siembra (seeding) de la base de datos para poblar los roles y permisos por defecto, y asignar roles a los usuarios previamente sembrados.
- **Archivos a crear/modificar:**
  - [MODIFY] [seed.service.ts](file:///c:/Users/fedel/NestJs/vyma_backend/src/seed/seed.service.ts)
- **Criterios de Aceptación:**
  - Definir y sembrar los siguientes permisos:
    - `create:news`, `read:news`, `update:news`, `delete:news`, `read:users`, `write:users`
  - Definir y sembrar los siguientes roles con sus permisos asociados específicos:
    - `admin`: Todos los permisos.
    - `professional`: `create:news`, `read:news`, `update:news`.
    - `client`: `read:news`.
  - Actualizar automáticamente los usuarios sembrados existentes para que se vinculen a sus correspondientes entidades de rol.
  - Truncar las tablas existentes o implementar comprobaciones para evitar errores de registros duplicados.

### Tarea 2.4: Escribir Pruebas Unitarias de los Servicios
- **Descripción:** Escribir pruebas unitarias exhaustivas para asegurar las reglas de negocio correctas, el comportamiento de la caché y la recuperación de datos en los servicios.
- **Archivos a crear/modificar:**
  - [NEW] [cache.service.spec.ts](file:///c:/Users/fedel/NestJs/vyma_backend/src/common/services/cache.service.spec.ts)
  - [NEW] [roles.service.spec.ts](file:///c:/Users/fedel/NestJs/vyma_backend/src/auth/services/roles.service.spec.ts)
  - [NEW] [permissions.service.spec.ts](file:///c:/Users/fedel/NestJs/vyma_backend/src/auth/services/permissions.service.spec.ts)
  - [MODIFY] [auth.service.spec.ts](file:///c:/Users/fedel/NestJs/vyma_backend/src/auth/auth.service.spec.ts)
- **Criterios de Aceptación:**
  - Verificar que `CacheService` guarda, recupera y expira las entradas correctamente.
  - Simular (mock) las dependencias del repositorio y de la caché para garantizar que las pruebas se ejecuten de forma aislada.
  - Verificar que `getUserPermissions(userId)` realiza una consulta a la base de datos en caso de fallo de caché (Cache Miss), almacena el resultado en la caché y lee de la caché en las llamadas subsiguientes.
  - Las pruebas se ejecutan correctamente y pasan con `npm run test`.

---

## 🔌 Capa 3: API y Controladores (Fase Auto-Probada)

### Tarea 3.1: Crear DTOs de Entrada y Salida
- **Descripción:** Crear DTOs para analizar y validar los datos de las solicitudes entrantes para Roles y Permisos.
- **Archivos a crear/modificar:**
  - [NEW] `src/auth/dto/create-role.dto.ts`
  - [NEW] `src/auth/dto/update-role.dto.ts`
  - [NEW] `src/auth/dto/create-permission.dto.ts`
  - [NEW] `src/auth/dto/assign-role.dto.ts`
- **Criterios de Aceptación:**
  - Decorar los DTOs con reglas de validación de `class-validator` (por ejemplo, `@IsString()`, `@IsNotEmpty()`, `@IsArray()`, `@ArrayUnique()`).
  - Las propiedades de los DTOs están completamente tipadas.

### Tarea 3.2: Crear Controladores para la API de Roles y Permisos
- **Descripción:** Crear controladores de API administrativos para exponer los endpoints de gestión de roles y permisos.
- **Archivos a crear/modificar:**
  - [NEW] `src/auth/controllers/roles.controller.ts`
  - [NEW] `src/auth/controllers/permissions.controller.ts`
  - [MODIFY] [auth.module.ts](file:///c:/Users/fedel/NestJs/vyma_backend/src/auth/auth.module.ts)
- **Criterios de Aceptación:**
  - Exponer los siguientes endpoints:
    - `GET /api/v1/roles` -> Devuelve todos los roles con sus permisos asociados.
    - `POST /api/v1/roles` -> Crea un nuevo rol.
    - `PUT /api/v1/roles/:id` -> Actualiza un rol y sus permisos asociados.
    - `GET /api/v1/permissions` -> Devuelve todos los permisos disponibles.
  - Proteger todos los endpoints administrativos utilizando los mecanismos de autorización estándar (por ejemplo, JWT Auth Guard + Comprobación de Rol/Permiso).

### Tarea 3.3: Implementar el Decorador RequirePermissions y PermissionsGuard
- **Descripción:** Crear el decorador de metadatos `@RequirePermissions` y un `PermissionsGuard` para interceptar las solicitudes y validar los permisos de forma dinámica contra la caché.
- **Archivos a crear/modificar:**
  - [NEW] [require-permissions.decorator.ts](file:///c:/Users/fedel/NestJs/vyma_backend/src/auth/decorators/require-permissions.decorator.ts)
  - [NEW] [permissions.guard.ts](file:///c:/Users/fedel/NestJs/vyma_backend/src/auth/guards/permissions.guard.ts)
- **Criterios de Aceptación:**
  - `@RequirePermissions(...permissions: string[])` define los metadatos de `permissions` en los manejadores de rutas.
  - `PermissionsGuard` resuelve los permisos requeridos a partir de los metadatos.
  - Obtiene `req.user` de la solicitud. Si no existe, lanza una `UnauthorizedException`.
  - Consulta `getUserPermissions(userId)` a través de `AuthService` o `RolesService`.
  - Comprueba si el usuario tiene todos los permisos requeridos. Si no es así, lanza una `ForbiddenException`.

### Tarea 3.4: Integrar y Actualizar la Estrategia JWT de Autenticación
- **Descripción:** Actualizar el flujo de trabajo de autenticación para adaptarse al nuevo campo de relación `role_id` y asegurar que `JwtStrategy` siga siendo ligera (conteniendo solo el ID del usuario en el payload del JWT).
- **Archivos a crear/modificar:**
  - [MODIFY] [jwt.strategy.ts](file:///c:/Users/fedel/NestJs/vyma_backend/src/auth/strategies/jwt.strategy.ts)
  - [MODIFY] [user-role.guard.ts](file:///c:/Users/fedel/NestJs/vyma_backend/src/auth/guards/user-role.guard.ts)
- **Criterios de Aceptación:**
  - `JwtStrategy.validate` recupera al usuario con la relación `role` precargada.
  - Refactorizar o marcar como obsoleta la clase `UserRoleGuard` para realizar la validación contra el valor dinámico `User.role.name` de la base de datos en lugar del enum estático, o animar a la transición completa a `PermissionsGuard`.

### Tarea 3.5: Escribir Pruebas Unitarias de Controladores y Guards
- **Descripción:** Escribir pruebas unitarias para verificar el manejo correcto de las solicitudes, la validación, el mapeo de metadatos y la autorización de acceso.
- **Archivos a crear/modificar:**
  - [NEW] `src/auth/controllers/roles.controller.spec.ts`
  - [NEW] `src/auth/controllers/permissions.controller.spec.ts`
  - [NEW] [permissions.guard.spec.ts](file:///c:/Users/fedel/NestJs/vyma_backend/src/auth/guards/permissions.guard.spec.ts)
- **Criterios de Aceptación:**
  - Simular las dependencias del controlador y verificar que se devuelvan las respuestas de servicio correctas.
  - Probar `PermissionsGuard` para asegurar que deniega el acceso (devuelve `false` o lanza una `ForbiddenException`) cuando faltan permisos, y otorga el acceso (devuelve `true`) cuando están presentes los permisos requeridos.
  - Todas las pruebas se ejecutan y pasan con `npm run test`.

---

## 📡 Capa 4: Eventos, Integraciones y Flujos Secundarios (Fase Auto-Probada)

### Tarea 4.1: Implementar la Revocación de Caché en las Actualizaciones de Roles/Permisos
- **Descripción:** El RBAC dinámico requiere la revocación inmediata de los permisos almacenados en caché cuando se modifica un rol, o cuando cambia el rol de un usuario. Emitir eventos para borrar las cachés de los usuarios objetivo.
- **Archivos a crear/modificar:**
  - [NEW] `src/auth/events/role-updated.event.ts`
  - [NEW] `src/auth/listeners/role-cache.listener.ts`
  - [MODIFY] [auth.module.ts](file:///c:/Users/fedel/NestJs/vyma_backend/src/auth/auth.module.ts)
- **Criterios de Aceptación:**
  - Cuando se llame a `PUT /api/v1/roles/:id` para actualizar los permisos, emitir un `RoleUpdatedEvent` utilizando `@nestjs/event-emitter`.
  - `RoleCacheListener` captura el evento, recupera todos los IDs de usuario que coincidan con ese rol, y llama a `CacheService.delete(permissions_user_${userId})` para invalidar sus entradas de caché.
  - Asegura que los cambios se apliquen instantáneamente en la próxima llamada a la API sin obligar a los usuarios a volver a iniciar sesión.
  - El procesamiento se ejecuta de forma asíncrona y fluida.

### Tarea 4.2: Escribir Pruebas Unitarias de Event Listeners
- **Descripción:** Verificar que la invalidación de la caché se active con los eventos de rol.
- **Archivos a crear/modificar:**
  - [NEW] `src/auth/listeners/role-cache.listener.spec.ts`
- **Criterios de Aceptación:**
  - Simular `CacheService` y verificar que el listener invoque con éxito el método `delete` para todos los usuarios afectados cuando se gestiona un evento de actualización de rol.

---

## 🧪 Capa 5: Verificación Manual E2E y API

### Tarea 5.1: Probar Endpoints Localmente
- **Descripción:** Realizar pruebas manuales para confirmar el correcto funcionamiento del sistema dinámico de RBAC y caché.
- **Criterios de Aceptación:**
  - Ejecutar `POST /api/v1/seed` (o el comando seed) para construir las tablas iniciales y pre-poblar los roles y permisos.
  - Registrarse o iniciar sesión como usuarios con diferentes roles: `admin`, `professional`, y `client`.
  - Enviar solicitudes a los endpoints protegidos con `@RequirePermissions('create:news')`.
    - Verificar que a `admin` y `professional` se les permita el acceso (respuesta HTTP 2xx).
    - Verificar que a `client` se le deniegue el acceso (403 Forbidden).
  - Actualizar los permisos del rol `professional` usando `PUT /api/v1/roles/:id` para eliminar `create:news`.
  - Volver a verificar inmediatamente: `professional` debe obtener ahora una respuesta `403 Forbidden` sin necesidad de cerrar e iniciar sesión, demostrando que la invalidación de caché funciona.
  - Inspeccionar las tablas de la base de datos PostgreSQL directamente para confirmar que las relaciones y los índices se formaron correctamente.

---

## 🚀 Handoff & Inicialización del Desarrollador
Para iniciar la ejecución de esta especificación con el Desarrollador Experto, ejecuta el siguiente prompt en el chat:

```text
Activa el rol de Desarrollador Experto (`.agents/rules/backend-expert.md`) y el workflow `/develop-feature`.
Tu objetivo es implementar las tareas descritas en el archivo `docs/tasks/002-roles-permissions-tasks.md`.
Comienza leyendo el archivo de tareas y la guía del workflow para estructurar tu plan de desarrollo en `task.md`.
```
