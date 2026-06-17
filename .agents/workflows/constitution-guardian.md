---
trigger: manual
description: Constitution Guardian Code Quality Audit Workflow
---

# Workflow: Constitution Guardian (Code Quality Audit)

This workflow guides the **Principal Software Architect & Code Reviewer** agent to perform a rigorous, line-by-line audit of all modified files against the Pull Request Checklist defined in [CONSTITUTION.md](file:///c:/Users/fedel/NestJs/vyma_backend/CONSTITUTION.md). 

You must act as a strict inspector to ensure absolute compliance with the project's architectural, naming, and clean code guidelines before any code is approved for merging.

---

## 🔍 Audit Execution Steps

### 1. Phase 1: Input Analysis
1. Retrieve the list of all created or modified files.
2. Retrieve the results of the linter (`npm run lint`), TypeScript compiler, and unit tests (`npm run test:cov` or Jest outputs).
3. Review the test coverage reports.

### 2. Phase 2: Line-by-Line Checklist Verification
For each modified file, inspect the code line-by-line and evaluate it against each of the following checklist categories:

#### A. Structure & Naming
- [ ] **Folder Structure (Section 2)**: Are the new files located in their correct modular folders (e.g. `entities/`, `services/`, `controllers/`, `dto/`, `repositories/`, `listeners/`, `exceptions/`)? No custom or flat folders.
- [ ] **Naming Conventions (Section 3)**: Are filenames in strict `kebab-case` with the required suffixes (e.g., `.controller.ts`, `.service.ts`, `.repository.ts`, `.dto.ts`, `.entity.ts`)?
- [ ] **Class and Interface Names**: Do class names use `PascalCase` and match their suffix (e.g., `CreateUserDto`, `UserNotFoundException`)? Do interface names for repositories start with `I` (e.g., `IUsersRepository`)?

#### B. Architecture & Decoupling
- [ ] **No Business Logic in Controllers**: Are controllers clean, only parsing input, routing, and calling services?
- [ ] **No Direct Repository/DataSource Injections in Services**: Services must **never** inject `Repository<Entity>` or `DataSource` directly. They must use repository interfaces and injection tokens (e.g., `@Inject(USER_REPOSITORY) private readonly repo: IUsersRepository`).
- [ ] **Flow Direction**: Is the dependency flow strictly `Controller -> Service -> Repository`?
- [ ] **Circular Dependencies**: Are circular module references avoided? If modules need to interact, are secondary processes decoupled using Event-Driven Architecture (`EventEmitter2` and events)?

#### C. Validation & DTOs
- [ ] **Strict Typing**: All controllers must receive typed DTOs. Zero usage of `any` or raw unvalidated objects.
- [ ] **Property Validation**: Does every property in an input DTO have at least one validation decorator from `class-validator`?
- [ ] **Swagger Documentation**: Does every property in DTOs have `@ApiProperty()` with a clear description and example?

#### D. Security
- [ ] **Guards**: Are all sensitive endpoints protected with `@UseGuards(JwtAuthGuard)`?
- [ ] **Explicit Public Route Decorator**: Are public endpoints marked with `@Public()` explicitly?
- [ ] **Rate Limiting**: Are authentication and password-reset endpoints protected with strict throttler configurations (`@Throttle()`)?
- [ ] **No Sensitive Data**: Ensure passwords, tokens, or personal identifiers are not exposed in logs or return payloads.

#### E. Typing & Returns
- [ ] **Zero `any`**: Is there an absolute absence of `any` in all production code files? If a type is dynamic, is `unknown` used instead?
- [ ] **Explicit Returns**: Do all controller and service methods declare their return types explicitly (e.g., `Promise<UserResponseDto>`)?

#### F. Error Handling
- [ ] **Semantic HTTP Exceptions**: Are NestJS HTTP Exceptions thrown (e.g. `NotFoundException`, `ConflictException`)? The usage of raw `new Error()` is strictly forbidden.
- [ ] **Database Error Mapping**: Are database constraints and query exceptions caught in the service/repository layer and mapped to descriptive HTTP exceptions?
- [ ] **Async Try/Catch**: Do asynchronous operations (database, external integrations) have proper try/catch blocks?
- [ ] **Custom Exceptions**: Are business exceptions defined in separate files inside the `exceptions/` directory?

#### G. Performance & Database
- [ ] **No N+1 Queries**: Are database queries optimized? Ensure relations are not fetched in a loop; use explicit joins (`relations` or `QueryBuilder`) instead.
- [ ] **Indexed Fields**: Do lookup columns used in `WHERE`, `JOIN`, or `ORDER BY` have `@Index()` decorators?
- [ ] **Pagination**: Do all listing endpoints enforce pagination limits (e.g., `take` and `skip` query inputs)?

#### H. Testing & Coverage
- [ ] **Spec Files**: Do matching `.spec.ts` files exist for all services, controllers, and repositories?
- [ ] **Test Coverage**: Does the coverage report show `>=80%` coverage across statements, branches, functions, and lines?
- [ ] **Error Path Testing**: Do unit tests cover both happy paths and error cases?

#### I. Swagger Documentation & API Design
- [ ] **Controller Decorators**: Are controllers annotated with `@ApiTags()`, `@ApiOperation()`, and `@ApiResponse()`?
- [ ] **Response DTOs**: Are API response payloads typed with custom response DTOs to serialize outputs, excluding internal IDs or passwords?

---

## 📄 Output: Guardian Audit Report

Once the audit is complete, present the findings in this exact format:

```markdown
# Constitution Guardian Audit Report

## 📊 Compliance Scorecard
- **Estructura y Nomenclatura**: [PASS / FAIL / PARTIAL]
- **Arquitectura y Acoplamiento**: [PASS / FAIL / PARTIAL]
- **Validación y DTOs**: [PASS / FAIL / PARTIAL]
- **Seguridad**: [PASS / FAIL / PARTIAL]
- **Tipado y Retornos**: [PASS / FAIL / PARTIAL]
- **Manejo de Errores**: [PASS / FAIL / PARTIAL]
- **Rendimiento y Base de Datos**: [PASS / FAIL / PARTIAL]
- **Testing y Cobertura**: [PASS / FAIL / PARTIAL]
- **Documentación API**: [PASS / FAIL / PARTIAL]

**Overall Compliance Status**: [APPROVED / REJECTED]

---

## 🔍 Detailed Findings

### 🟢 Passed Checks
- List specific checks that complied perfectly.

### 🔴 Violations & Issues
For each violation detected, list:
1. **File**: [Link to file]
2. **Issue**: Explain the violation (e.g., property injection instead of constructor injection).
3. **Reference**: Point to the Constitution section violated.
4. **Correction Snippet**: Provide a code diff showing how to fix it.

---

## 📋 Action Plan (For the Developer)
A checklist of tasks the developer must execute to bring the code to 100% compliance.
- [ ] **Task 1**: Describe action (e.g. Add `@Index()` to `companyId` in `news.entity.ts`).
- [ ] **Task 2**: Describe action (e.g. Create `news-response.dto.ts` to serialize controller output).
```
