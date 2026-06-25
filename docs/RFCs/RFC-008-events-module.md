# RFC-008: Módulo de Eventos — Sistema de Agenda CCPS

| Campo        | Valor                                  |
|:-------------|:---------------------------------------|
| **RFC**      | RFC-008                                |
| **Feature**  | events                                 |
| **PRD**      | PRD-03: Sistema de Eventos y Agenda    |
| **Autor**    | Antigravity (Principal Architect)      |
| **Estado**   | PROPUESTO                              |
| **Fecha**    | 2026-06-25                             |
| **Versión**  | 1.0                                    |

---

## 1. Contexto y Motivación

La CCPS necesita publicar y gestionar eventos propios y de sus socios (empresas miembro). Actualmente no existe ninguna entidad `Event` en el sistema; los eventos históricos se almacenan en la tabla `news` bajo la categoría `EVENTO_SOCIO`. Este RFC define la implementación del módulo `events` en el backend NestJS, aislando el dominio de agenda del dominio de noticias.

### Decisiones de diseño clave (resultado del Q&A)

| # | Pregunta                               | Decisión                                                                      |
|:--|:---------------------------------------|:------------------------------------------------------------------------------|
| 1 | Organizador                            | ENUM (`CCPS` / `SOCIO`) + campo `organizadorNombre` (text, nullable) + FK `companyId` |
| 2 | Scope admin                            | Multi-tenant idéntico a `NewsModule` (`AuthPermissions` + `TenantGuard`)      |
| 3 | Temporalidad                           | Solo eventos futuros (`fechaEvento >= NOW()`). Sin sección "Pasados" en agenda.|
| 4 | Migración de datos                     | **No se migran datos** desde `news`. El ENUM `EVENTO_SOCIO` en `news` se conserva. |
| 5 | Eventos de dominio / webhook           | Sin webhook. Astro consume directamente la API REST.                          |
| 6 | Slugs                                  | Bilingüe (`slugEs` + `slugEn`), mismo patrón que `NewsModule`.                |

> **Nota sobre `EVENTO_SOCIO` en `news`:** El ENUM de la tabla `news` conserva el valor `EVENTO_SOCIO` para preservar registros históricos de crónicas de eventos pasados. No se realiza ninguna migración de datos ni alteración del ENUM. La Regla 3 del PRD original (prohibir `EVENTO_SOCIO` en creaciones nuevas) **queda anulada** en esta versión y debe actualizarse en el PRD.

---

## 2. Estructura de Archivos

```
src/events/
├── events.module.ts
├── events.controller.ts           + .spec.ts
├── events.service.ts              + .spec.ts
├── constants/
│   └── events.constants.ts
├── decorators/
│   └── events-swagger.decorators.ts
├── dto/
│   ├── create-event.dto.ts
│   ├── update-event.dto.ts
│   ├── event-response.dto.ts
│   ├── events-pagination.dto.ts
│   └── index.ts
├── entities/
│   └── event.entity.ts
├── exceptions/
│   └── event-not-found.exception.ts
├── interfaces/
│   └── i-event-repository.interface.ts
└── repositories/
    └── event.repository.ts
```

> Sin carpeta `events/` de dominio NestJS (no se usa `EventEmitter2`). El portal Astro consume la API directamente mediante HTTP.

---

## 3. API Endpoints

| Method   | Path                  | Auth | Permiso           | DTO Request            | DTO Response                          |
|:---------|:----------------------|:-----|:------------------|:-----------------------|:--------------------------------------|
| `GET`    | `/events`             | No   | —                 | `EventsPaginationDto`  | `PaginatedResponse<EventResponseDto>` |
| `GET`    | `/events/:slug`       | No   | —                 | —                      | `EventResponseDto`                    |
| `GET`    | `/events/admin`       | JWT  | `read:events`     | `EventsPaginationDto`  | `PaginatedResponse<EventResponseDto>` |
| `POST`   | `/events/admin`       | JWT  | `create:events`   | `CreateEventDto`       | `EventResponseDto`                    |
| `PUT`    | `/events/admin/:id`   | JWT  | `update:events`   | `UpdateEventDto`       | `EventResponseDto`                    |
| `DELETE` | `/events/admin/:id`   | JWT  | `delete:events`   | —                      | `204 No Content`                      |

### Notas de diseño de endpoints

- **Orden público (`GET /events`):** Ordena siempre `fechaEvento ASC` y filtra implícitamente `fechaEvento >= NOW()` + `estado = PUBLICADO`.
- **Admin list (`GET /events/admin`):** Devuelve todos los estados (`BORRADOR` + `PUBLICADO`), sin filtro temporal — visibilidad completa para gestión.
- **Conflicto de rutas:** `GET /events/admin` debe registrarse **antes** de `GET /events/:slug` en el controlador para que `"admin"` no sea interpretado como slug.
- **companyId:** No obligatorio en endpoints públicos; el `TenantGuard` lo inyecta automáticamente en rutas admin desde el JWT.

---

## 4. Esquema de Base de Datos

### 4.1 Nueva tabla: `events`

```sql
CREATE TABLE events (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  slug_es             VARCHAR(255)  NOT NULL UNIQUE,
  slug_en             VARCHAR(255)  UNIQUE,
  titulo_es           VARCHAR(255)  NOT NULL,
  titulo_en           VARCHAR(255),
  resumen_es          TEXT          NOT NULL,
  resumen_en          TEXT,
  contenido_es        TEXT          NOT NULL,      -- HTML sanitizado
  contenido_en        TEXT,                        -- HTML sanitizado
  imagen_portada      VARCHAR(500)  NOT NULL,      -- Cloudinary URL
  fecha_evento        TIMESTAMPTZ   NOT NULL,      -- Con zona horaria
  ubicacion_es        VARCHAR(500),
  ubicacion_en        VARCHAR(500),
  link_registro       VARCHAR(500),                -- URL externa opcional
  organizador         VARCHAR(10)   NOT NULL,      -- 'CCPS' | 'SOCIO'
  organizador_nombre  VARCHAR(255),                -- Nullable; requerido si SOCIO
  estado              VARCHAR(10)   NOT NULL DEFAULT 'BORRADOR',
  autor_id            BIGINT        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  company_id          BIGINT        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ
);

CREATE INDEX IDX_events_agenda   ON events (estado, fecha_evento, deleted_at);
CREATE UNIQUE INDEX IDX_events_slug_es  ON events (slug_es);
CREATE UNIQUE INDEX IDX_events_slug_en  ON events (slug_en);
CREATE INDEX IDX_events_company  ON events (company_id);
```

### 4.2 Tabla `news` — Sin cambios

La tabla `news` **no se modifica**. El ENUM `NewsCategory` conserva el valor `EVENTO_SOCIO`.

### 4.3 TypeORM Entity (diseño)

```typescript
// src/events/entities/event.entity.ts
export enum EventOrganizer {
  CCPS  = 'CCPS',
  SOCIO = 'SOCIO',
}

export enum EventStatus {
  BORRADOR  = 'BORRADOR',
  PUBLICADO = 'PUBLICADO',
}

@Entity('events')
@Index('IDX_events_agenda', ['estado', 'fechaEvento', 'deletedAt'])
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('IDX_events_slug_es', { unique: true })
  @Column('varchar', { length: 255, unique: true })
  slugEs: string;

  @Index('IDX_events_slug_en', { unique: true })
  @Column('varchar', { length: 255, unique: true, nullable: true })
  slugEn: string | null;

  @Column('varchar', { length: 255 })
  tituloEs: string;

  @Column('varchar', { length: 255, nullable: true })
  tituloEn: string | null;

  @Column('text')
  resumenEs: string;

  @Column('text', { nullable: true })
  resumenEn: string | null;

  @Column('text', { comment: 'HTML enriquecido sanitizado ES' })
  contenidoEs: string;

  @Column('text', { nullable: true, comment: 'HTML enriquecido sanitizado EN' })
  contenidoEn: string | null;

  @Column('varchar', { length: 500, comment: 'Cloudinary URL' })
  imagenPortada: string;

  @Column('timestamptz')
  fechaEvento: Date;

  @Column('varchar', { length: 500, nullable: true })
  ubicacionEs: string | null;

  @Column('varchar', { length: 500, nullable: true })
  ubicacionEn: string | null;

  @Column('varchar', { length: 500, nullable: true })
  linkRegistro: string | null;

  @Column({ type: 'enum', enum: EventOrganizer })
  organizador: EventOrganizer;

  @Column('varchar', { length: 255, nullable: true })
  organizadorNombre: string | null;

  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.BORRADOR })
  estado: EventStatus;

  @Column('bigint', { name: 'autor_id' })
  autorId: number;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'autor_id' })
  autor: User;

  @Index()
  @Column({ name: 'company_id', type: 'bigint' })
  companyId: number;

  @ManyToOne(() => Company, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
```

---

## 5. DTOs

### 5.1 `CreateEventDto`

| Campo               | Tipo             | Requerido    | Validación                                     |
|:--------------------|:-----------------|:-------------|:-----------------------------------------------|
| `tituloEs`          | `string`         | Siempre      | `@MaxLength(255)`                              |
| `tituloEn`          | `string`         | Si PUBLICADO | `@ValidateIf(estado === PUBLICADO)`            |
| `resumenEs`         | `string`         | Siempre      | `@IsNotEmpty()`                                |
| `resumenEn`         | `string`         | Si PUBLICADO | `@ValidateIf(estado === PUBLICADO)`            |
| `contenidoEs`       | `string`         | Siempre      | `@SanitizeHtml()`                              |
| `contenidoEn`       | `string`         | Si PUBLICADO | `@SanitizeHtml()`, `@ValidateIf`               |
| `imagenPortada`     | `string`         | Siempre      | `@IsUrl()`                                     |
| `fechaEvento`       | `string`         | Siempre      | `@IsISO8601()` (se parsea a `Date` en repo)    |
| `ubicacionEs`       | `string`         | No           | `@MaxLength(500)`                              |
| `ubicacionEn`       | `string`         | No           | `@MaxLength(500)`                              |
| `linkRegistro`      | `string`         | No           | `@IsUrl()` si presente (`@ValidateIf`)         |
| `organizador`       | `EventOrganizer` | Siempre      | `@IsEnum(EventOrganizer)`                      |
| `organizadorNombre` | `string`         | Si SOCIO     | `@ValidateIf(organizador === SOCIO)`, `@MaxLength(255)` |
| `estado`            | `EventStatus`    | No           | Default `BORRADOR`                             |

### 5.2 `UpdateEventDto`

`PartialType(CreateEventDto)` — todos los campos opcionales con las mismas validaciones condicionales.

### 5.3 `EventsPaginationDto`

| Campo         | Tipo             | Default | Notas                                           |
|:--------------|:-----------------|:--------|:------------------------------------------------|
| `page`        | `number`         | `1`     | `@Min(1)`                                       |
| `limit`       | `number`         | `10`    | `@Min(1)` `@Max(100)`                           |
| `organizador` | `EventOrganizer` | —       | Filtro opcional                                 |
| `estado`      | `EventStatus`    | —       | Solo disponible en admin                        |
| `q`           | `string`         | —       | Busca en `tituloEs`, `tituloEn`, `resumenEs/En` |
| `companyId`   | `number`         | —       | Filtro por tenant (opcional en público)         |

### 5.4 `EventResponseDto`

Expone todos los campos públicos del evento. Decorado con `@Expose()` para usar con `ClassSerializerInterceptor`.

---

## 6. Reglas de Negocio (implementadas en `EventsService`)

| Regla | Descripción | Implementación |
|:------|:------------|:---------------|
| **RN-1** Bilingüe para publicar | `tituloEn`, `resumenEn` y `contenidoEn` son obligatorios si `estado = PUBLICADO` | `assertBilingualComplete()` en `create()` y `update()` |
| **RN-2** Organizador SOCIO | Si `organizador === SOCIO`, `organizadorNombre` es requerido | `assertOrganizadorNombre()` en `create()` y `update()` |
| **RN-3** Solo futuros en público | El endpoint público filtra `fechaEvento >= NOW()` | Filtro hardcoded en el repositorio cuando `forceStatus = PUBLICADO` |
| **RN-4** Borradores ocultos | `BORRADOR` nunca expuesto en endpoints públicos | `findAll()` pasa `forceStatus = PUBLICADO` al repositorio |
| **RN-5** Slug inmutable en PUBLICADO | El slug no cambia si el evento está `PUBLICADO` | En `EventRepository.updateEvent()`: solo recalcula slug si `BORRADOR` |
| **RN-6** Tenant scope | Admin solo gestiona eventos de su `companyId`; SuperAdmin ve todos | `findEventOrFail()` valida `companyId` vs `user.companyId` |

---

## 7. Repositorio — Métodos e Interface

```typescript
// src/events/interfaces/i-event-repository.interface.ts
export interface IEventRepository {
  findPaginated(
    dto: EventsPaginationDto,
    companyId?: number,
    forceStatus?: EventStatus,
  ): Promise<[Event[], number]>;
  findOneById(id: string): Promise<Event | null>;
  findOneBySlug(slug: string): Promise<Event | null>;
  createEvent(dto: CreateEventDto, autorId: string, companyId?: number): Promise<Event>;
  updateEvent(event: Event, dto: UpdateEventDto): Promise<Event>;
  softDelete(id: string): Promise<void>;
}
```

### Lógica de `findPaginated`

```typescript
// Filtro temporal: solo futuros en endpoints públicos
if (forceStatus === EventStatus.PUBLICADO) {
  query.andWhere('event.fechaEvento >= :now', { now: new Date() });
  query.andWhere('event.estado = :estado', { estado: EventStatus.PUBLICADO });
}

// Orden: más cercano primero
query.orderBy('event.fechaEvento', 'ASC');

// Búsqueda full-text con unaccent (igual que news)
if (dto.q) {
  query.andWhere(
    '(unaccent(event.tituloEs) ILIKE unaccent(:q) OR ' +
    'unaccent(event.tituloEn) ILIKE unaccent(:q) OR ' +
    'unaccent(event.resumenEs) ILIKE unaccent(:q) OR ' +
    'unaccent(event.resumenEn) ILIKE unaccent(:q))',
    { q: `%${dto.q}%` },
  );
}
```

---

## 8. Eventos de Dominio

**No se emiten eventos de dominio** en este módulo (`EventEmitter2` no se inyecta). Sin listeners ni webhooks. El portal Astro consume directamente `GET /api/v1/events` y `GET /api/v1/events/:slug`.

---

## 9. Módulo NestJS

```typescript
// src/events/events.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([Event]), CompaniesModule],
  providers: [EventsService, EventRepository],
  controllers: [EventsController],
  exports: [EventsService, EventRepository],
})
export class EventsModule {}
```

```typescript
// src/app.module.ts — agregar a imports[]
import { EventsModule } from './events/events.module';
// ...
EventsModule,
```

---

## 10. Plan de Implementación Atómico

### Tarea 1: Interface del Repositorio _(prerequisito absoluto)_
- [ ] `src/events/interfaces/i-event-repository.interface.ts`

### Tarea 2: Constantes
- [ ] `src/events/constants/events.constants.ts`

### Tarea 3: Entidad y Migración
- [ ] `src/events/entities/event.entity.ts`
- [ ] Generar migración:
  ```bash
  npm run migration:generate -- --name=CreateEventsTable
  ```
- [ ] Auditar SQL generado contra el esquema de §4

### Tarea 4: DTOs
- [ ] `src/events/dto/create-event.dto.ts`
- [ ] `src/events/dto/update-event.dto.ts`
- [ ] `src/events/dto/events-pagination.dto.ts`
- [ ] `src/events/dto/event-response.dto.ts`
- [ ] `src/events/dto/index.ts`

### Tarea 5: Excepción de dominio
- [ ] `src/events/exceptions/event-not-found.exception.ts`

### Tarea 6: Repositorio
- [ ] `src/events/repositories/event.repository.ts`
  - Implementa `IEventRepository`
  - Reutiliza helpers de `common`: `runInTransaction`, `resolveNewsSlugs`, `resolveUniqueSlug`, `slugify`

### Tarea 7: Servicio
- [ ] `src/events/events.service.ts`
  - Guards privados: `assertBilingualComplete()`, `assertOrganizadorNombre()`, `findEventOrFail()`
  - CRUD: `create()`, `findAll()`, `findAllAdmin()`, `findOneBySlug()`, `update()`, `remove()`

### Tarea 8: Decoradores Swagger
- [ ] `src/events/decorators/events-swagger.decorators.ts`

### Tarea 9: Controlador
- [ ] `src/events/events.controller.ts`
  - Orden crítico: `GET admin` **antes** de `GET :slug`

### Tarea 10: Módulo + Registro en AppModule
- [ ] `src/events/events.module.ts`
- [ ] `src/app.module.ts` — agregar `EventsModule`

### Tarea 11: Tests
- [ ] `src/events/events.service.spec.ts`
- [ ] `src/events/events.controller.spec.ts`
- [ ] Verificar cobertura:
  ```bash
  npm run test:cov
  ```
  Objetivo: **≥ 80%** en el módulo `events`

---

## 11. Checklist de Verificación

| Check                                        | Cómo validar                                                        |
|:---------------------------------------------|:--------------------------------------------------------------------|
| Migración genera tabla correcta              | Revisar SQL; ejecutar contra BD dev                                 |
| `GET /events` devuelve solo futuros          | Insertar evento con `fechaEvento` pasada → no aparece en respuesta  |
| `GET /events` orden ascendente por fecha     | Insertar 3 eventos con fechas distintas → orden correcto            |
| Bilingüe requerido al publicar               | `POST admin` con `estado=PUBLICADO` sin `tituloEn` → HTTP 400       |
| `organizadorNombre` requerido si SOCIO       | `POST` con `organizador=SOCIO` sin `organizadorNombre` → HTTP 400   |
| Tenant scope en admin                        | Admin empresa A intenta editar evento empresa B → HTTP 403          |
| Slugs únicos bilingüe                        | Dos eventos mismo título → segundo tiene sufijo numérico            |
| Slug inmutable en PUBLICADO                  | `PUT` sobre evento PUBLICADO con nuevo `tituloEs` → slug sin cambio |
| Coverage ≥ 80%                               | `npm run test:cov`                                                  |

---

## 12. Próximos Pasos

| Orden | Comando          | Descripción                                           |
|:------|:-----------------|:------------------------------------------------------|
| 1     | `/db-sync-migration` | Generar y auditar la migración `CreateEventsTable` |
| 2     | `/implement-feature` | Implementar capa por capa siguiendo §10            |
| 3     | `/generate-tests`    | Generar tests con cobertura ≥ 80%                  |
