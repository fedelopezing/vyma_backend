# Tasks: Arquitectura Multi-Tenant por Empresa (RFC-004)

## Status Overview
- [ ] Total Tasks: 38
- [x] Layer 0: Refactor de Roles Globales & Seed Data
- [x] Layer 1: Database & Persistencia (Módulo `companies` + Entidades modificadas)
- [x] Layer 2: Domain & Business Logic — `CompaniesService` + `UserCompanyRepository` (inc. Unit Tests)
- [ ] Layer 3: API & Controllers — `CompaniesController` (inc. Unit Tests)
- [ ] Layer 4: Auth Refactor — Login Multi-Tenant + `SelectCompany` (inc. Unit Tests)
- [ ] Layer 5: `TenantGuard` + Actualización Servicios de Negocio (inc. Unit Tests)
- [ ] Layer 6: E2E & Verificación Manual

---

## 🏗️ Layer 0: Refactor de Roles Globales & Seed Data

### Task 0.1: Refactor de Enum `ValidRoles`
- **Descripción:** Actualizar el enum global de roles para reflejar que `ccps` pasa a ser una empresa y se incorpora el rol `manager`.
- **Archivos a modificar:**
  - `src/auth/interfaces/valid-roles.ts`
- **Criterios de Aceptación:**
  - Eliminar el rol `ccps`.
  - Agregar el rol `manager`.
  - Los roles finales deben ser: `admin`, `manager`, `client`, `professional`, `user`.

### Task 0.2: Actualizar Seed Data de Roles
- **Descripción:** Actualizar la configuración inicial del seeder para alinearse con los roles del sistema.
- **Archivos a modificar:**
  - `src/seed/data/roles.seed-data.ts`
- **Criterios de Aceptación:**
  - En `SEED_ROLES_CONFIG`, eliminar el objeto con `name: ValidRoles.ccps`.
  - Agregar un nuevo objeto para `name: ValidRoles.manager`, asignándole los permisos combinados (`[...BASIC_PERMS, ...NEWS_PERMS]`).

### Task 0.3: Crear Seed Data Inicial de Empresas
- **Descripción:** Crear la información predeterminada de empresas (tenants iniciales) que será inyectada en la BD.
- **Archivos a crear:**
  - `src/seed/data/companies.seed-data.ts`
- **Criterios de Aceptación:**
  - Exportar una constante `SEED_COMPANIES` (array de objetos).
  - Incluir 3 empresas obligatorias:
    1. "CCPS, Cámara de Comercio Paraguayo Suiza" (taxId: '80001234-5', email: 'contacto@ccps.org.py')
    2. "Biolimpieza SRL" (taxId: '80054321-0', email: 'info@biolimpieza.com')
    3. "NatyNails" (taxId: '1234567-8', email: 'reservas@natynails.com')
  - Todas con `isActive: true`.

---

## 🗄️ Layer 1: Database & Persistencia

### Task 1.1: Crear Entidad `Company`
- **Descripción:** Crear la entidad TypeORM `Company` exactamente como está definida en el RFC-004 §2.1.
- **Archivos a crear:**
  - `src/companies/entities/company.entity.ts`
- **Criterios de Aceptación:**
  - `@Entity('companies')` con `id` bigint auto-incremental y `uuid` generado automáticamente con `@Index({ unique: true })`.
  - Columnas: `name` (varchar 255, NOT NULL), `taxId` (varchar 50, nullable), `email` (varchar 100, nullable), `phone` (varchar 20, nullable), `isActive` (boolean, default `true`).
  - Relación `@OneToMany(() => UserCompany, uc => uc.company)` llamada `memberships`.
  - `@CreateDateColumn` y `@UpdateDateColumn`.
  - Cero uso de `any`. Tipado estricto.

### Task 1.2: Crear Entidad Pivot `UserCompany`
- **Descripción:** Crear la entidad `UserCompany` que representa la membresía M:N entre `User` y `Company` con rol por empresa, tal como se define en el RFC-004 §2.2.
- **Archivos a crear:**
  - `src/companies/entities/user-company.entity.ts`
- **Criterios de Aceptación:**
  - `@Entity('user_companies')` con índice compuesto único `@Index(['userId', 'companyId'], { unique: true })`.
  - Columnas: `userId`, `companyId`, `roleId`, `isActive` (boolean, default `true`).
  - Relaciones `@ManyToOne` hacia `User`, `Company` y `Role` con `@JoinColumn` explícito.
  - `@Index()` individual en `userId` y `companyId`.
  - `@CreateDateColumn`.

### Task 1.3: Modificar Entidad `User` — Agregar `isSuperAdmin` y `memberships`
- **Descripción:** Agregar los dos campos nuevos al `User` según RFC-004 §2.3. **NO eliminar** la relación de `role` existente para no romper guards actuales.
- **Archivos a modificar:**
  - `src/users/entities/user.entity.ts`
- **Criterios de Aceptación:**
  - Campo `isSuperAdmin: boolean` con `@Column('boolean', { default: false, comment: '...' })`.
  - Relación `@OneToMany(() => UserCompany, uc => uc.user)` llamada `memberships`.
  - La relación `role` preexistente se mantiene intacta.
  - Importar `UserCompany` correctamente (sin circular dependency — usar lazy loading si es necesario).

### Task 1.4: Agregar `companyId` a Entidades de Negocio
- **Descripción:** Aplicar el patrón de RFC-004 §2.4 a las 5 entidades de negocio listadas. Usar el patrón de columna + índice + relación `ManyToOne`.
- **Archivos a modificar:**
  - `src/news/entities/news.entity.ts`
  - `src/schedules/entities/schedule.entity.ts`
  - `src/schedule-breaks/entities/schedule-break.entity.ts`
  - `src/services/entities/service.entity.ts`
  - `src/professions/entities/profession.entity.ts`
- **Criterios de Aceptación:**
  - Cada entidad agrega `@Column({ name: 'company_id' }) @Index() companyId: number`.
  - Cada entidad agrega `@ManyToOne(() => Company, { nullable: false, onDelete: 'CASCADE' }) @JoinColumn({ name: 'company_id' }) company: Company`.
  - Importar `Company` desde `../../companies/entities/company.entity`.

### Task 1.5: Generar y Editar Migración de Base de Datos
- **Descripción:** Generar la migración automática con TypeORM y editarla para incluir el **backfill crítico** de datos existentes. Seguir estrictamente el patrón del RFC-004 §4.4.
- **Archivos a crear/modificar:**
  - `src/database/migrations/<timestamp>-AddMultiTenantCompanies.ts`
- **Pasos:**
  1. Ejecutar `npm run typeorm:generate -- --name AddMultiTenantCompanies` para generar la migración base.
  2. Editar manualmente el método `up()` para agregar el backfill antes de poner `NOT NULL`:
     ```sql
     -- Para news, schedules, schedule_breaks, services, professions:
     ALTER TABLE "tabla" ADD "company_id" bigint NULL;
     UPDATE "tabla" SET "company_id" = 1;
     ALTER TABLE "tabla" ALTER COLUMN "company_id" SET NOT NULL;
     CREATE INDEX "IDX_tabla_company_id" ON "tabla" ("company_id");
     ```
  3. Implementar el método `down()` completo para rollback.
  4. Ejecutar `npm run typeorm:run` y verificar que no haya errores.
- **Criterios de Aceptación:**
  - La migración corre exitosamente en entorno local.
  - El esquema de BD coincide con las entidades TypeORM.
  - El método `down()` revierte correctamente todos los cambios.
  - Ninguna migración usa `synchronize: true`.

### Task 1.6: Crear `CompaniesModule` y Registrar Entidades
- **Descripción:** Crear el módulo NestJS `CompaniesModule` que registra las entidades, repositorios y exporta lo necesario para otros módulos.
- **Archivos a crear:**
  - `src/companies/companies.module.ts`
- **Criterios de Aceptación:**
  - `TypeOrmModule.forFeature([Company, UserCompany])` incluido.
  - Proveedores: `CompaniesRepository`, `UserCompanyRepository`, `CompaniesService`.
  - Controlador: `CompaniesController`.
  - Exports: `CompaniesService`, `UserCompanyRepository` (necesario para `TenantGuard` y `AuthService`).
  - Importar `CompaniesModule` en `src/app.module.ts`.

---

## 🧠 Layer 2: Domain & Business Logic (Self-Tested Phase)

### Task 2.1: Crear `CompaniesRepository`
- **Descripción:** Repositorio personalizado para encapsular todas las consultas TypeORM de la entidad `Company`. Flujo obligatorio: `Controller → Service → Repository`.
- **Archivos a crear:**
  - `src/companies/repositories/companies.repository.ts`
- **Criterios de Aceptación:**
  - Clase `CompaniesRepository` inyectable (`@Injectable()`).
  - Inyecta `@InjectRepository(Company)` en el constructor.
  - Métodos mínimos: `create(data)`, `findAll()`, `findByUuid(uuid)`, `findById(id)`, `update(id, data)`.
  - Tipado explícito de retornos. Cero `any`.

### Task 2.2: Crear `UserCompanyRepository`
- **Descripción:** Repositorio personalizado para operaciones de membresía (`user_companies`). Crítico para el `TenantGuard` y el flujo de login.
- **Archivos a crear:**
  - `src/companies/repositories/user-company.repository.ts`
- **Criterios de Aceptación:**
  - Clase `UserCompanyRepository` inyectable.
  - Inyecta `@InjectRepository(UserCompany)`.
  - Métodos mínimos:
    - `findMembershipsByUserId(userId: number): Promise<UserCompany[]>` — carga `company` y `role` con JOIN.
    - `isActiveMember(userId: number, companyId: number): Promise<boolean>` — usado por `TenantGuard`.
    - `addMember(userId: number, companyId: number, roleId: number): Promise<UserCompany>`
    - `removeMember(userId: number, companyId: number): Promise<void>`
  - Todos los métodos tipados explícitamente. Cero `any`.

### Task 2.3: Crear Excepciones del Módulo `companies`
- **Descripción:** Crear las excepciones de negocio específicas en archivos individuales, heredando de las excepciones HTTP de NestJS.
- **Archivos a crear:**
  - `src/companies/exceptions/company-not-found.exception.ts` → extiende `NotFoundException`
  - `src/companies/exceptions/member-already-exists.exception.ts` → extiende `ConflictException`
- **Criterios de Aceptación:**
  - Cada excepción tiene su propio archivo (nombrado en `kebab-case` con sufijo `.exception.ts`).
  - El mensaje de error es descriptivo y en inglés (ej: `'Company not found'`).
  - No lanzar `new Error()` genérico en ningún servicio.

### Task 2.4: Implementar `CompaniesService`
- **Descripción:** Servicio de negocio para gestión de empresas y membresías. No debe contener lógica de TypeORM directa — solo llama a los repositorios.
- **Archivos a crear:**
  - `src/companies/companies.service.ts`
- **Métodos a implement:**
  - `create(dto: CreateCompanyDto): Promise<Company>`
  - `findAll(): Promise<Company[]>`
  - `findByUuid(uuid: string): Promise<Company>` → lanza `CompanyNotFoundException` si no existe.
  - `update(uuid: string, dto: UpdateCompanyDto): Promise<Company>`
  - `addMember(companyUuid: string, dto: AddMemberDto): Promise<UserCompany>` → lanza `MemberAlreadyExistsException` si el par ya existe (capturar error PG `23505`).
  - `removeMember(companyUuid: string, userUuid: string): Promise<void>`
- **Criterios de Aceptación:**
  - Inyección por constructor de `CompaniesRepository` y `UserCompanyRepository`.
  - Manejo de `ConflictException` para duplicados en `addMember`.
  - Tipado estricto en todos los retornos. Cero `any`.

### Task 2.5: Escribir Tests Unitarios de `CompaniesService`
- **Descripción:** Tests unitarios con `Test.createTestingModule` mockeando `CompaniesRepository` y `UserCompanyRepository`. Seguir el patrón de `test-use-testing-module.md`.
- **Archivos a crear:**
  - `src/companies/companies.service.spec.ts`
- **Criterios de Aceptación:**
  - Usar `jest.Mocked<CompaniesRepository>` y `jest.Mocked<UserCompanyRepository>`.
  - Casos a cubrir:
    - `create`: éxito, creación correcta.
    - `findByUuid`: éxito, lanza `CompanyNotFoundException` cuando no existe.
    - `addMember`: éxito, lanza `MemberAlreadyExistsException` en duplicado (simular error PG `23505`).
    - `removeMember`: éxito.
  - `afterEach(() => jest.clearAllMocks())`.
  - Tests corren y pasan: `jest src/companies/companies.service.spec.ts`.

---

## 🔌 Layer 3: API & Controllers (Self-Tested Phase)

### Task 3.1: Crear DTOs del Módulo `companies`
- **Descripción:** Crear todos los DTOs de entrada y salida del RFC-004 §3.1 con validación completa y documentación Swagger.
- **Archivos a crear:**
  - `src/companies/dto/create-company.dto.ts`
  - `src/companies/dto/update-company.dto.ts` (usar `PartialType(CreateCompanyDto)`)
  - `src/companies/dto/add-member.dto.ts`
  - `src/companies/dto/company-response.dto.ts`
  - `src/companies/dto/index.ts` (re-exportar todos los DTOs)
- **Criterios de Aceptación:**
  - **Cada propiedad** tiene al menos un decorador `class-validator` (`@IsString()`, `@IsUUID()`, `@IsOptional()`, `@IsEmail()`, `@IsInt()`, `@IsPositive()`, `@MaxLength(N)`).
  - **Cada propiedad** tiene `@ApiProperty({ description: '...', example: '...' })` de `@nestjs/swagger`.
  - `UpdateCompanyDto` usa `PartialType` para no duplicar validaciones.
  - El `index.ts` exporta todos los DTOs del módulo.

### Task 3.2: Crear `CompaniesController`
- **Descripción:** Controlador REST que expone los endpoints definidos en el RFC-004 §3.1. Flujo: `Controller → Service`. Sin lógica de negocio en el controlador.
- **Archivos a crear:**
  - `src/companies/companies.controller.ts`
- **Endpoints:**
  | Método | Ruta | Guards | Roles | Status |
  |--------|------|--------|-------|--------|
  | `POST` | `/companies` | `JwtAuthGuard`, `RolesGuard` | `superadmin` | 201 |
  | `GET` | `/companies` | `JwtAuthGuard`, `RolesGuard` | `superadmin` | 200 |
  | `GET` | `/companies/:uuid` | `JwtAuthGuard`, `RolesGuard` | `superadmin`, `admin` | 200 |
  | `PATCH` | `/companies/:uuid` | `JwtAuthGuard`, `RolesGuard` | `superadmin` | 200 |
  | `POST` | `/companies/:uuid/members` | `JwtAuthGuard`, `TenantGuard`, `RolesGuard` | `admin` | 201 |
  | `DELETE` | `/companies/:uuid/members/:userUuid` | `JwtAuthGuard`, `TenantGuard`, `RolesGuard` | `admin` | 200 |
- **Criterios de Aceptación:**
  - Decorado con `@ApiTags('companies')`.
  - Cada endpoint decorado con `@ApiOperation({ summary: '...' })` y `@ApiResponse()`.
  - Usar `@UseGuards(JwtAuthGuard, RolesGuard)` y `@Roles(...)`.
  - El `companyId` **nunca** se lee del body: siempre de `@Req() req.user.companyId`.

### Task 3.3: Escribir Tests Unitarios de `CompaniesController`
- **Descripción:** Tests unitarios del controlador mockeando `CompaniesService` con `Test.createTestingModule`.
- **Archivos a crear:**
  - `src/companies/companies.controller.spec.ts`
- **Criterios de Aceptación:**
  - `jest.Mocked<CompaniesService>` como provider mock.
  - Casos a cubrir:
    - `POST /companies`: delega a `service.create()`, retorna 201.
    - `GET /companies`: delega a `service.findAll()`, retorna array.
    - `GET /companies/:uuid`: delega a `service.findByUuid()`.
    - `POST /companies/:uuid/members`: delega a `service.addMember()`.
    - `DELETE /companies/:uuid/members/:userUuid`: delega a `service.removeMember()`.
  - Tests corren y pasan: `jest src/companies/companies.controller.spec.ts`.

---

## 🔐 Layer 4: Auth Refactor — Login Multi-Tenant (Self-Tested Phase)

### Task 4.1: Actualizar Interfaz `JwtPayload`
- **Descripción:** Agregar los tres nuevos campos al contrato del payload JWT según RFC-004 §2.5.
- **Archivos a modificar:**
  - `src/auth/interfaces/jwt-payload.interface.ts`
- **Criterios de Aceptación:**
  - Nuevas propiedades: `companyId: number`, `companyUuid: string`, `isSuperAdmin: boolean`.
  - Todas las propiedades tipadas estrictamente. Cero `any`.
  - Verificar que `JwtStrategy.validate()` retorne el tipo actualizado.

### Task 4.2: Crear `SelectCompanyDto`
- **Descripción:** DTO para el nuevo endpoint `POST /auth/select-company`.
- **Archivos a crear:**
  - `src/auth/dto/select-company.dto.ts`
- **Criterios de Aceptación:**
  - Propiedad `companyUuid: string` con `@IsUUID()`, `@IsNotEmpty()`, `@ApiProperty()`.

### Task 4.3: Refactorizar `AuthService.login()` para Multi-Tenant
- **Descripción:** Modificar el flujo de login para consultar las membresías del usuario y bifurcar la respuesta según el número de empresas (RFC-004 §3.2).
- **Archivos a modificar:**
  - `src/auth/auth.service.ts`
- **Lógica a implementar:**
  1. Tras validar credenciales, llamar a `UserCompanyRepository.findMembershipsByUserId(userId)`.
  2. Si `memberships.length === 0`: lanzar `UnauthorizedException('User has no company memberships')`.
  3. Si `memberships.length === 1` (Caso A): emitir JWT completo con `companyId` y `companyUuid`.
  4. Si `memberships.length > 1` (Caso B): emitir un `selectionToken` (JWT de 5 min sin `companyId`) y retornar `{ requiresCompanySelection: true, selectionToken, companies: [...] }`.
- **Criterios de Aceptación:**
  - Inyectar `UserCompanyRepository` en el constructor de `AuthService`.
  - El `JwtModule` de auth debe tener acceso a `UserCompanyRepository` (importar `CompaniesModule` en `AuthModule` o usar `forwardRef`).
  - El `companyId` en el JWT siempre proviene de la membresía, nunca del body.

### Task 4.4: Implementar `AuthService.selectCompany()`
- **Descripción:** Método que valida el `selectionToken`, verifica la membresía del usuario en la empresa solicitada y emite el JWT final.
- **Archivos a modificar:**
  - `src/auth/auth.service.ts`
- **Criterios de Aceptación:**
  - Verificar que el `selectionToken` sea válido (usar `JwtService.verify()`).
  - Llamar a `UserCompanyRepository.isActiveMember(userId, companyId)`.
  - Si no es miembro: lanzar `ForbiddenException('User is not a member of the selected company')`.
  - Emitir y retornar el JWT completo con `companyId` y `companyUuid`.

### Task 4.5: Agregar Endpoint `POST /auth/select-company` en `AuthController`
- **Descripción:** Exponer el nuevo endpoint en el controlador de auth.
- **Archivos a modificar:**
  - `src/auth/auth.controller.ts`
- **Criterios de Aceptación:**
  - `@Post('select-company')` con `@Body() dto: SelectCompanyDto`.
  - Rate limit de 10 req/60s (si hay throttler configurado, aplicar `@Throttle`).
  - `@ApiOperation({ summary: 'Select active company from multi-tenant login' })`.
  - `@ApiResponse({ status: 200, description: 'JWT with companyId emitted' })`.

### Task 4.6: Actualizar `JwtStrategy.validate()`
- **Descripción:** Extender el objeto retornado por `validate()` para incluir `companyId`, `companyUuid` e `isSuperAdmin` en `req.user`.
- **Archivos a modificar:**
  - `src/auth/strategies/jwt.strategy.ts`
- **Criterios de Aceptación:**
  - El retorno de `validate()` incluye explícitamente: `{ sub, uuid, email, role, companyId, companyUuid, isSuperAdmin }`.
  - Tipado estricto usando la interfaz `JwtPayload` actualizada. Cero `any`.

### Task 4.7: Escribir Tests Unitarios del Refactor de Auth
- **Descripción:** Tests unitarios del nuevo flujo de login y selección de empresa. Mockear `UserCompanyRepository` con `Test.createTestingModule`.
- **Archivos a crear:**
  - `src/auth/auth.service.spec.ts` (actualizar o crear)
- **Criterios de Aceptación:**
  - Casos a cubrir:
    - `login()` Caso A: usuario con 1 membresía → retorna `{ accessToken, refreshToken }`.
    - `login()` Caso B: usuario con N membresías → retorna `{ requiresCompanySelection: true, selectionToken, companies }`.
    - `login()` sin membresías → lanza `UnauthorizedException`.
    - `selectCompany()`: token válido + membresía activa → retorna JWT completo.
    - `selectCompany()`: usuario no es miembro → lanza `ForbiddenException`.
  - Usar `jest.Mocked<UserCompanyRepository>` como provider mock.
  - Tests corren y pasan: `jest src/auth/auth.service.spec.ts`.

---

## 🛡️ Layer 5: TenantGuard + Actualización de Servicios de Negocio (Self-Tested Phase)

### Task 5.1: Implementar `TenantGuard`
- **Descripción:** Crear el guard de aislamiento multi-tenant en `src/common/guards/` según RFC-004 §3.3.
- **Archivos a crear:**
  - `src/common/guards/tenant.guard.ts`
- **Lógica:**
  1. Extraer `req.user` (ya validado por `JwtAuthGuard` previo).
  2. Si `req.user.isSuperAdmin === true` → `return true` (acceso irrestricto).
  3. Si no → `UserCompanyRepository.isActiveMember(userId, companyId)`.
  4. Si no es miembro → lanzar `ForbiddenException('Access to this company is not allowed')`.
- **Criterios de Aceptación:**
  - Inyectar `UserCompanyRepository` en el constructor del Guard.
  - El guard está en `src/common/guards/` (es reutilizable por múltiples módulos).
  - No mezclar con lógica de `RolesGuard` — son guards separados.

### Task 5.2: Aplicar `TenantGuard` en Controladores de Negocio
- **Descripción:** Agregar `TenantGuard` en todos los controladores que gestionan recursos de negocio sensibles al tenant.
- **Archivos a modificar:**
  - `src/news/news.controller.ts` (o `src/news/controllers/news.controller.ts` según estructura actual)
  - `src/schedules/schedules.controller.ts`
  - (Otros módulos de negocio que existan: `schedule-breaks`, `services`, `professions`)
- **Criterios de Aceptación:**
  - `@UseGuards(JwtAuthGuard, TenantGuard)` en el nivel de controlador (no solo en métodos individuales).
  - `TenantGuard` siempre va **después** de `JwtAuthGuard` en el array.
  - Verificar que `TenantGuard` está provisto globalmente o importado en los módulos que lo usan.

### Task 5.3: Actualizar Servicios de Negocio para Filtrar por `companyId`
- **Descripción:** Modificar los servicios de las entidades de negocio para que todos los métodos reciban y usen `companyId` como filtro obligatorio en los queries.
- **Archivos a modificar:**
  - `src/news/services/news.service.ts`
  - `src/schedules/services/schedules.service.ts`
  - (Otros servicios de negocio existentes)
- **Criterios de Aceptación:**
  - Firma de métodos de listado: `findAll(companyId: number, filters?: FilterDto): Promise<Entity[]>`.
  - El `companyId` se incluye en el `WHERE` de **todos** los queries de búsqueda y listado.
  - El `companyId` **nunca** se lee del body del request. Los controladores lo leen de `req.user.companyId` y lo pasan al servicio como parámetro.
  - Los métodos de creación también persisten el `companyId` del JWT.

### Task 5.4: Actualizar Repositorios de Negocio para Filtrar por `companyId`
- **Descripción:** Asegurar que los repositorios de negocio (`NewsRepository`, `SchedulesRepository`, etc.) incluyan `companyId` como parámetro obligatorio en todos los métodos de consulta.
- **Archivos a modificar:**
  - `src/news/repositories/news.repository.ts`
  - `src/schedules/repositories/schedules.repository.ts`
  - (Otros repositorios de negocio existentes)
- **Criterios de Aceptación:**
  - Todos los `findAll`, `findOne` incluyen `{ where: { companyId } }`.
  - Ningún método retorna datos sin filtrar por `companyId` (salvo métodos explícitamente marcados como `cross-tenant` para superadmin).

### Task 5.5: Escribir Tests Unitarios de `TenantGuard`
- **Descripción:** Tests unitarios del guard con los tres escenarios principales. Usar `Test.createTestingModule` con `ExecutionContext` mockeado.
- **Archivos a crear:**
  - `src/common/guards/tenant.guard.spec.ts`
- **Criterios de Aceptación:**
  - Usar el helper `createMockExecutionContext()` del patrón en `test-use-testing-module.md`.
  - Casos a cubrir:
    - Usuario normal con membresía activa → `canActivate()` retorna `true`.
    - Usuario normal sin membresía en esa empresa → lanza `ForbiddenException`.
    - Usuario `isSuperAdmin: true` → `canActivate()` retorna `true` sin consultar la BD (verificar que `isActiveMember` NO fue llamado).
  - Tests corren y pasan: `jest src/common/guards/tenant.guard.spec.ts`.

### Task 5.6: Escribir Tests Unitarios de Servicios de Negocio con Filtrado por `companyId`
- **Descripción:** Actualizar/crear tests unitarios de `NewsService` y `SchedulesService` para verificar el filtrado por `companyId`.
- **Archivos a crear/modificar:**
  - `src/news/services/news.service.spec.ts`
  - `src/schedules/services/schedules.service.spec.ts`
- **Criterios de Aceptación:**
  - Casos a cubrir:
    - `findAll(companyId)`: verificar que el repositorio fue llamado con `companyId` correcto.
    - `create(dto, companyId)`: verificar que el `companyId` del JWT se persiste en el registro.
  - Mockear repositorios con `jest.Mocked<T>`.
  - Tests corren y pasan.

---

## 🧪 Layer 6: E2E & Verificación Manual

### Task 6.1: E2E — Login Single-Tenant
- **Descripción:** Verificar manualmente el flujo completo de login para un usuario con exactamente 1 membresía.
- **Pasos:**
  1. Crear en BD: 1 empresa + 1 usuario con membresía activa en esa empresa.
  2. `POST /auth/login` con credenciales válidas.
- **Criterios de Aceptación:**
  - Respuesta 200 con `{ accessToken, refreshToken, user: { uuid, name, email, role, company: { uuid, name } } }`.
  - Decodificar el `accessToken`: debe contener `companyId`, `companyUuid`, `isSuperAdmin: false`.

### Task 6.2: E2E — Login Multi-Tenant y Selección de Empresa
- **Descripción:** Verificar el flujo de login para un usuario con más de 1 membresía.
- **Pasos:**
  1. Crear en BD: 2 empresas + 1 usuario con membresía activa en ambas.
  2. `POST /auth/login` → obtener `selectionToken` y lista de `companies`.
  3. `POST /auth/select-company` con `{ companyUuid: "<uuid_empresa_1>" }` y `Authorization: Bearer <selectionToken>`.
- **Criterios de Aceptación:**
  - Login retorna `{ requiresCompanySelection: true, selectionToken, companies: [...] }`.
  - `select-company` retorna `{ accessToken, refreshToken }` con `companyId` de la empresa seleccionada.

### Task 6.3: E2E — Cross-Tenant Access (debe ser 403)
- **Descripción:** Verificar que el `TenantGuard` bloquea correctamente el acceso a recursos de otra empresa.
- **Pasos:**
  1. Obtener JWT con `companyId = 1`.
  2. Intentar hacer `GET /news` con un JWT manipulado que tenga `companyId = 2` (o emitir un token válido de empresa 2 y probar contra recursos de empresa 1).
- **Criterios de Aceptación:**
  - Respuesta `403 Forbidden` con mensaje `'Access to this company is not allowed'`.
  - Los datos de la empresa correcta son retornados normalmente con un JWT válido.

### Task 6.4: E2E — SuperAdmin sin Restricciones
- **Descripción:** Verificar que un usuario con `isSuperAdmin: true` puede acceder a recursos de cualquier empresa.
- **Pasos:**
  1. Crear un usuario en BD con `isSuperAdmin = true`.
  2. Login y obtener JWT.
  3. Acceder a `GET /news`, `GET /companies`, etc.
- **Criterios de Aceptación:**
  - Todos los endpoints responden con 200 OK.
  - `GET /companies` lista todas las empresas.

### Task 6.5: Verificar Documentación Swagger
- **Descripción:** Revisar que todos los endpoints nuevos y modificados aparecen correctamente documentados en Swagger.
- **Pasos:**
  1. Navegar a `http://localhost:3000/api` (o el puerto configurado).
  2. Revisar tags: `auth`, `companies`.
- **Criterios de Aceptación:**
  - `POST /auth/select-company` aparece en el tag `auth` con request/response bien documentados.
  - Todos los endpoints de `/companies` tienen `@ApiOperation`, `@ApiResponse` y DTOs de request/response.
  - Las propiedades de los DTOs muestran descripción y ejemplo en Swagger UI.

### Task 6.6: Verificar Cobertura Mínima 80%
- **Descripción:** Ejecutar suite de tests completa y verificar que los módulos nuevos/modificados superan el 80% de cobertura.
- **Comando:**
  ```bash
  npm run test:cov -- --testPathPattern="companies|auth|common/guards|news|schedules"
  ```
- **Criterios de Aceptación:**
  - Cobertura ≥ 80% en `src/companies/`, `src/auth/`, `src/common/guards/`.
  - Todos los tests pasan sin errores ni warnings inesperados.
