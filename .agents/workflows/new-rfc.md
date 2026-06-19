---
description: Genera el RFC técnico para una nueva feature del backend NestJS partiendo de un PRD aprobado.
---

# Workflow: `/generate-rfc` — Generación de RFC Técnico (NestJS Backend)

Este workflow asiste al agente adoptando el rol de **Principal Software Architect & Tech Lead** para generar un RFC técnico estructurado a partir de un PRD aprobado.

- **Comando:** `/generate-rfc`
- **Prerequisito:** PRD aprobado en `docs/PRDs/`.

---

## 📋 Instrucciones para el Agente

### Fase 1: Ingestión del PRD

1. Lee el PRD indicado por el usuario en `docs/PRDs/`.
2. Identifica:
   - Endpoints REST requeridos (method, path).
   - Entidades y relaciones de base de datos.
   - Reglas de negocio.
   - Eventos de dominio a disparar.
   - Módulos existentes afectados.
3. **No diseñes el RFC aún.** Primero formula preguntas técnicas al usuario:
   - Edge cases de concurrencia.
   - Comportamiento en errores de dependencias externas.
   - Restricciones de seguridad (¿quién puede llamar este endpoint?).
   - Requisitos de paginación, filtros, sorting.

---

### Fase 2: Q&A Técnica

Presenta las preguntas al usuario. Espera respuestas antes de continuar.

---

### Fase 3: Diseño del RFC

Genera el RFC con todas las secciones. Núcleo del diseño:

#### A. Módulo y Estructura de Archivos

```
src/[feature]/
├── [feature].module.ts
├── [feature].controller.ts        + .spec.ts
├── [feature].service.ts           + .spec.ts
├── constants/
├── decorators/
│   └── [feature]-swagger.decorators.ts
├── dto/
│   ├── create-[feature].dto.ts
│   ├── update-[feature].dto.ts
│   ├── [feature]-response.dto.ts
│   └── index.ts
├── entities/
│   └── [feature].entity.ts
├── exceptions/
│   └── [feature]-not-found.exception.ts
├── interfaces/
│   └── i-[feature]-repository.interface.ts
└── repositories/
    └── [feature].repository.ts
```

#### B. API Endpoints

| Method | Path | Auth | Guard | DTO Request | DTO Response |
|:---|:---|:---|:---|:---|:---|
| GET | /[feature] | Public | — | Query pagination | PaginatedResponseDto |
| GET | /[feature]/:id | Public | — | — | FeatureResponseDto |
| POST | /[feature] | JWT | ADMIN | CreateFeatureDto | FeatureResponseDto |
| PUT | /[feature]/:id | JWT | ADMIN | UpdateFeatureDto | FeatureResponseDto |
| DELETE | /[feature]/:id | JWT | ADMIN | — | void |

#### C. Esquema de Base de Datos

```typescript
// Tabla: [feature_table]
// Columnas, tipos, índices, foreign keys, constraints
```

#### D. Eventos de Dominio

| Evento | Cuándo | Listener |
|:---|:---|:---|
| `[feature].created` | After successful create | `notifications.listener.ts` |

#### E. Plan de Implementación Atómico (Sección 5)

```markdown
### Tarea 1: Interfaces y Contratos (prerequisito absoluto)
- [ ] `src/[feature]/interfaces/i-[feature]-repository.interface.ts`

### Tarea 2: Entidad y Migración
- [ ] `src/[feature]/entities/[feature].entity.ts`
- [ ] Generar migración: `npm run migration:generate -- --name=Create[Feature]Table`
- [ ] Auditar SQL generado

### Tarea 3: DTOs
- [ ] `src/[feature]/dto/create-[feature].dto.ts`
- [ ] `src/[feature]/dto/update-[feature].dto.ts`
- [ ] `src/[feature]/dto/[feature]-response.dto.ts`
- [ ] `src/[feature]/dto/index.ts`

### Tarea 4: Excepciones
- [ ] `src/[feature]/exceptions/[feature]-not-found.exception.ts`

### Tarea 5: Repositorio
- [ ] `src/[feature]/repositories/[feature].repository.ts`

### Tarea 6: Servicio
- [ ] `src/[feature]/[feature].service.ts`

### Tarea 7: Decoradores Swagger
- [ ] `src/[feature]/decorators/[feature]-swagger.decorators.ts`

### Tarea 8: Controlador
- [ ] `src/[feature]/[feature].controller.ts`

### Tarea 9: Módulo
- [ ] `src/[feature]/[feature].module.ts`
- [ ] Registrar en `src/app.module.ts`

### Tarea 10: Tests
- [ ] `src/[feature]/[feature].service.spec.ts`
- [ ] `src/[feature]/[feature].controller.spec.ts`
- [ ] `npm run test:cov` — verificar ≥ 80% coverage
```

---

### Fase 4: Escritura del RFC

Determina el siguiente número correlativo en `docs/RFCs/` y crea `docs/RFCs/RFC-[NNN]-[feature-name].md`.

---

### Fase 5: Entrega

- Informa la ruta del RFC.
- Resumen ejecutivo de decisiones técnicas.
- Próximo paso: `/db-sync-migration` para el esquema de BD, luego `/implement-feature`.
