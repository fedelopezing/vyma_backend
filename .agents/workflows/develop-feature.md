---
description: Workflow for developing features with the Backend Expert Agent
---

# Workflow with the Expert Backend Developer Agent
You will work with the agent: `.agents/rules/backend-expert.md`

## Core Guidelines
- **Clean Code & Quality Standards:** Throughout all implementation phases, the agent must rely on and actively consult the guidelines defined in [.agents/skills/typescript-clean-code/guidelines.md](file:///c:/Users/fedel/NestJs/vyma_backend/.agents/skills/typescript-clean-code/guidelines.md) to strictly evaluate code legibility, modularity, and cyclomatic complexity, ensuring all developed code is clean and highly maintainable.

## Phase 1: Task Assignment (Kickoff)
The cycle begins when the Architect has generated an approved RFC or there is a clear development ticket.
**User Action:** You pass the RFC, user story, or specific tasks to the Agent.
**Supporting Prompt:** "Here is the RFC / user story to implement [X]. Please review it and before writing the code, list the files you are going to modify or create."
**Agent Action:** The agent reads the requirement, analyzes the architecture (NestJS, TypeORM, etc.) and returns an action plan listing the files (`.controller.ts`, `.service.ts`, `.entity.ts`, etc.).

## Phase 2: Implementation of the Persistence Layer and Entities
The agent will start building from the database outwards (Clean Architecture).
**Agent Action:** Generates code for Entities (TypeORM), domain interfaces, and Repositories.
**User Action:** You review that the database relationships are correct, data types are appropriate, and indexes are optimal. If correct, you approve to continue.

## Phase 3: Business Logic and Use Cases
The agent will implement the core logic.
**Agent Action:** Writes the Services/Use Cases, injecting the repositories. Implements events (`EventEmitter`) if it's necessary to decouple logic.
**User Action:** You verify that SOLID principles are met (e.g., short functions, dependency injection) and that the code has no `code smells`. You ask for refactoring if you see something that can be improved.
**Feedback Example:** "The service is doing too many things, extract the notification logic to another service and use events."

## Phase 4: Contracts and Controllers (API)
Finally, endpoints are exposed.
**Agent Action:** Creates DTOs using `class-validator` and `class-transformer`. Then creates Controllers exposing REST routes and injecting the corresponding services.
**User Action:** You confirm that HTTP status codes are correct and validations are strict.

## Phase 5: Final Review and Error Handling
Exception handling is reviewed.
**Agent Action:** Ensures that `HttpException`s (e.g., `NotFoundException`, `BadRequestException`) are used at all failure points.
**User Action (Final Review):** You test the code locally or visually validate it. End of cycle.
