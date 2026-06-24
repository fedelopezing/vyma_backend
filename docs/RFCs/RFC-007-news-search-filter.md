# RFC-007: Buscador Bilingüe y Filtro Obligatorio por Empresa en Módulo News

Este documento detalla la propuesta técnica para implementar la búsqueda por texto libre y el filtrado por empresa en la API pública de Noticias (`GET /api/v1/news`), de acuerdo con los requisitos del [PRD-noticias.md](file:///c:/Users/fedel/NestJs/vyma_backend/docs/PRDs/PRD-noticias.md).

---

## 1. Título y Contexto

* **Funcionalidad:** Buscador bilingüe e isolación por empresa en el módulo de Noticias (`News`).
* **Objetivo de Negocio:** Permitir a los usuarios del portal web público buscar artículos relevantes utilizando términos en texto libre y ver solo las noticias asociadas a la empresa (tenant) a la que acceden.
* **Problema que Resuelve:** 
  1. La API pública actual `/news` no soporta búsquedas por texto ni obliga a filtrar por `companyId`, lo que vulnera el aislamiento de inquilinos (multi-tenancy) en la visualización de noticias.
  2. La búsqueda de texto libre debe ser tolerante a mayúsculas, minúsculas y acentos en ambos idiomas (español/inglés) tanto en el título como en el resumen de la noticia.

---

## 2. Propuesta Arquitectónica y Diseño Técnico

### A. Búsqueda Insensible a Acentos y Casing (PostgreSQL `unaccent` + `ILIKE`)
Para lograr una búsqueda insensible a acentos e insensible a mayúsculas/minúsculas, habilitaremos la extensión `unaccent` de PostgreSQL mediante una migración de base de datos.
La consulta SQL en el `QueryBuilder` utilizará la función `unaccent` tanto en las columnas de la base de datos como en el parámetro de búsqueda proporcionado por el usuario:
```typescript
query.andWhere(
  '(unaccent(news.tituloEs) ILIKE unaccent(:q) OR ' +
  'unaccent(news.tituloEn) ILIKE unaccent(:q) OR ' +
  'unaccent(news.resumenEs) ILIKE unaccent(:q) OR ' +
  'unaccent(news.resumenEn) ILIKE unaccent(:q))',
  { q: `%${q}%` }
);
```

### B. Validación del Filtro Obligatorio de Empresa (`companyId`)
Para proteger el aislamiento, el controlador público exigirá explícitamente que el parámetro `companyId` esté presente en la consulta (`Query`). Si está ausente, retornará inmediatamente un error `BadRequestException (400)`.

---

## 3. Cambios Propuestos

### Modificaciones en el Código Existente

#### 1. DTO de Paginación: [news-pagination.dto.ts](file:///c:/Users/fedel/NestJs/vyma_backend/src/news/dto/news-pagination.dto.ts)
* Agregar el parámetro opcional `q` (búsqueda) con validación `@IsString()` y `@IsOptional()`.

#### 2. Servicio de Noticias: [news.service.ts](file:///c:/Users/fedel/NestJs/vyma_backend/src/news/news.service.ts)
* Modificar `buildPaginatedQuery()` para recibir el parámetro `q` del `NewsPaginationDto`.
* Aplicar el filtro `unaccent` sobre las columnas `tituloEs`, `tituloEn`, `resumenEs`, `resumenEn` cuando `q` esté definido.

#### 3. Controlador de Noticias: [news.controller.ts](file:///c:/Users/fedel/NestJs/vyma_backend/src/news/news.controller.ts)
* Modificar el endpoint `findAll` para validar que `companyId` esté presente en el query string de la petición. Lanza `BadRequestException` si no se provee.

#### 4. Nueva Migración de Base de Datos
* Crear una migración en `src/database/migrations` para habilitar la extensión `unaccent` en PostgreSQL.

---

## 4. Plan de Implementación Atómico

### Tarea 1: Base de Datos (Habilitar extensión)
- [ ] Crear migración para ejecutar: `CREATE EXTENSION IF NOT EXISTS unaccent;`

### Tarea 2: DTOs
- [ ] Modificar [news-pagination.dto.ts](file:///c:/Users/fedel/NestJs/vyma_backend/src/news/dto/news-pagination.dto.ts) agregando el campo `q?: string`.

### Tarea 3: Lógica de Negocio
- [ ] Modificar `buildPaginatedQuery` en [news.service.ts](file:///c:/Users/fedel/NestJs/vyma_backend/src/news/news.service.ts) para procesar la búsqueda por `q` usando `unaccent`.
- [ ] Modificar el endpoint `findAll` en [news.controller.ts](file:///c:/Users/fedel/NestJs/vyma_backend/src/news/news.controller.ts) para validar la presencia obligatoria de `companyId`.

### Tarea 4: Pruebas Unitarias
- [ ] Actualizar [news.service.spec.ts](file:///c:/Users/fedel/NestJs/vyma_backend/src/news/news.service.spec.ts) para verificar la búsqueda con `q` y el filtrado por `companyId`.
- [ ] Actualizar [news.controller.spec.ts](file:///c:/Users/fedel/NestJs/vyma_backend/src/news/news.controller.spec.ts) para validar el comportamiento del endpoint público con/sin `companyId` y con parámetro `q`.

### Tarea 5: Validación
- [ ] Ejecutar `npm run lint` para asegurar código limpio.
- [ ] Ejecutar `npm run test:cov` para asegurar que todas las pruebas pasen con cobertura global ≥ 78%.
- [ ] Ejecutar `npm run build` para compilar.

---

## 5. Plan de Verificación

### Pruebas Unitarias
* `npm run test:cov`
* Casos específicos a testear:
  1. `GET /news` sin `companyId` lanza un error HTTP 400 Bad Request.
  2. `GET /news` con `companyId` exitoso.
  3. `GET /news` con parámetro `q` busca correctamente usando `unaccent` sobre títulos y resúmenes.
