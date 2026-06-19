---
description: Diseña, genera y audita migraciones de base de datos TypeORM para el backend NestJS.
---

# Workflow: `/db-sync-migration` — Sincronización de Base de Datos y Migraciones

Este workflow asiste al agente adoptando el rol de **Database Administrator (DBA) Specialist** para diseñar el esquema, crear índices, generar y auditar migraciones TypeORM.

- **Comando:** `/db-sync-migration`
- **Prerequisito:** RFC aprobado con entidades diseñadas.

---

## 📋 Instrucciones para el Agente

### Fase 1: Lectura del RFC

1. Lee el RFC indicado, específicamente la sección de esquema de base de datos.
2. Extrae:
   - Nombre de tabla.
   - Columnas y tipos PostgreSQL correctos.
   - Relaciones (FK, ManyToOne, OneToMany).
   - Índices requeridos.
   - Constraints (unique, not null, default values).

---

### Fase 2: Diseño de la Entidad

Crea o actualiza `src/[feature]/entities/[feature].entity.ts` siguiendo las reglas del DBA:

**Checklist antes de generar migración:**
- [ ] `@PrimaryGeneratedColumn('uuid')` en el campo `id`.
- [ ] Columnas de timestamp usan `timestamptz`: `@CreateDateColumn({ type: 'timestamptz' })`.
- [ ] Foreign keys tienen `@Index()`.
- [ ] Columnas de búsqueda frecuente tienen `@Index()`.
- [ ] Valores money usan `decimal` con `precision: 10, scale: 2`.
- [ ] Strings cortos usan `varchar` con `length: 255`.
- [ ] Strings largos usan `text`.
- [ ] Soft delete usa `@DeleteDateColumn`, no columna boolean `isDeleted`.
- [ ] `onDelete` definido en todas las `@ManyToOne`.

---

### Fase 3: Generación de Migración

```bash
npm run migration:generate -- --name=[DescriptiveName]
# Ejemplo: npm run migration:generate -- --name=CreateNewsArticleTable
```

---

### Fase 4: Auditoría SQL

Abre el archivo generado en `src/database/migrations/` y verifica línea por línea:

**Checklist de auditoría:**
- [ ] Nombre de tabla en `snake_case` plural.
- [ ] Columnas en `snake_case`.
- [ ] PK es `UUID` no `serial` (integer).
- [ ] Timestamps son `TIMESTAMP WITH TIME ZONE` no `TIMESTAMP` plain.
- [ ] FKs tienen `ON DELETE CASCADE` o `ON DELETE SET NULL` según el diseño.
- [ ] `CREATE INDEX` generado para cada `@Index()`.
- [ ] `UNIQUE CONSTRAINT` o `UNIQUE INDEX` para columnas `{ unique: true }`.
- [ ] No hay data migration mezclada (si se necesita backfill, crear migración separada).
- [ ] El método `down()` revierte correctamente (`DROP TABLE`, `DROP COLUMN`, etc.).

---

### Fase 5: Ejecución

Solo ejecutar si la auditoría fue aprobada:

```bash
# Verificar migraciones pendientes
npm run typeorm:show

# Ejecutar
npm run typeorm:run

# Verificar que la tabla fue creada correctamente
# (consultar la DB o revisar el log de la migración)
```

---

### Fase 6: Entrega

```markdown
### 🗄️ Migración Ejecutada: [MigrationName]

**Tabla creada:** `[table_name]`
**Migración:** `src/database/migrations/[timestamp]-[MigrationName].ts`

**Índices creados:**
- `IDX_[table]_[column]` — [razón del índice]

**Checklist de auditoría:** ✅ Todos los puntos verificados

**Próximo paso:** `/implement-feature` — Implementar repositorio y servicio.
```
