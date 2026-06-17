---
trigger: manual
description: Unit Testing and Strict Coverage Workflow
---

# Workflow: Unit Testing & Strict Coverage

This workflow guides the **SDET & Backend Testing Expert** agent when a backend class (Service, Repository, Listener, or Controller) is created or modified. It details the step-by-step process to generate its mirroring `.spec.ts` file, mock dependencies using advanced utilities, generate dynamic mock data, and guarantee the project's strict test coverage thresholds are met.

---

## 🔄 Workflow Steps

### 1. Phase 1: File Analysis & Dependency Mapping
1. Read the newly created or modified class file (e.g., `src/[module]/services/[name].service.ts`).
2. Inspect the constructor definition.
3. List all the injected dependencies (e.g. repository interfaces, event emitters, configuration managers, external API clients).
4. Identify all the public methods of the class that must be tested.

---

### 2. Phase 2: Compile Testing Module Setup
Create the test mirror file (e.g., `src/[module]/services/[name].service.spec.ts`) alongside the file under test.
1. **NestJS Testing Utilities**: Import `Test` and `TestingModule` from `@nestjs/testing`.
2. **Abstractions and Injection Tokens**: Ensure dependencies are mocked based on their interfaces. If a dependency is injected using a custom token (e.g., `@Inject(USER_REPOSITORY)`), use that token in the testing module setup.
3. **Advanced Mocking**: Import `createMock` from `@golevelup/ts-jest` to auto-mock dependencies. Do not write extensive manual mock objects.
   * **Correct Setup Example**:
     ```typescript
     import { Test, TestingModule } from '@nestjs/testing';
     import { createMock } from '@golevelup/ts-jest';
     import { UsersService } from './users.service';
     import { USER_REPOSITORY, IUsersRepository } from '../interfaces/user-repository.interface';
     import { EventEmitter2 } from '@nestjs/event-emitter';

     describe('UsersService', () => {
       let service: UsersService;
       let repositoryMock: jest.Mocked<IUsersRepository>;
       let eventEmitterMock: jest.Mocked<EventEmitter2>;

       beforeEach(async () => {
         const module: TestingModule = await Test.createTestingModule({
           providers: [
             UsersService,
             {
               provide: USER_REPOSITORY,
               useValue: createMock<IUsersRepository>(),
             },
             {
               provide: EventEmitter2,
               useValue: createMock<EventEmitter2>(),
             },
           ],
         }).compile();

         service = module.get<UsersService>(UsersService);
         repositoryMock = module.get(USER_REPOSITORY);
         eventEmitterMock = module.get(EventEmitter2);
       });

       it('should be defined', () => {
         expect(service).toBeDefined();
       });
     });
     ```

---

### 3. Phase 3: Dynamic Data Generation
1. Use `@faker-js/faker` to generate mock data. Avoid hardcoding test inputs like fixed IDs, emails, names, or addresses.
2. Initialize mock data dynamically inside each test case or within a local helper function:
   ```typescript
   import { faker } from '@faker-js/faker';

   const createMockUser = () => ({
     id: faker.number.int(),
     uuid: faker.string.uuid(),
     email: faker.internet.email(),
     name: faker.person.fullName(),
     isActive: true,
   });
   ```

---

### 4. Phase 4: Test Cases Implementation
Organize tests using nested `describe` blocks for each method under test:

```typescript
describe('methodName', () => {
  // Test cases go here
});
```

For each method, implement tests covering:
- **Happy Path**:
  - Mock resolving dependencies successfully.
  - Call the method and assert the returned value matches the expected output.
  - Verify that dependencies were called with correct parameters (e.g. `expect(repositoryMock.save).toHaveBeenCalledWith(dto)`).
- **Error Mapping (Exception Handling)**:
  - Mock dependencies throwing errors or returning empty values.
  - Assert that the service maps these errors to correct NestJS HTTP exceptions.
  - Example: Assert that a database unique violation (PostgreSQL code `23505`) translates to a `ConflictException`:
    ```typescript
    it('should throw ConflictException if email is already taken', async () => {
      const dbError = new Error('Unique constraint violation');
      (dbError as any).code = '23505';
      repositoryMock.save.mockRejectedValue(dbError);

      await expect(service.createUser(dto)).rejects.toThrow(ConflictException);
    });
    ```
- **Domain Event Verification**:
  - Assert that secondary side-effects trigger event emissions:
    ```typescript
    expect(eventEmitterMock.emit).toHaveBeenCalledWith('user.created', expect.any(UserCreatedEvent));
    ```

---

### 5. Phase 5: Local Test Execution & Coverage Audit
1. Run the test file locally using:
   ```bash
   npm run test -- src/[module]/services/[name].service.spec.ts
   ```
2. Verify that the test compiles and runs successfully.
3. Check the test coverage using:
   ```bash
   npm run test:cov
   ```
4. Confirm that the test suite satisfies the project's strict coverage thresholds:
   - **Branches**: >= 78%
   - **Lines**: >= 80%
   - **Functions**: >= 80%
   - **Statements**: >= 80%
5. If coverage is below targets, identify the uncovered branches or lines, add missing test cases to cover them, and repeat the verification process.
