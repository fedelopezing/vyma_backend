# Tasks: Architecture Audit Remediation (RFC-001)

## Status Overview
- [ ] Total Tasks
- [ ] Database & Persistencia
- [ ] Domain & Business Logic (inc. Unit Tests)
- [ ] API & Controllers (inc. Unit Tests)
- [ ] Events & Integrations (inc. Unit Tests)

---

## 🗄️ Layer 1: Database & Persistencia
*(No major database schema changes required for this audit. We will move transaction logic to the service layer in Layer 2).*

---

## 🧠 Layer 2: Domain & Business Logic (Self-Tested Phase)
### Task 2.1: Refactor ProfilesService for Transactions
- **Description:** Move the transaction logic currently residing in `ProfilesController.create` into `ProfilesService.createWithUserTransaction`. This method should handle both the creation of the user and the profile using TypeORM's `dataSource.transaction`.
- **Files to create/modify:** `src/profiles/profiles.service.ts`
- **Acceptance Criteria:**
  - `ProfilesService` cleanly manages the transaction.
  - No `dataSource.transaction` exists in `ProfilesController`.

### Task 2.2: Refactor WhatsappService (SRP)
- **Description:** Split the massive `WhatsappService` into two classes/services. Create `WhatsappConnectionService` (for Puppeteer init, QR, and connection state) and `WhatsappMessagingService` (for sending messages and fetching chats).
- **Files to create/modify:** `src/whatsapp/whatsapp.service.ts`, `src/whatsapp/whatsapp-connection.service.ts`, `src/whatsapp/whatsapp-messaging.service.ts`
- **Acceptance Criteria:**
  - `WhatsappService` no longer violates SRP.
  - Connection logic is cleanly separated from messaging logic.

### Task 2.3: Fix ESLint issues
- **Description:** Run `npm run lint --fix` and manually resolve any leftover issues (unused variables, max-len).
- **Files to create/modify:** Multiple (`src/**/*.ts`)
- **Acceptance Criteria:**
  - `npm run lint` passes with 0 errors.

### Task 2.4: Write Service Unit Tests
- **Description:** Write unit tests for `ProfilesService` (including the new transaction method), `WhatsappConnectionService`, and `WhatsappMessagingService` to increase coverage.
- **Files to create/modify:** `src/profiles/profiles.service.spec.ts`, `src/whatsapp/whatsapp-connection.service.spec.ts`, `src/whatsapp/whatsapp-messaging.service.spec.ts`
- **Acceptance Criteria:**
  - Tests pass successfully.
  - Overall branch and line coverage is improved.

---

## 🔌 Layer 3: API & Controllers (Self-Tested Phase)
### Task 3.1: Apply DTO Validation (class-validator)
- **Description:** Ensure DTOs like `SendMessageDto` use `class-validator` decorators (e.g. `@IsString()`, `@IsNotEmpty()`). Remove manual validation from controllers.
- **Files to create/modify:** `src/whatsapp/dto/send-message.dto.ts`, `src/whatsapp/whatsapp.controller.ts`
- **Acceptance Criteria:**
  - DTO properties are fully validated via decorators.
  - Global `ValidationPipe` handles the bad requests.

### Task 3.2: Clean Controllers and Add Security Guards
- **Description:** 
  1. Refactor `ProfilesController.create` to simply call `ProfilesService.createWithUserTransaction`.
  2. Add `@UseGuards(AuthGuard('jwt'))` to `WhatsappController.sendMessage` and `EmailController.sendBudget`.
- **Files to create/modify:** `src/profiles/profiles.controller.ts`, `src/whatsapp/whatsapp.controller.ts`, `src/email/email.controller.ts`
- **Acceptance Criteria:**
  - Controllers contain zero business logic.
  - Endpoints are secure and cannot be accessed without proper authentication.

### Task 3.3: Write Controller Unit Tests
- **Description:** Create controller unit tests for `ProfilesController`, `WhatsappController`, and `EmailController`.
- **Files to create/modify:** `src/profiles/profiles.controller.spec.ts`, `src/whatsapp/whatsapp.controller.spec.ts`, `src/email/email.controller.spec.ts`
- **Acceptance Criteria:**
  - Tests check proper routing and delegation to mock services.
  - Tests pass successfully.

---

## 📡 Layer 4: Events, Integrations & Secondary Flows (Self-Tested Phase)
### Task 4.1: Implement EventEmitter2 for EmailService
- **Description:** Modify `EmailService.sendEmail` to emit an `email.sent` event instead of directly awaiting `whatsappService.sendMessage`.
- **Files to create/modify:** `src/email/email.service.ts`
- **Acceptance Criteria:**
  - Email sending does not block the main thread waiting for WhatsApp.

### Task 4.2: Create WhatsApp Notification Listener
- **Description:** Create an event listener that listens to `email.sent` and subsequently calls `WhatsappMessagingService.sendMessage` asynchronously.
- **Files to create/modify:** `src/email/listeners/email-sent.listener.ts`
- **Acceptance Criteria:**
  - WhatsApp messages trigger successfully upon email completion without blocking the initial HTTP response.

### Task 4.3: Write Listener Unit Tests
- **Description:** Create unit tests for `email-sent.listener.ts`.
- **Files to create/modify:** `src/email/listeners/email-sent.listener.spec.ts`
- **Acceptance Criteria:**
  - Listener logic is fully tested and passes.

---

## 🧪 Layer 5: Manual E2E & API Verification
### Task 5.1: Test Endpoints Locally
- **Description:** Verify the newly secured endpoints (WhatsApp, Email) reject unauthorized requests. Verify that creating a profile correctly saves both the User and Profile inside a single transaction.
- **Acceptance Criteria:**
  - Responses match expected HTTP status codes (201, 401, 400).
  - All automated tests (`npm run test:cov`) pass and coverage improves towards 80%.
