---
description: Genera tests unitarios exhaustivos para servicios y controladores NestJS, validando cobertura ≥ 80%.
---

# Workflow: `/generate-tests` — Generación de Tests Unitarios (NestJS)

Este workflow asiste al agente adoptando el rol de **SDET & Backend Testing Expert** para escribir tests unitarios completos siguiendo el patrón AAA (Arrange-Act-Assert).

- **Comando:** `/generate-tests`
- **Contexto requerido:** Archivos de servicio y controlador implementados.

---

## 📋 Instrucciones para el Agente

### Fase 1: Lectura de los Archivos a Testear

1. Lee `src/[feature]/[feature].service.ts` completamente.
2. Lee `src/[feature]/[feature].controller.ts` completamente.
3. Lee las interfaces de repositorio y las excepciones del módulo.
4. Identifica todos los métodos públicos → cada uno necesita al menos:
   - Un test de happy path.
   - Un test por cada rama de error/excepción.

---

### Fase 2: Setup del Test Module

```typescript
// Patrón estándar con createMock<T>() de @golevelup/ts-jest
const module: TestingModule = await Test.createTestingModule({
  providers: [
    FeatureService,
    { provide: FEATURE_REPOSITORY, useValue: createMock<IFeatureRepository>() },
    { provide: EventEmitter2, useValue: createMock<EventEmitter2>() },
  ],
}).compile();
```

---

### Fase 3: Mock Data con Faker

```typescript
const mockFeature = (): Feature => ({
  id: faker.string.uuid(),
  slug: faker.helpers.slugify(faker.lorem.words(3)),
  title: faker.lorem.sentence(),
  content: faker.lorem.paragraphs(2),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
} as Feature);
```

**Regla**: Nunca hardcodear UUIDs, nombres o IDs. Siempre `faker`.

---

### Fase 4: Casos de Test por Método

Para cada método del servicio, cubrir:

| Método | Happy Path | Error Paths |
|:---|:---|:---|
| `findAll` | Retorna `[items, count]` | — |
| `findOne` | Retorna el item | `NotFoundException` si no existe |
| `create` | Crea y retorna + emite evento | Error de repositorio propagado |
| `update` | Actualiza y retorna | `NotFoundException` si no existe |
| `remove` | Elimina sin error | `NotFoundException` si no existe |

---

### Fase 5: Cobertura de Ramas (Branches)

Las ramas más comunes a cubrir explícitamente:

```typescript
// Rama: objeto no encontrado → excepción
it('should throw NotFoundException when item does not exist', async () => {
  repository.findById.mockResolvedValue(null); // null → branch coverage
  await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
});

// Rama: conflicto → excepción de conflicto
it('should throw ConflictException when slug already exists', async () => {
  repository.findBySlug.mockResolvedValue(existingItem); // found → conflict branch
  await expect(service.create(dto)).rejects.toThrow(ConflictException);
});

// Rama: error de DB → error interno
it('should propagate DB errors', async () => {
  repository.create.mockRejectedValue(new Error('DB connection lost'));
  await expect(service.create(dto)).rejects.toThrow();
});
```

---

### Fase 6: Ejecución y Validación de Cobertura

```bash
# Ejecutar tests del módulo
npm run test -- --testPathPattern=src/[feature]/

# Ver cobertura del módulo
npm run test:cov -- --testPathPattern=src/[feature]/
```

Verificar que el reporte muestra:
- Statements: ≥ 80%
- Branches: ≥ 78%
- Functions: ≥ 80%
- Lines: ≥ 80%

---

### Fase 7: Entrega

```markdown
### 🧪 Tests Generados: [Feature]

**Archivos:**
- `src/[feature]/[feature].service.spec.ts` — [N] test cases
- `src/[feature]/[feature].controller.spec.ts` — [N] test cases

**Cobertura:**
| Métrica | Resultado | Umbral |
|:---|:---|:---|
| Statements | X% | ≥ 80% |
| Branches | X% | ≥ 78% |
| Functions | X% | ≥ 80% |
| Lines | X% | ≥ 80% |

**Estado:** ✅ Listo para `/constitution-guardian`
```
