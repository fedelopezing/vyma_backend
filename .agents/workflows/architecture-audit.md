---
description: Workflow for comprehensive code inspection, architecture audit, and quality assurance
---

# Workflow: Comprehensive Architecture & Quality Audit
You will work with either the Architect Agent (`.agents/rules/architect-tech-lead.md`) or the Backend Expert Agent (`.agents/rules/backend-expert.md`) depending on the depth of the audit.

## Objective
Perform a rigorous, automated, and manual inspection of the codebase to ensure architectural integrity, 80%+ test coverage, strict adherence to formatting (ESLint/Prettier), and the identification of any bad practices, code smells, or deviations from the Harmonia Clean Architecture guidelines.

## Phase 1: Automated Formatting and Linting (Pre-Check)
- **Trigger:** The user requests a general code audit or wants to prepare a Pull Request.
- **User Action:** Run the automated checks to ensure baseline quality in your terminal.
- **Commands:**
  - `npm run format` (to enforce Prettier formatting)
  - `npm run lint` (to catch ESLint warnings/errors)
- **Agent Action:** If errors are provided by the user, the agent must propose exact code fixes to resolve all linting and formatting issues before proceeding.

## Phase 2: Test Coverage Verification
- **User Action:** Run the test suite with coverage reporting.
- **Command:** `npm run test:cov`
- **Agent Action:** Analyze the coverage report output provided by the user.
  - **Requirement:** Coverage MUST be at least **80%** across statements, branches, functions, and lines.
  - If coverage is below 80%, the agent must identify the uncovered files/methods and generate a list of missing unit tests (`*.spec.ts`) that need to be implemented.

## Phase 3: Architectural & Clean Code Inspection
- **Trigger:** Once automated tests and linters pass.
- **Agent Action:** 
  - **Context Limitation (Avoid Attention Loss):** If the files to be analyzed exceed 300 lines of code in total, the agent must request/analyze the files one by one or grouped by functional modules (e.g., first Entity + DTO, then Service, then Controller) to prevent the "needle-in-a-haystack" effect and maintain high analytical accuracy.
  - The agent will deeply analyze the provided source code files (Controllers, Services, Entities, Listeners) and evaluate them against the following checklist:
  1. **Clean Architecture Violations:** 
     - Do Controllers contain business logic? (They must only handle HTTP routing and delegate to Services).
     - Do Services directly interact with the Database? (They must use Repositories/Interfaces).
  2. **SOLID Principles:** 
     - Are classes/methods doing too many things? (Single Responsibility).
     - Are dependencies properly injected? (Dependency Inversion).
  3. **Event-Driven Decoupling:** 
     - Are secondary tasks (like emails, external API calls to WhatsApp) blocking the main thread? (They must use `EventEmitter2`).
  4. **Performance & TypeORM:** 
     - Are there N+1 query problems?
     - Are raw queries used instead of QueryBuilder or proper relations?
     - Are indices missing on queried columns?
  5. **Security & Validation:** 
     - Are endpoints missing `@UseGuards()`?
     - Are DTOs missing `class-validator` decorators or is the `any` type being used?
  6. **Code Cleanup & Unused Imports:** 
     - Are there any unused imports or variables left in the files? (They must be actively identified and removed to keep the code clean).

## Phase 4: Audit Report & Suggestions
- **Agent Action:** The agent generates a structured **Audit Report** summarizing the findings.
  
### Report Structure:
```markdown
# 🛡️ Architecture & Quality Audit Report

## 1. Automated Checks Status
- **ESLint / Prettier:** [Pass / Fail - Details]
- **Test Coverage:** [XX% - Pass / Fail]

## 2. Architectural Findings & Code Smells
- **[Severity: High/Medium/Low] - [File/Component Name]**
  - **Issue:** [Description of the bad practice or architecture violation]
  - **Impact:** [Why this is bad for Harmonia]
  - **Suggestion/Fix:** [Exact code snippet or structural change to fix it]

## 3. Action Plan (Next Steps)
- [ ] Task 1: [e.g., Extract business logic from UserController to UserService]
- [ ] Task 2: [e.g., Write missing unit tests for NotificationService to reach 80% coverage]
```

## Phase 5: Remediation
- **User Action:** Ask the Backend Expert Agent to execute the tasks generated in the Action Plan to resolve the issues.
