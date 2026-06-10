---
description: Workflow for the Tech-Lead to generate developer tasks from an RFC
---

# Workflow: RFC to Task Breakdown
You will work with the agent: `.agents/rules/architect-tech-lead.md`

## Core Guidelines
- **NestJS Best Practices & Token Optimization:** During task generation, the Tech-Lead must not load the complete `AGENTS.md` file. Instead, the agent must selectively reference specific testing and architecture rules (such as [test-use-testing-module.md](file:///c:/Users/fedel/NestJs/vyma_backend/.agents/skills/nestjs-best-practices/rules/test-use-testing-module.md), [test-mock-external-services.md](file:///c:/Users/fedel/NestJs/vyma_backend/.agents/skills/nestjs-best-practices/rules/test-mock-external-services.md), or [db-use-migrations.md](file:///c:/Users/fedel/NestJs/vyma_backend/.agents/skills/nestjs-best-practices/rules/db-use-migrations.md)) to formulate precise development instructions for each layer in `docs/tasks/`.

## Objective
Convert an approved Technical RFC (from `docs/RFCs/`) into a highly detailed, structured, and sequential checklist of tasks (tickets) inside `docs/tasks/` that the Expert Developer Agent (`.agents/rules/backend-expert.md`) can easily execute.

## Phase 1: Ingestion and Scope Analysis
- **Trigger:** The user approves the RFC and requests a task breakdown.
- **Agent Action:** Review the approved RFC file in `docs/RFCs/`. Identify:
  1. Database entities and migrations needed.
  2. Domain layers (interfaces, entities, services, and their unit tests).
  3. API layer (endpoints, DTOs, controllers, and their unit tests).
  4. Secondary flows (event listeners, external integrations, CRONs, and their unit tests).
  5. Security requirements (Guards, roles).

## Phase 2: Generating the Task Breakdown File
The agent must generate a new file in `docs/tasks/` named `XXX-feature-tasks.md` (where `XXX` matches the RFC number, e.g., `003-notificaciones-whatsapp-tasks.md`).

### Required Task List Structure:
The generated task file must strictly use the following markdown template. Notice that **each layer includes its corresponding unit tests** to allow developers to create complete, self-tested Pull Requests per phase/layer:

```markdown
# Tasks: [Feature Name] (RFC-XXX)

## Status Overview
- [ ] Total Tasks
- [ ] Database & Persistencia
- [ ] Domain & Business Logic (inc. Unit Tests)
- [ ] API & Controllers (inc. Unit Tests)
- [ ] Events & Integrations (inc. Unit Tests)

---

## 🗄️ Layer 1: Database & Persistencia
### Task 1.1: Create TypeORM Entities
- **Description:** Define the entity classes with their column decorators, relations, and index requirements as specified in the RFC.
- **Files to create/modify:** `src/.../entities/*.entity.ts`
- **Acceptance Criteria:**
  - Strict typing.
  - Proper foreign keys and relation decorators (`@ManyToOne`, `@OneToMany`, etc.).
  - Proper index decorators.

### Task 1.2: Generate and Run Database Migration
- **Description:** Generate the SQL migration from the newly created entities.
- **Files to create/modify:** `src/migrations/*`
- **Acceptance Criteria:**
  - Migration runs successfully with `npm run typeorm:run`.
  - Schema matches the TypeORM entity layout.

---

## 🧠 Layer 2: Domain & Business Logic (Self-Tested Phase)
### Task 2.1: Implement Repository Interfaces
- **Description:** (If applicable) Create the abstract repository interface for dependency inversion.
- **Files to create/modify:** `src/.../interfaces/*`

### Task 2.2: Implement Use Cases / Services
- **Description:** Write the business logic service (`.service.ts`). Inject repositories and helper services.
- **Files to create/modify:** `src/.../services/*.service.ts`
- **Acceptance Criteria:**
  - Business rules from the RFC are fully implemented.
  - No database-specific logic in the core service (uses the repository abstraction).
  - Emits events using `EventEmitter2` for secondary flows (if requested).

### Task 2.3: Write Service Unit Tests
- **Description:** Create service unit tests mocking repository dependencies.
- **Files to create/modify:** `src/.../services/*.service.spec.ts`
- **Acceptance Criteria:**
  - Test core business rules, edge cases, and error handling.
  - Service tests must run and pass successfully (`npm run test` or `jest src/.../services/*.service.spec.ts`).

---

## 🔌 Layer 3: API & Controllers (Self-Tested Phase)
### Task 3.1: Create Input and Output DTOs
- **Description:** Define DTOs for request payloads and responses using `class-validator`, `class-transformer`, and `@nestjs/swagger`.
- **Files to create/modify:** `src/.../dto/*.dto.ts`
- **Acceptance Criteria:**
  - All properties are fully typed and decorated with validations (e.g., `@IsString()`, `@IsUUID()`).
  - All properties are documented using `@ApiProperty()` with examples and descriptions.

### Task 3.2: Create Controller and Endpoints
- **Description:** Define the controller exposing the REST endpoints. Inject the service layer and document with Swagger.
- **Files to create/modify:** `src/.../controllers/*.controller.ts`
- **Acceptance Criteria:**
  - Proper route prefixes.
  - Proper HTTP verbs (GET, POST, etc.) and semantic status codes (e.g., 201 for POST).
  - Use of appropriate guards (`@UseGuards(JwtAuthGuard, RolesGuard)`).
  - Controller is decorated with `@ApiTags()`, and endpoints with `@ApiOperation()` and `@ApiResponse()`.

### Task 3.3: Write Controller Unit Tests
- **Description:** Create controller unit tests mocking the service layer dependencies.
- **Files to create/modify:** `src/.../controllers/*.controller.spec.ts`
- **Acceptance Criteria:**
  - Test request routes, proper delegation of parameters, and expected return status codes/messages.
  - Controller tests must run and pass successfully (`jest src/.../controllers/*.controller.spec.ts`).

---

## 📡 Layer 4: Events, Integrations & Secondary Flows (Self-Tested Phase)
### Task 4.1: Implement Event Listeners
- **Description:** Implement event handlers that react to the emitted events (e.g., sending email with Resend, logging events).
- **Files to create/modify:** `src/.../listeners/*.listener.ts`
- **Acceptance Criteria:**
  - Secondary logic is completely decoupled and fails gracefully without breaking the main request thread.

### Task 4.2: Write Listener Unit Tests
- **Description:** Create unit tests mocking dependencies of the listeners (e.g., mock the Resend client or external APIs).
- **Files to create/modify:** `src/.../listeners/*.listener.spec.ts`
- **Acceptance Criteria:**
  - Event listener tests must run and pass successfully (`jest src/.../listeners/*.listener.spec.ts`).

---

## 🧪 Layer 5: Manual E2E & API Verification
### Task 5.1: Test Endpoints Locally
- **Description:** Send actual requests using Postman/cURL to locally running server endpoints.
- **Acceptance Criteria:**
  - Verify success responses, validation errors (400 Bad Request), and check PostgreSQL database to ensure records are successfully and correctly saved.
```

## Phase 3: Developer Handoff
Once the task markdown file is generated in `docs/tasks/`, the Tech-Lead (Arquitecto) agent must not only save the markdown file but **must strictly write in the chat the exact prompt** to initialize the Developer Agent. This saves the user from having to write intermediate explanations.

### Strict Handoff Prompt Rule:
The agent must provide a clear, copy-pasteable prompt block in the chat formatted exactly like this:

```text
Activa el rol de Desarrollador Experto (`.agents/rules/backend-expert.md`) y el workflow `/develop-feature`.
Tu objetivo es implementar las tareas descritas en el archivo `docs/tasks/XXX-feature-tasks.md`.
Comienza leyendo el archivo de tareas y la guía del workflow para estructurar tu plan de desarrollo en `task.md`.
```

*(Make sure to replace `XXX-feature-tasks.md` with the actual filename generated).*
