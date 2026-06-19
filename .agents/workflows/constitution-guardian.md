---
description: Audita los archivos modificados contra la CONSTITUTION.md del backend y genera un reporte de cumplimiento con Action Plan.
---

# Workflow: `/constitution-guardian` — Auditoría de Constitución (NestJS Backend)

Este workflow asiste al agente adoptando el rol de **Principal Software Architect & Tech Lead** para realizar una auditoría rigurosa de los archivos modificados contra la [CONSTITUTION.md](file:///c:/Users/fedel/NestJs/vyma_backend/CONSTITUTION.md).

- **Comando:** `/constitution-guardian`
- **Contexto requerido:** Archivos o directorio implementado.

---

## 📋 Instrucciones para el Agente

### Fase 1: Lectura de Archivos

Lee todos los archivos del módulo indicado:
- `[feature].controller.ts` + `.spec.ts`
- `[feature].service.ts` + `.spec.ts`
- `dto/*.ts`
- `entities/*.ts`
- `repositories/*.ts`
- `interfaces/*.ts`
- `exceptions/*.ts`
- `decorators/*.ts`
- `[feature].module.ts`

---

### Fase 2: Auditoría por Secciones de la Constitución

Evalúa cada item con ✅ (cumple) o ❌ (viola) con evidencia:

#### §2 Arquitectura (Estructura de Módulo)
- [ ] Todos los archivos están dentro de `src/[feature]/` — módulo autónomo.
- [ ] `dto/index.ts` existe y re-exporta todos los DTOs.
- [ ] Cada excepción tiene su propio archivo en `exceptions/`.
- [ ] Decoradores de Swagger en archivo separado `decorators/[feature]-swagger.decorators.ts`.

#### §3 Nomenclatura
- [ ] Archivos en `kebab-case`.
- [ ] Clases en `PascalCase` con sufijo correcto (`.Controller`, `.Service`, `Dto`, `.Entity`, etc.).
- [ ] Métodos comienzan con verbos: `find`, `create`, `update`, `remove`.
- [ ] Interfaces prefijadas con `I` si son de repositorio.
- [ ] Tokens de inyección en `UPPER_SNAKE_CASE`.

#### §4 Inyección de Dependencias
- [ ] Constructor injection únicamente — cero `@Inject` en propiedades.
- [ ] Repositorios inyectados via interface + token, NO via `@InjectRepository(Entity)` en servicios.
- [ ] No hay `ModuleRef.get()` en ningún archivo.

#### §5 DTOs
- [ ] Toda propiedad tiene `@ApiProperty()`.
- [ ] Toda propiedad tiene al menos un `class-validator` decorator.
- [ ] Propiedades opcionales tienen `@IsOptional()` antes del validador principal.
- [ ] Cero `any` en los tipos de propiedades.

#### §6 Errores
- [ ] Cero `throw new Error('...')` genérico — solo excepciones HTTP de NestJS.
- [ ] Errores de BD capturados en servicio y mapeados a excepciones HTTP.
- [ ] `try/catch` en todos los métodos async del servicio.

#### §7 Repositorios
- [ ] `@InjectRepository(Entity)` solo en la clase Repository — nunca en Service.
- [ ] `DataSource` solo en Repository — nunca en Service.
- [ ] Paginación implementada en todos los `findAll` con `findAndCount`.

#### §8 Eventos
- [ ] Side effects cross-module usan `EventEmitter2.emit()` — no inyección directa de servicios externos.
- [ ] Eventos nombrados como hechos del pasado: `feature.created`, `feature.updated`.

#### §9 Seguridad
- [ ] Todos los endpoints protegidos tienen `@UseGuards(JwtAuthGuard, RolesGuard)` en el controlador.
- [ ] Endpoints públicos tienen `@Public()` explícito.
- [ ] No se retorna la entidad cruda — se usa DTO de respuesta.

#### §10 Performance
- [ ] No hay consultas N+1.
- [ ] `@Index()` en columnas de FK y filtros.
- [ ] `select` selectivo en queries pesadas.

#### §11 Tipado
- [ ] Cero `any` en todo el módulo.
- [ ] Retornos explícitos en todos los métodos públicos de controller y service.

#### §12 Logging
- [ ] `private readonly logger = new Logger(ClassName.name)` en service.
- [ ] Cero `console.log` o `console.error`.
- [ ] No se loguean datos sensibles.

#### §14 Testing
- [ ] `.spec.ts` existe para service y controller.
- [ ] Todas las dependencias mockeadas.
- [ ] Cobertura ≥ 80%.

#### §15 Swagger
- [ ] Cero decoradores Swagger inline en el controlador.
- [ ] Todos los decoradores en `decorators/[feature]-swagger.decorators.ts`.

---

### Fase 3: Reporte de Cumplimiento

```markdown
## 📋 Reporte de Constitución: [Feature]

### Resumen

| Sección | Estado | Issues |
|:---|:---|:---|
| §2 Arquitectura | ✅ / ❌ | [N] |
| §3 Nomenclatura | ✅ / ❌ | [N] |
| §4 DI | ✅ / ❌ | [N] |
| §5 DTOs | ✅ / ❌ | [N] |
| §6 Errores | ✅ / ❌ | [N] |
| §9 Seguridad | ✅ / ❌ | [N] |
| §14 Testing | ✅ / ❌ | [N] |
| §15 Swagger | ✅ / ❌ | [N] |

### ❌ Violations Found

#### Violation #1: [Título]
- **Sección:** §[N] [Nombre]
- **Archivo:** `[filepath#LN]`
- **Descripción:** [qué viola y por qué]
- **Fix:** [qué debe cambiarse]

### 📋 Action Plan

- [ ] Fix #1 — [archivo] — [cambio requerido]
- [ ] Fix #2 — [archivo] — [cambio requerido]

### Veredicto: ✅ APROBADO / ❌ RECHAZADO — [N] fixes requeridos
```
