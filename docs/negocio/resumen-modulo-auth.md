# Resumen Ejecutivo: Módulo de Autenticación y Autorización (Auth)

Este documento detalla el propósito de negocio, la arquitectura técnica y el comportamiento del módulo `auth` en el sistema.

---

## 1. Propósito de Negocio

El módulo `auth` centraliza la seguridad de la aplicación, controlando quién puede ingresar al sistema (Autenticación) y qué acciones tiene permitido realizar dentro de él (Autorización). Sus responsabilidades principales son:
* **Activación de Cuentas:** Permite a usuarios nuevos establecer su contraseña mediante un enlace y token seguro.
* **Ciclo de Sesión:** Gestión de inicio de sesión, renovación de credenciales en segundo plano (tokens de refresco) y cierre de sesión seguro.
* **Seguridad y Control de Acceso:** Restricción de endpoints basada en permisos dinámicos y roles.

---

## 2. Flujo de Entrada (Endpoints y API)

El controlador expone endpoints bajo `POST /auth`:
1. `/activate` (Público): Recibe un token temporal y una nueva contraseña para habilitar al usuario.
2. `/login` (Público): Valida correo y contraseña. Implementa limitación de tasa (rate limiting) a máximo 5 intentos por minuto. Su comportamiento varía según las membresías del usuario:
   * **Caso A (Una Empresa):** Si el usuario pertenece a una sola empresa, emite directamente el par de tokens (`accessToken` y `refreshToken`) con el contexto de la empresa.
   * **Caso B (Múltiples Empresas):** Si pertenece a 2 o más empresas, devuelve un objeto indicando `{ requiresCompanySelection: true, selectionToken, companies }`.
3. `/select-company` (Público, con token temporal): Recibe el `companyUuid` en el cuerpo y el `selectionToken` en la cabecera. Valida la membresía y emite el par de tokens definitivo.
4. `/refresh` (Público): Permite obtener un nuevo par de tokens usando el Refresh Token antes de que la sesión expire.
5. `/logout` (Protegido por JWT): Revoca manualmente el Refresh Token del usuario invalidando su sesión activa.

---

## 3. Elementos de Seguridad (Guards, Decorators y Strategies)

La validación y seguridad de accesos se realiza a través de las siguientes piezas:
*   **`JwtStrategy` (Passport):** Intercepta la cabecera `Authorization: Bearer <token>` de las peticiones HTTP y extrae el payload. Inyecta en `req.user` las propiedades: `sub` (userId), `uuid` (userUuid), `email`, `role` (dentro de la empresa activa), `companyId` (contexto activo), `companyUuid` e `isSuperAdmin`.
*   **`TenantGuard`:** Guard complementario aplicado en controladores de negocio. Asegura que el `companyId` del token JWT corresponda a una membresía activa del usuario (a menos que el usuario sea `isSuperAdmin`).
*   **`PermissionsGuard` & `@RequirePermissions`:** Es el mecanismo de autorización recomendado. Evalúa dinámicamente si el usuario autenticado tiene asignados los permisos necesarios para ejecutar la acción solicitada.
*   **`UserRoleGuard` (Deprecado):** Realizaba validaciones estáticas basadas en nombres de rol rígidos. Ha sido sustituido por el modelo de permisos dinámicos.

---

## 4. Lógica Asíncrona e Integración (Events, Listeners y Cron)

Para mantener la aplicación desacoplada y el rendimiento óptimo, el módulo implementa las siguientes tareas asíncronas:

### Eventos y Listeners (Desacoplamiento de Negocio)
* **`RoleUpdatedEvent` (Evento):** Contiene el `roleId` que ha sido modificado en el sistema.
* **`RoleCacheListener` (Escuchador):** Reacciona al evento `role.updated`. Cuando los permisos de un rol cambian, este listener identifica a todos los usuarios con ese rol e invalida de forma inmediata sus permisos cacheados (`delete(AuthCacheKeys.userPermissions(userId))`). Esto asegura que los cambios en permisos se apliquen en tiempo real sin necesidad de reiniciar la sesión del usuario.
* **`UserCreatedEvent` (Evento):** Contiene los metadatos de creación de usuario (`userId`, `professionId`), emitido para disparar procesos secundarios (por ejemplo, creación automática de perfiles).

### Tareas Programadas (Cron Jobs)
* **`TokenCleanupCron`:** Se ejecuta de forma programada **todos los días a la medianoche** (`0 0 * * *`). 
  * Su función es eliminar físicamente de la base de datos todos los tokens de refresco (`RefreshToken`) y tokens de activación (`ActivationToken`) que hayan expirado, evitando el crecimiento desmedido de almacenamiento residual en la base de datos.
