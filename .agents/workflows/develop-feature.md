---
description: Workflow for developing features with the Backend Expert Agent
---

# Workflow with the Expert Backend Developer Agent
You will work with the agent: `.agents/rules/backend-expert.md`

## Core Guidelines
- **NestJS Best Practices & Token Optimization:** Throughout all implementation phases, the agent must strictly load and consult *only* the specific rule files from [.agents/skills/nestjs-best-practices/rules/](file:///c:/Users/fedel/NestJs/vyma_backend/.agents/skills/nestjs-best-practices/rules) that correspond to the active phase, instead of reading the full `AGENTS.md` file. This prevents token waste and maintains high context precision.

## Phase 1: Task Assignment (Kickoff)
The cycle begins when the Architect has generated an approved RFC or there is a clear development ticket.
**User Action:** You pass the RFC, user story, or specific tasks to the Agent.
**Supporting Prompt:** "Here is the RFC / user story to implement [X]. Please review it and before writing the code, list the files you are going to modify or create."
**Agent Action:** The agent reads the requirement, analyzes the architecture (NestJS, TypeORM, etc.) and returns an action plan listing the files (`.controller.ts`, `.service.ts`, `.entity.ts`, etc.).
**Relevant Rules to Load:** [arch-feature-modules](file:///c:/Users/fedel/NestJs/vyma_backend/.agents/skills/nestjs-best-practices/rules/arch-feature-modules.md) (to check feature layout).

## Phase 2: Implementation of the Persistence Layer and Entities
The agent will start building from the database outwards (Clean Architecture).
**Agent Action:** Generates code for Entities (TypeORM), domain interfaces, and Repositories.
**User Action:** You review that the database relationships are correct, data types are appropriate, and indexes are optimal. If correct, you approve to continue.
**Relevant Rules to Load:**
- [db-use-migrations](file:///c:/Users/fedel/NestJs/vyma_backend/.agents/skills/nestjs-best-practices/rules/db-use-migrations.md) (for database schemas and migrations)
- [arch-use-repository-pattern](file:///c:/Users/fedel/NestJs/vyma_backend/.agents/skills/nestjs-best-practices/rules/arch-use-repository-pattern.md) (for database decoupling)
- [perf-optimize-database](file:///c:/Users/fedel/NestJs/vyma_backend/.agents/skills/nestjs-best-practices/rules/perf-optimize-database.md) (for proper indexing and relations)

## Phase 3: Business Logic and Use Cases
The agent will implement the core logic.
**Agent Action:** Writes the Services/Use Cases, injecting the repositories. Implements events (`EventEmitter`) if it's necessary to decouple logic.
**User Action:** You verify that SOLID principles are met (e.g., short functions, dependency injection) and that the code has no `code smells`. You ask for refactoring if you see something that can be improved.
**Feedback Example:** "The service is doing too many things, extract the notification logic to another service and use events."
**Relevant Rules to Load:**
- [arch-single-responsibility](file:///c:/Users/fedel/NestJs/vyma_backend/.agents/skills/nestjs-best-practices/rules/arch-single-responsibility.md) (for isolated service logic)
- [arch-use-events](file:///c:/Users/fedel/NestJs/vyma_backend/.agents/skills/nestjs-best-practices/rules/arch-use-events.md) (for event-driven decoupling)
- [di-prefer-constructor-injection](file:///c:/Users/fedel/NestJs/vyma_backend/.agents/skills/nestjs-best-practices/rules/di-prefer-constructor-injection.md) (for constructor DI)
- [db-use-transactions](file:///c:/Users/fedel/NestJs/vyma_backend/.agents/skills/nestjs-best-practices/rules/db-use-transactions.md) (for transactional boundaries)

## Phase 4: Contracts and Controllers (API)
Finally, endpoints are exposed.
**Agent Action:** Creates DTOs using `class-validator` and `class-transformer`. Then creates Controllers exposing REST routes and injecting the corresponding services.
**User Action:** You confirm that HTTP status codes are correct and validations are strict.
**Relevant Rules to Load:**
- [api-use-dto-serialization](file:///c:/Users/fedel/NestJs/vyma_backend/.agents/skills/nestjs-best-practices/rules/api-use-dto-serialization.md) (for data transfer and response serialization)
- [security-use-guards](file:///c:/Users/fedel/NestJs/vyma_backend/.agents/skills/nestjs-best-practices/rules/security-use-guards.md) (for guards and endpoint security)
- [security-validate-all-input](file:///c:/Users/fedel/NestJs/vyma_backend/.agents/skills/nestjs-best-practices/rules/security-validate-all-input.md) (for input validation)
- [api-use-pipes](file:///c:/Users/fedel/NestJs/vyma_backend/.agents/skills/nestjs-best-practices/rules/api-use-pipes.md) & [api-use-interceptors](file:///c:/Users/fedel/NestJs/vyma_backend/.agents/skills/nestjs-best-practices/rules/api-use-interceptors.md) (for transformations/formatting)

## Phase 5: Final Review, Testing and Error Handling
Exception handling and test coverage are reviewed.
**Agent Action:** Ensures that `HttpException`s (e.g., `NotFoundException`, `BadRequestException`) are used at all failure points and unit tests are written for code validation.
**User Action (Final Review):** You run and verify unit tests, then test the code locally or visually validate it. End of cycle.
**Relevant Rules to Load:**
- [error-throw-http-exceptions](file:///c:/Users/fedel/NestJs/vyma_backend/.agents/skills/nestjs-best-practices/rules/error-throw-http-exceptions.md) (for semantic NestJS errors)
- [error-use-exception-filters](file:///c:/Users/fedel/NestJs/vyma_backend/.agents/skills/nestjs-best-practices/rules/error-use-exception-filters.md) (for standardized error responses)
- [test-use-testing-module](file:///c:/Users/fedel/NestJs/vyma_backend/.agents/skills/nestjs-best-practices/rules/test-use-testing-module.md) & [test-mock-external-services](file:///c:/Users/fedel/NestJs/vyma_backend/.agents/skills/nestjs-best-practices/rules/test-mock-external-services.md) (for unit testing)
