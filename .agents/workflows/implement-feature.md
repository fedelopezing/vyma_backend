---
trigger: manual
description: Decoupled Feature Implementation and Refactoring Workflow
---

# Workflow: Decoupled Feature Implementation

This workflow guides the **Expert Backend Developer** agent through implementing or refactoring features. It enforces Clean Architecture by writing decoupled code across separate files, adhering strictly to naming conventions (kebab-case), and using Constructor Injection for all dependencies.

---

## 🛠️ Phase-by-Phase Implementation Guide

### Phase 1: Architectural Alignment & File Mapping
Before writing any code:
1. Read the approved Technical RFC in `docs/RFCs/`.
2. Map out the files you need to create or modify. You must list these files in your response before writing code.
3. Ensure every file is placed in its proper modular folder as defined in **Section 2 of the Constitution**:
   - Entities: `src/[module]/entities/[name].entity.ts`
   - Custom Repositories: `src/[module]/repositories/[name].repository.ts`
   - Repository Interfaces: `src/[module]/interfaces/[name].repository.interface.ts`
   - Services: `src/[module]/services/[name].service.ts`
   - Controllers: `src/[module]/controllers/[name].controller.ts`
   - DTOs: `src/[module]/dto/[action]-[entity].dto.ts`
   - Listeners: `src/[module]/listeners/[name].listener.ts`
   - Exceptions: `src/[module]/exceptions/[name].exception.ts`
4. **File Naming Rule**: Filenames must be strictly in `kebab-case` and end with the correct suffix (e.g., `.controller.ts`, `.service.ts`, `.repository.ts`, `.dto.ts`, `.entity.ts`).

---

### Phase 2: Persistence Layer & Data Access
1. **Entities**: Define TypeORM entities using strict typing (no `any`), relationships, and indexes on lookup columns.
2. **Repository Interfaces**: Define the repository abstraction (e.g. `IUsersRepository` in `interfaces/[name].repository.interface.ts`) and declare a matching string token constant:
   ```typescript
   export const USER_REPOSITORY = 'USER_REPOSITORY';
   export interface IUsersRepository {
     findById(id: number): Promise<User | null>;
     save(user: Partial<User>): Promise<User>;
   }
   ```
3. **Custom Repository Implementation**: Implement this interface in a separate repository class:
   ```typescript
   @Injectable()
   export class UsersRepository implements IUsersRepository {
     constructor(
       @InjectRepository(User)
       private readonly repo: Repository<User>,
       private readonly dataSource: DataSource,
     ) {}
     // Implementation...
   }
   ```
4. **Migrations**: Generate and run the database migration. Do not modify existing migrations.

---

### Phase 3: Domain Layer & Constructor Injection
1. **Constructor Injection**: All services must strictly inject their dependencies via constructor parameters. Property injection (`@Inject` on class attributes) and the Service Locator pattern (`moduleRef.get()`) are strictly forbidden.
   * **Correct DI Pattern**:
     ```typescript
     @Injectable()
     export class UsersService {
       constructor(
         @Inject(USER_REPOSITORY)
         private readonly usersRepository: IUsersRepository,
         private readonly eventEmitter: EventEmitter2,
       ) {}
       // ...
     }
     ```
2. **Decoupled Business Logic**: Services must only contain core business rules. They must not interact with database query builders directly (delegate to repositories) or HTTP parameters directly (delegate to controllers).
3. **Domain Events**: Secondary actions (sending Resend emails, WhatsApp, logging) must be decoupled. Use `this.eventEmitter.emit('event.name', new Event())` at the end of the transaction.
4. **Unit Tests**: Create a `.spec.ts` file next to the service. Mock all injected repositories and external dependencies using `@golevelup/ts-jest`'s `createMock<T>()`. Ensure coverage is `>=80%`.

---

### Phase 4: API Layer & Contracts
1. **DTOs**:
   - Define separate DTOs for input (`CreateUserDto`) and output responses (`UserResponseDto`).
   - Every property in an input DTO must have validation decorators (`class-validator`) and Swagger properties (`@ApiProperty`).
   - Create a clean `dto/index.ts` file exporting all DTOs for the module.
2. **Controllers**:
   - Set up REST endpoints. Controllers must only parse input payloads, apply guards, and call services. No business logic or database access is allowed in controllers.
   - Swagger decorators (`@ApiOperation`, `@ApiResponse`) must be grouped and moved into a separate decorators file: `src/[module]/decorators/[feature]-swagger.decorators.ts`.
3. **Preserve Decorators**: When refactoring or editing existing DTOs or Controllers, under no circumstances should existing Swagger or validation decorators be removed or altered unless requested by the RFC.
4. **Unit Tests**: Create `.spec.ts` files mock-testing controller actions.

---

### Phase 5: Decoupled Listeners & Integrations
1. **Listeners**: Create asynchronous listeners for events using `@OnEvent('event.name', { async: true })`.
2. **Robust Error Handling**: Wrap listener logic in a global `try/catch` block to log exceptions and prevent silent failures.
3. **Unit Tests**: Create spec files for listeners, mocking external API clients.

---

## 🔍 Code Implementation Checklist (DoD)

Before marking a task as complete, verify that:
1. [ ] **Decoupled Files**: The controller, service, repository, entity, DTOs, and exceptions are all in separate files inside their respective modular folders.
2. [ ] **Kebab-Case Naming**: All filenames use `kebab-case` and have correct suffixes.
3. [ ] **Constructor Injection**: All dependencies are injected via constructor arguments. No property injection is used.
4. [ ] **No `any`**: The code contains zero `any` types. Used `unknown` or explicit types instead.
5. [ ] **Contract Integrity**: Output serialization excludes sensitive fields. All REST inputs are validated via DTOs.
6. [ ] **Self-Tested**: Every service, repository, and controller has matching unit tests with `>=80%` test coverage.
