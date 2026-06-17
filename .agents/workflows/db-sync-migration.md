---
trigger: manual
description: Database Synchronization and Migration Generation Workflow
---

# Workflow: DB Sync & Migration Generator

This workflow guides the **Database Administrator (DBA) Specialist** agent when a database entity is created or modified. It ensures database schema synchronization is done safely via TypeORM migrations, preventing schema corruption and ensuring performance indexes are present.

---

## 🔄 Workflow Steps

### 1. Phase 1: Entity & Index Validation
Before running any migration generator command:
1. Identify the created or modified entity file(s) (e.g., `src/[module]/entities/[name].entity.ts`).
2. Scan the entity class properties line-by-line.
3. Identify columns that will be frequently used:
   - In `WHERE` clauses (e.g., `email`, `uuid`, status fields, dates).
   - In `JOIN` conditions or foreign key fields (e.g., `companyId`, `userId`).
4. Verify that these columns have the `@Index()` decorator.
5. If any critical lookup or foreign key columns are missing the `@Index()` decorator, modify the entity file to add it before generating the migration.

---

### 2. Phase 2: Generate Migration via CLI
1. Determine the descriptive name of the migration (e.g., `CreateInvoiceTable` or `AddCompanyIdToNews`). Use CamelCase for the migration class name.
2. Build and propose the TypeORM migration generation command using the `package.json` scripts:
   ```bash
   npm run typeorm:generate -- src/database/migrations/MigrationName
   ```
3. Execute this command in the shell to generate the migration file inside `src/database/migrations/`.

---

### 3. Phase 3: Migration Code Audit (Crucial Validation)
Once the migration file is generated, **do not run it yet**. You must open and inspect the migration file:
1. Locate the file: `src/database/migrations/[timestamp]-[MigrationName].ts`.
2. Inspect the generated SQL code in the `up` and `down` methods line-by-line.
3. Verify that:
   - **PostgreSQL Column Types**: Check that fields map correctly to PostgreSQL-specific types (e.g., `uuid` instead of generic `varchar` if uuid is intended, `timestamp` handles timezones correctly).
   - **Defaults & Constraints**: Verify default values and constraints (e.g., `DEFAULT uuid_generate_v4()`, `NOT NULL`, `UNIQUE` constraints).
   - **Indices and Foreign Keys**: Verify index creation matches the entity definition, and foreign key relations have the correct `ON DELETE CASCADE` or `ON DELETE SET NULL` constraints.
   - **Compatibility & Backfills**: If adding a `NOT NULL` column, verify that the migration handles backfilling existing database rows before altering the column to `NOT NULL`. If not, modify the migration file to include the backfill query.

---

### 4. Phase 4: Run and Verify Schema
1. Execute the migration application command:
   ```bash
   npm run typeorm:run
   ```
2. Confirm that the migration applied successfully. If there are any errors, revert using `npm run typeorm:revert`, correct the migration file, and re-apply.
3. Verify the database state to ensure the tables, columns, indices, and constraints are fully synchronized.
