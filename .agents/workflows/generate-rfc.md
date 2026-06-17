---
trigger: manual
description: Technical RFC Generation Workflow with Unified Developer Task List
---

# Workflow: Technical RFC & Task List Generation

This workflow guides the **Principal Software Architect & Tech Lead** agent through taking a Product Requirement Document (PRD) and producing a comprehensive **Technical RFC** (Request for Comments). The RFC strictly follows a 5-section structure, with Section 5 serving directly as the checklist of atomic development tasks for the programmer, eliminating the need for a separate tasks file.

---

## 🔄 Workflow Steps

### 1. Phase 1: PRD Intake & Clarification Q&A
Before designing any schema, architecture, or writing the RFC, you must review the PRD and resolve all ambiguities.
1. Read the PRD located in `docs/PRDs/`.
2. Do **not** generate the RFC draft yet.
3. Formulate and present a list of target questions to the user regarding:
   - Concurrency risks, race conditions, or transactional requirements.
   - Database model boundaries and multi-tenant isolation rules.
   - API endpoints, authentication guards, and role-based permissions.
   - Performance bottlenecks, N+1 query prevention, and indexing strategy.
   - Secondary processes that need event-driven decoupling (e.g., WhatsApp, Resend emails).
   - Specific integration details with third-party APIs.
4. Wait for the user's response to these questions.

### 2. Phase 2: Generate RFC Draft (Strict 5-Section Structure)
Once the user clarifies your questions, generate the Technical RFC in a new file inside `docs/RFCs/` naming it `XXX-feature-name.md` (where `XXX` is the next sequential three-digit number). The RFC must follow the strict 5-section structure defined below.

---

## 📋 Technical RFC Template Structure

The generated RFC document must follow this exact markdown structure:

```markdown
# RFC: [Feature Name] (RFC-XXX)

**Estado:** Draft
**Módulo:** [Affected Module(s) e.g., Users, Auth, news, etc.]
**Autor:** Principal Software Architect & Tech Lead

---

## 1. Architectural Proposal
- **Justification:** Explain the choice of design patterns, folder structure under the modular layout, and how modular decoupling is maintained.
- **Flow Diagram:** Provide a detailed `mermaid` sequence or state diagram illustrating the request lifecycle, interaction between components (Controller -> Service -> Repository), and event emissions.

## 2. Data Model (TypeORM Schema)
- **Entities & Relations:** Detailed TypeScript code snippets of the TypeORM entities representing the database tables. Must include decorators, relations (`@ManyToOne`, `@OneToMany`, etc.), constraints, and foreign keys.
- **Performance:** Specify the proposed `@Index` locations on foreign keys or lookup fields and cascading delete/update behaviors.

## 3. API Design & Contracts
- **Endpoints Table:** A structured table displaying:
  | Método | Ruta | Guard | Roles | Descripción |
  |---|---|---|---|---|
  | `POST` | `/api/v1/resource` | `JwtAuthGuard` | `admin` | Description of action |
- **DTOs:** TypeScript code snippets of input/output DTOs with validation decorators (`class-validator`) and Swagger documentation (`@ApiProperty`).

## 4. Security & Performance Considerations
- Detail measures to prevent:
  - Cross-Tenant Data Leaks (isolation strategies).
  - N+1 query bottlenecks (explicit relations or QueryBuilder joins).
  - External API latency (decoupling long-running tasks using `@nestjs/event-emitter` listeners).
  - Security threats (rate limiting via throttlers, sanitization using custom decorators, data exclusion serializing).

## 5. Sequential Implementation Plan
This section serves as the **exclusive and complete checklist of atomic tasks** for the programmer. The developer agent must be able to follow this checklist blindly to construct the feature layer-by-layer.

Tasks must be organized by the following Clean Architecture phases:

### Phase 1: Database & Persistence
Tasks to create TypeORM entities, repositories, and generate/run migrations.
- [ ] **Tarea 1.1: [Task Title]**
  - **Descripción:** [Detailed description of what to do]
  - **Archivos a crear/modificar:** `src/[module]/entities/*.entity.ts`, etc.
  - **Criterios de Aceptación:** [Exact tests, constraints, or configurations that must be present]

- [ ] **Tarea 1.2: Generar y Ejecutar Migración**
  - **Descripción:** Generate the database migration and apply it to the local schema.
  - **Archivos a crear/modificar:** `src/database/migrations/*`
  - **Criterios de Aceptación:** Ran successfully with `npm run typeorm:run` without errors.

### Phase 2: Domain & Business Logic (Self-Tested)
Tasks to implement interfaces, core services, and their corresponding unit tests.
- [ ] **Tarea 2.1: Crear Interfaces de Repositorio**
  - **Descripción:** Define the repository abstraction to decouple database access from services.
  - **Archivos a crear/modificar:** `src/[module]/interfaces/*.repository.interface.ts`
  - **Criterios de Aceptación:** Clean contract separating domain from persistence.

- [ ] **Tarea 2.2: Implementar Servicio**
  - **Descripción:** Write the core business logic in the service. Include event emissions if needed.
  - **Archivos a crear/modificar:** `src/[module]/services/*.service.ts`
  - **Criterios de Aceptación:** Logic correctly matches PRD. Decoupled secondary actions using `EventEmitter2`.

- [ ] **Tarea 2.3: Escribir Pruebas Unitarias del Servicio**
  - **Descripción:** Create unit tests mock-testing the service.
  - **Archivos a crear/modificar:** `src/[module]/services/*.service.spec.ts`
  - **Criterios de Aceptación:** Test happy paths, edge cases, and exceptions. Coverage target for service: >= 80%. Tests pass using Jest.

### Phase 3: API & Controllers (Self-Tested)
Tasks to implement input/output DTOs, controllers, and their unit tests.
- [ ] **Tarea 3.1: Crear DTOs con Validación**
  - **Descripción:** Create DTO classes for requests and responses.
  - **Archivos a crear/modificar:** `src/[module]/dto/*.dto.ts`
  - **Criterios de Aceptación:** Full validation using `class-validator`. Swagger documentation with `@ApiProperty`.

- [ ] **Tarea 3.2: Implementar Controlador y Endpoints**
  - **Descripción:** Set up controller routes, HTTP status codes, security guards, and Swagger decorators.
  - **Archivos a crear/modificar:** `src/[module]/controllers/*.controller.ts`
  - **Criterios de Aceptación:** Routes map to the service. Semantic HTTP responses. Controllers do not contain business logic.

- [ ] **Tarea 3.3: Escribir Pruebas Unitarias del Controlador**
  - **Descripción:** Unit test the controller, mocking services.
  - **Archivos a crear/modificar:** `src/[module]/controllers/*.controller.spec.ts`
  - **Criterios de Aceptación:** Test route mappings, payloads, and returned status codes. Tests run and pass.

### Phase 4: Events & Integrations (Self-Tested)
Tasks to implement event listeners for secondary processes and external integration.
- [ ] **Tarea 4.1: Implementar Listeners de Eventos**
  - **Descripción:** Create listeners for decoupled actions (e.g. sending emails or WhatsApp notifications).
  - **Archivos a crear/modificar:** `src/[module]/listeners/*.listener.ts`
  - **Criterios de Aceptación:** Wrap implementation inside a robust global `try/catch` block to prevent silent failures.

- [ ] **Tarea 4.2: Escribir Pruebas Unitarias del Listener**
  - **Descripción:** Unit test the event listeners by mocking external clients.
  - **Archivos a crear/modificar:** `src/[module]/listeners/*.listener.spec.ts`
  - **Criterios de Aceptación:** Tests run and pass. Target coverage: >= 80%.

### Phase 5: Verification E2E Final
- [ ] **Tarea 5.1: Pruebas Manuales E2E**
  - **Descripción:** Test the entire flow manually using Postman, Insomnia, or cURL.
  - **Archivos a crear/modificar:** None.
  - **Criterios de Aceptación:** Success responses, data recorded correctly in PostgreSQL, security guards work as expected.
```

---

## 🔍 Self-Evaluation Checklist for the Tech Lead

Before submitting the RFC draft to the user, verify that:
1. [ ] **Format Alignment**: The document is structured into exactly 5 sections under the correct headers.
2. [ ] **No placeholders**: Every DTO, Entity, and API contract contains actual draft code, not ellipses (`...`) or placeholders.
3. [ ] **Granular Tasks**: Section 5 tasks are atomic. They specify exact file paths to create/modify and list strict acceptance criteria.
4. [ ] **No `any` rule**: The proposed contracts and schemas completely avoid using `any`.
5. [ ] **Clean Architecture Enforcement**: The implementation plan enforces the strict flow: `Controller -> Service -> Repository` with decoupled event listeners.
