---
description: Implementa una feature del backend NestJS capa por capa siguiendo el RFC aprobado.
---

# Workflow: `/implement-feature` — Implementación de Feature por Capas (NestJS)

Este workflow asiste al agente adoptando el rol de **Expert Backend Developer** para implementar una feature capa por capa, siguiendo estrictamente el RFC aprobado y la CONSTITUTION.md.

- **Comando:** `/implement-feature`
- **Prerequisito:** RFC aprobado + migración ejecutada (si aplica).

---

## 📋 Instrucciones para el Agente

### Fase 0: Lectura del RFC

1. Lee el RFC aprobado de `docs/RFCs/`.
2. Lee la Sección 5 (Plan de Implementación) para obtener la lista de tareas.
3. Informa al usuario las tareas que implementarás y en qué orden.

---

### Fase 1: Interfaces y Tokens

Primer paso absoluto — las interfaces son el contrato que todo lo demás implementa:

```typescript
// src/[feature]/interfaces/i-[feature]-repository.interface.ts
export const FEATURE_REPOSITORY = 'FEATURE_REPOSITORY';

export interface IFeatureRepository {
  // Define cada método que el servicio necesitará
  findAll(page: number, limit: number): Promise<[Feature[], number]>;
  findById(id: string): Promise<Feature | null>;
  create(data: CreateFeatureDto): Promise<Feature>;
  update(id: string, data: UpdateFeatureDto): Promise<Feature>;
  remove(id: string): Promise<void>;
}
```

---

### Fase 2: DTOs

```typescript
// Reglas obligatorias:
// 1. Toda propiedad tiene @ApiProperty() con description y example
// 2. Toda propiedad tiene al menos un @class-validator decorator
// 3. Propiedades opcionales tienen @IsOptional() PRIMERO
// 4. El barrel index.ts re-exporta todo
```

---

### Fase 3: Excepciones

```typescript
// Una excepción por archivo
// src/[feature]/exceptions/[feature]-not-found.exception.ts
import { NotFoundException } from '@nestjs/common';

export class FeatureNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Feature with id "${id}" was not found`);
  }
}
```

---

### Fase 4: Repositorio

Implementa la interfaz. Usa `@InjectRepository(Entity)` SOLO aquí, nunca en el servicio:

```typescript
@Injectable()
export class FeatureRepository implements IFeatureRepository {
  constructor(
    @InjectRepository(Feature)
    private readonly repo: Repository<Feature>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(page: number, limit: number): Promise<[Feature[], number]> {
    return this.repo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Feature | null> {
    return this.repo.findOne({ where: { id } });
  }
}
```

---

### Fase 5: Servicio

```typescript
// Reglas:
// 1. Constructor injection via interface token
// 2. Logger instance per service class
// 3. try/catch en todos los métodos async
// 4. EventEmitter para side effects cross-module
// 5. NUNCA inyectar Repository<Entity> directamente
```

---

### Fase 6: Decoradores Swagger

```typescript
// src/[feature]/decorators/[feature]-swagger.decorators.ts
// Agrupar con applyDecorators() — nunca inline en el controlador
export const ApiGetFeatureList = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get paginated feature list' }),
    ApiOkResponse({ description: 'Returns paginated list', type: FeatureResponseDto, isArray: true }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 20 }),
  );
```

---

### Fase 7: Controlador

```typescript
// Reglas:
// 1. @UseGuards en clase, @Roles en método
// 2. @Public() explícito en endpoints públicos
// 3. Solo usa decoradores Swagger importados del archivo de decoradores
// 4. Sin lógica de negocio — solo delega al servicio
```

---

### Fase 8: Módulo y Registro en AppModule

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([Feature])],
  controllers: [FeatureController],
  providers: [
    FeatureService,
    { provide: FEATURE_REPOSITORY, useClass: FeatureRepository },
  ],
  exports: [FeatureService],
})
export class FeatureModule {}
```

Registrar en `src/app.module.ts`.

---

### Fase 9: Verificación

1. `npm run build` → cero errores TypeScript.
2. `npm run start:dev` → cero errores de runtime en startup.
3. Probar endpoints manualmente en Swagger (`/api-docs`).
4. Informar lista de archivos creados y próximo paso: `/generate-tests`.
