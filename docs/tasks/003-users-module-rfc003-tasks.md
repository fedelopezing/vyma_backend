# Tasks: Refactor Módulo Users — Cumplimiento RFC-003 (RFC-003)

## Status Overview
- [ ] Total Tasks
- [ ] Database & Persistencia
- [ ] Domain & Business Logic (inc. Unit Tests)
- [ ] API & Controllers (inc. Unit Tests)
- [ ] Events & Integrations (inc. Unit Tests)

---

> [!NOTE]
> Este archivo cubre **exclusivamente las brechas del módulo `users`** respecto al RFC-003. Los módulos `auth`, entidades `RefreshToken`/`ActivationToken`, cron de purga, y listener ya están parcialmente implementados. Las tareas aquí apuntan a las deficiencias concretas detectadas en la auditoría del código actual.

---

## 🗄️ Layer 1: Database & Persistencia

### Task 1.1: Crear `UsersRepository` (Repositorio Personalizado)

- **Description:** El `UsersService` actual inyecta `Repository<User>` y `DataSource` directamente, violando la convención de arquitectura (Sección 4.5 de `docs/convencion-arquitectura.md`). Se debe crear un repositorio personalizado `UsersRepository` que encapsule todas las consultas a la tabla `users`, incluyendo los métodos actuales de `UsersService`: `findOneByEmailForLogin`, `findOneById`, `findOneWithPermissions`, `findUsersByRoleId`, y la creación transaccional del usuario.
- **Files to create/modify:**
  - `src/users/repositories/users.repository.ts` ← **[NEW]**
- **Acceptance Criteria:**
  - La clase `UsersRepository` es `@Injectable()` y recibe `@InjectRepository(User)` y `DataSource` en su constructor.
  - Expone los métodos: `create(dto, manager?)`, `findOneByEmailForLogin(email)`, `findOneById(id)`, `findOneWithPermissions(id)`, `findUsersByRoleId(roleId)`.
  - Tipado estricto: cero uso de `any`. Todos los métodos tienen retorno explícito tipado.
  - Registrar `UsersRepository` en `providers` de `UsersModule`.

---

## 🧠 Layer 2: Domain & Business Logic (Self-Tested Phase)

### Task 2.1: Refactorizar `UsersService` para usar `UsersRepository`

- **Description:** Eliminar las inyecciones directas de `@InjectRepository(User)` y `DataSource` del `UsersService`. Reemplazarlas con `UsersRepository`. El servicio solo debe contener lógica de negocio: coordinar la creación, hashear la contraseña, llamar al `ActivationTokensService` y emitir el evento. El flujo `runInTransaction` se mueve al repositorio.
- **Files to create/modify:**
  - `src/users/users.service.ts`
- **Acceptance Criteria:**
  - `UsersService` no importa ni usa `@InjectRepository`, `Repository<User>`, ni `DataSource`.
  - El flujo `Controller ➔ Service ➔ Repository` se cumple estrictamente.
  - La lógica transaccional reside en `UsersRepository.create()`.
  - Tipado estricto: cero uso de `any`.

### Task 2.2: Agregar manejo de errores de base de datos en `UsersService`

- **Description:** El servicio actualmente no captura el error de PostgreSQL `23505` (clave duplicada) que ocurre al intentar crear un usuario con un email ya registrado. Se debe capturar este error en el servicio (o repositorio) y mapearlo a una `ConflictException` de NestJS con un mensaje descriptivo, siguiendo la regla 4.3 de `docs/convencion-arquitectura.md`.
- **Files to create/modify:**
  - `src/users/repositories/users.repository.ts`
- **Acceptance Criteria:**
  - Si se inserta un email duplicado, el sistema retorna HTTP 409 Conflict con `{ message: 'A user with this email already exists' }`.
  - El error nativo de TypeORM/PostgreSQL nunca llega directamente al cliente.

### Task 2.3: Actualizar `UsersService` Unit Tests

- **Description:** El `users.service.spec.ts` actual solo prueba el camino feliz de `create()` cuando se provee un `manager` externo. Es necesario reescribir las pruebas para usar el nuevo `UsersRepository` (en lugar de `DataSource` y `Repository<User>`) y agregar los casos de borde faltantes.
- **Files to create/modify:**
  - `src/users/users.service.spec.ts`
- **Acceptance Criteria:**
  - Mockear `UsersRepository` (no `DataSource` ni `Repository<User>` directamente).
  - Casos de prueba requeridos:
    - ✅ `create()` exitoso: usuario creado con `isActive: false`, token generado, evento emitido.
    - ✅ `create()` con email duplicado: lanza `ConflictException`.
    - ✅ `findOneByEmailForLogin()` retorna usuario cuando existe.
    - ✅ `findOneByEmailForLogin()` retorna `null` cuando no existe.
    - ✅ `findOneById()` retorna usuario cuando existe.
    - ✅ `findOneWithPermissions()` retorna usuario con relaciones.
  - Cero uso de `any` en los mocks y las aserciones.
  - Todas las pruebas pasan con `npm run test`.

### Task 2.4: Crear Unit Tests para `ActivationTokensService`

- **Description:** Actualmente no existe un archivo de pruebas para `ActivationTokensService`. Se debe crear `activation-tokens.service.spec.ts` cubriendo los tres métodos públicos.
- **Files to create/modify:**
  - `src/users/activation-tokens.service.spec.ts` ← **[NEW]**
- **Acceptance Criteria:**
  - Casos de prueba requeridos:
    - ✅ `createToken()`: genera y guarda un token hasheado con fecha de expiración a 24h.
    - ✅ `findActiveToken()`: retorna el token cuando `isUsed: false`.
    - ✅ `findActiveToken()`: retorna `null` cuando el token está usado o no existe.
    - ✅ `markAsUsed()`: llama a `repo.update()` con `{ isUsed: true }`.
  - Usar `@golevelup/ts-jest`'s `createMock<Repository<ActivationToken>>()` para mockear el repositorio.
  - Todas las pruebas pasan con `npm run test`.

---

## 🔌 Layer 3: API & Controllers (Self-Tested Phase)

### Task 3.1: Agregar `@ApiProperty()` al `CreateUserDto` y crear `index.ts`

- **Description:** El `CreateUserDto` actual no tiene decoradores `@ApiProperty()` de Swagger, violando la regla 4.2 de la convención de arquitectura. Adicionalmente, falta el archivo `index.ts` en la carpeta `dto/` para exportaciones limpias.
- **Files to create/modify:**
  - `src/users/dto/create-user.dto.ts`
  - `src/users/dto/index.ts` ← **[NEW]**
- **Acceptance Criteria:**
  - Cada propiedad de `CreateUserDto` tiene `@ApiProperty()` con `description` y `example` representativos.
  - El archivo `src/users/dto/index.ts` exporta `CreateUserDto`.
  - El `UsersController` actualiza su importación para usar el barrel `index.ts`.

### Task 3.2: Documentar `UsersController` con Swagger

- **Description:** El `UsersController` actual no tiene `@ApiTags()` ni documentación de endpoints. El endpoint `POST /users` tampoco expone sus guards/permisos en el contrato Swagger. Se debe documentar completamente.
- **Files to create/modify:**
  - `src/users/users.controller.ts`
- **Acceptance Criteria:**
  - Controller decorado con `@ApiTags('Users')`.
  - Endpoint `POST /users` decorado con:
    - `@ApiOperation({ summary: 'Create a new user (admin only)' })`
    - `@ApiBearerAuth()` para indicar que requiere token.
    - `@ApiResponse({ status: 201, description: 'User created and activation email sent' })`
    - `@ApiResponse({ status: 409, description: 'Email already in use' })`
    - `@ApiResponse({ status: 403, description: 'Insufficient permissions' })`
  - La respuesta del endpoint sigue el contrato definido en la **Sección 3.1 del RFC-003** (incluye `uuid`, `name`, `email`, `isActive`, `role`, `createdAt`).

### Task 3.3: Actualizar `UsersController` Unit Tests

- **Description:** El `users.controller.spec.ts` actual solo prueba el caso exitoso básico. Faltan pruebas de respuesta de conflicto (409) y la verificación de que los campos de respuesta del controlador sean exactamente los requeridos por el RFC-003.
- **Files to create/modify:**
  - `src/users/users.controller.spec.ts`
- **Acceptance Criteria:**
  - Casos de prueba requeridos:
    - ✅ `create()` exitoso: verifica que la respuesta mapea correctamente `{ uuid, name, email, isActive, role, createdAt }`.
    - ✅ `create()` con email duplicado: el mock del servicio lanza `ConflictException` y el controlador lo propaga correctamente.
  - No usar `Partial<UsersService>` como tipo del mock; usar `createMock<UsersService>()` de `@golevelup/ts-jest`.
  - Eliminar el mock innecesario de `RolesService` del módulo de testing.
  - Todas las pruebas pasan con `npm run test`.

---

## 📡 Layer 4: Events, Integrations & Secondary Flows (Self-Tested Phase)

### Task 4.1: Crear Unit Tests para `UserCreatedListener`

- **Description:** El listener `src/users/listeners/user-created.listener.ts` existe pero no tiene pruebas unitarias. Se debe crear el spec file correspondiente, mockeando `EmailService`.
- **Files to create/modify:**
  - `src/users/listeners/user-created.listener.spec.ts` ← **[NEW]**
- **Acceptance Criteria:**
  - Usar `Test.createTestingModule()` de `@nestjs/testing`.
  - Mockear `EmailService` con `createMock<EmailService>()`.
  - Casos de prueba requeridos:
    - ✅ `handleUserCreatedEvent()`: llama a `emailService.sendActivationEmail()` con los parámetros correctos (`user.email`, `user.name`, `activationToken`).
    - ✅ `handleUserCreatedEvent()`: si `emailService.sendActivationEmail()` lanza un error, el listener lo captura sin relanzar la excepción (flujo principal no se interrumpe).
  - Todas las pruebas pasan con `npm run test`.

---

## 🧪 Layer 5: Manual E2E & API Verification

### Task 5.1: Verificar Endpoints Localmente

- **Description:** Ejecutar los flujos de creación de usuario end-to-end contra el servidor local corriendo con `npm run start:dev`.
- **Acceptance Criteria:**
  - `POST /api/v1/users` con cuerpo `{ name, email, roleId }` válido y token de admin retorna HTTP 201 con `{ uuid, name, email, isActive: false, role, createdAt }`.
  - `POST /api/v1/users` con email duplicado retorna HTTP 409 `{ message: 'A user with this email already exists' }`.
  - `POST /api/v1/users` sin token retorna HTTP 401.
  - `POST /api/v1/users` con token de rol `client` o `ccps` retorna HTTP 403.
  - Verificar en la tabla `activation_tokens` de PostgreSQL que se generó el token correspondiente para el usuario creado.
  - El endpoint aparece correctamente documentado en Swagger: `http://localhost:3100/api/v1/docs`.
