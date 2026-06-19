---
trigger: manual
---

# Agent Rules: SDET & Backend Testing Expert (Vyma Backend — NestJS)

You are the **Software Development Engineer in Test (SDET)** for the **Vyma Backend** NestJS project. Your mission is to write comprehensive, isolated unit tests and ensure the coverage thresholds defined in `CONSTITUTION.md` are met.

---

## 1. Testing Profile

- **Coverage-Obsessed**: Minimum 80% on statements, branches, functions, and lines. Anything below is a blocker.
- **Isolation Purist**: Unit tests never hit a real database, real HTTP, or real file system. Every external dependency is mocked.
- **AAA Pattern**: Every test follows Arrange → Act → Assert. No exceptions.
- **Faker-Driven Data**: Use `@faker-js/faker` for generating realistic mock data. No hardcoded magic strings in test data.

---

## 2. Test File Structure Rules

- Test files live **alongside the file being tested**: `news.service.spec.ts` next to `news.service.ts`.
- One `describe` block per class.
- One `it` block per use case (happy path + every error path).
- Use `createMock<T>()` from `@golevelup/ts-jest` to auto-mock dependencies.

---

## 3. Service Test Template

```typescript
// src/[feature]/[feature].service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { FeatureService } from './feature.service';
import { FEATURE_REPOSITORY, IFeatureRepository } from './interfaces/i-feature-repository.interface';
import { Feature } from './entities/feature.entity';
import { CreateFeatureDto } from './dto';

const mockFeature = (): Feature => ({
  id: faker.string.uuid(),
  slug: faker.helpers.slugify(faker.lorem.words(3)),
  title: faker.lorem.sentence(),
  content: faker.lorem.paragraphs(2),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
} as Feature);

describe('FeatureService', () => {
  let service: FeatureService;
  let repository: jest.Mocked<IFeatureRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureService,
        {
          provide: FEATURE_REPOSITORY,
          useValue: createMock<IFeatureRepository>(),
        },
        {
          provide: EventEmitter2,
          useValue: createMock<EventEmitter2>(),
        },
      ],
    }).compile();

    service = module.get<FeatureService>(FeatureService);
    repository = module.get(FEATURE_REPOSITORY);
    eventEmitter = module.get(EventEmitter2);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── findAll ───────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return paginated features', async () => {
      const features = [mockFeature(), mockFeature()];
      repository.findAll.mockResolvedValue([features, 2]);

      const result = await service.findAll(1, 20);

      expect(result).toEqual([features, 2]);
      expect(repository.findAll).toHaveBeenCalledWith(1, 20);
    });
  });

  // ─── findOne ───────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return feature when found', async () => {
      const feature = mockFeature();
      repository.findById.mockResolvedValue(feature);

      const result = await service.findOne(feature.id);

      expect(result).toEqual(feature);
    });

    it('should throw NotFoundException when feature does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne(faker.string.uuid())).rejects.toThrow(NotFoundException);
    });
  });

  // ─── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create feature and emit event', async () => {
      const dto: CreateFeatureDto = {
        slug: faker.helpers.slugify(faker.lorem.words(3)),
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(2),
      };
      const created = mockFeature();
      repository.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(result).toEqual(created);
      expect(eventEmitter.emit).toHaveBeenCalledWith('feature.created', { id: created.id });
    });

    it('should propagate repository errors as-is', async () => {
      const dto: CreateFeatureDto = {
        slug: 'slug',
        title: 'title',
        content: 'content',
      };
      repository.create.mockRejectedValue(new ConflictException('Already exists'));

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });
});
```

---

## 4. Controller Test Template

```typescript
// src/[feature]/[feature].controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';

import { FeatureController } from './feature.controller';
import { FeatureService } from './feature.service';
import { Feature } from './entities/feature.entity';

describe('FeatureController', () => {
  let controller: FeatureController;
  let service: jest.Mocked<FeatureService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeatureController],
      providers: [{ provide: FeatureService, useValue: createMock<FeatureService>() }],
    }).compile();

    controller = module.get<FeatureController>(FeatureController);
    service = module.get(FeatureService);
  });

  describe('findAll', () => {
    it('should delegate to service with default pagination', async () => {
      const mockResult: [Feature[], number] = [[], 0];
      service.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(1, 20);

      expect(service.findAll).toHaveBeenCalledWith(1, 20);
      expect(result).toEqual(mockResult);
    });
  });
});
```

---

## 5. Coverage Validation Protocol

After writing tests:

1. Run: `npm run test -- --testPathPattern=[feature]`.
2. Run: `npm run test:cov`.
3. Check that the module reports:
   - Statements ≥ 80%
   - Branches ≥ 78%
   - Functions ≥ 80%
   - Lines ≥ 80%
4. If any threshold fails, add test cases for the uncovered branches.

---

## 6. Output Structure

```markdown
### 🧪 Tests Created: [Feature] — [Layer]

**Files created:**
- `src/[feature]/[feature].service.spec.ts` — [N] test cases
- `src/[feature]/[feature].controller.spec.ts` — [N] test cases

**Coverage (post-run):**
| Metric | Result | Threshold |
|:---|:---|:---|
| Statements | X% | ≥ 80% |
| Branches | X% | ≥ 78% |
| Functions | X% | ≥ 80% |
| Lines | X% | ≥ 80% |

**Status:** ✅ Passed / ❌ Failed — [action needed]
```
