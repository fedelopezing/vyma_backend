# RFC-009: Módulo de Ad Banner — Espacio Publicitario

| Campo        | Valor                                       |
|:-------------|:--------------------------------------------|
| **RFC**      | RFC-009                                     |
| **Feature**  | ads                                         |
| **PRD**      | PRD-06: Ad Banner (Espacio Publicitario)    |
| **Autor**    | Antigravity (Principal Architect)           |
| **Estado**   | PROPUESTO                                   |
| **Fecha**    | 2026-07-04                                  |
| **Versión**  | 1.0                                         |

---

## 1. Contexto y Motivación

La CCPS (Cámara de Comercio Paraguayo-Suiza) requiere de un espacio publicitario destacado en la página principal para que los socios o empresas visitantes puedan publicitar sus servicios o productos. Este RFC define la implementación del backend para el módulo de anuncios (`ads`), el cual proveerá los endpoints necesarios para que el frontend público (Astro) obtenga los banners activos de forma dinámica y para que el frontend administrativo (Next.js) gestione los anuncios de forma segura.

### Decisiones de diseño clave (resultado del Q&A)

| # | Pregunta | Decisión |
|:--|:---|:---|
| **1** | **Multi-tenancy** | Siempre se utiliza `companyId` para aislar la información. Los anuncios se asocian a una empresa específica (`company_id`). |
| **2** | **Límite de Banners Activos** | **Opción B:** El backend permite registrar y activar múltiples banners. El límite de 5 banners activos simultáneos se aplica en el endpoint público (`GET /ads/active`), el cual devolverá como máximo 5 anuncios ordenados por el campo `order ASC` y `createdAt DESC`. |
| **3** | **Campos de Localización (i18n)** | El modelo de datos contará con campos de imágenes y enlaces separados por idioma (`imageUrlEs`, `imageUrlEn`, `linkUrlEs`, `linkUrlEn`, `altEs`, `altEn`) para soportar banners bilingües. |
| **4** | **Almacenamiento de Imágenes** | Las imágenes se almacenan en Cloudinary. El frontend sube las imágenes directamente y envía las URLs finales al backend en los DTOs de creación y actualización (reutilizando el patrón existente de noticias y eventos). |
| **5** | **Roles y Autorización** | El rol de **Manager por compañías** tendrá permisos para administrar el catálogo de anuncios. Se definirán permisos específicos (`read:ads`, `write:ads`, `create:ads`, `update:ads`, `delete:ads`) asignados a los roles `admin` y `manager` de cada empresa. |

---

## 2. Estructura de Archivos

El módulo de anuncios se estructurará siguiendo los estándares del proyecto NestJS:

```
src/ads/
├── ads.module.ts
├── ads.controller.ts             + .spec.ts
├── ads.service.ts                + .spec.ts
├── constants/
│   └── ads.constants.ts
├── decorators/
│   └── ads-swagger.decorators.ts
├── dto/
│   ├── create-ad.dto.ts
│   ├── update-ad.dto.ts
│   ├── ad-response.dto.ts
│   ├── ads-pagination.dto.ts
│   └── index.ts
├── entities/
│   └── ad.entity.ts
├── exceptions/
│   └── ad-not-found.exception.ts
├── interfaces/
│   └── i-ad-repository.interface.ts
└── repositories/
    └── ad.repository.ts
```

---

## 3. API Endpoints

| Method | Path | Auth | Permiso | DTO Request | DTO Response |
|:---|:---|:---|:---|:---|:---|
| `GET` | `/ads/active` | Public | — | Query: `companyId` (obligatorio) | `AdResponseDto[]` (Max 5 items) |
| `GET` | `/ads/admin` | JWT | `read:ads` | `AdsPaginationDto` | `PaginatedResponse<AdResponseDto>` |
| `POST` | `/ads/admin` | JWT | `create:ads` | `CreateAdDto` | `AdResponseDto` |
| `PUT` | `/ads/admin/:id` | JWT | `update:ads` | `UpdateAdDto` | `AdResponseDto` |
| `DELETE` | `/ads/admin/:id` | JWT | `delete:ads` | — | `void` (204 No Content) |

### Notas de diseño de endpoints
* **Orden Público (`GET /ads/active`):** Retorna una lista con un máximo de 5 anuncios activos (`isActive = true`), ordenados por `order ASC` y `createdAt DESC`. Requiere el parámetro de consulta `companyId` para filtrar por tenant.
* **Aislamiento por Tenant (Admin):** Los endpoints bajo `/ads/admin` están protegidos por `TenantGuard`, el cual inyecta y restringe el `companyId` del usuario autenticado (JWT).
* **Conflicto de Rutas:** El endpoint `/ads/active` se posiciona en una ruta separada de la administración para evitar colisiones con identificadores UUID de anuncios en `/ads/admin/:id`.

---

## 4. Esquema de Base de Datos

### 4.1 Tabla: `ads`

```sql
CREATE TABLE ads (
  id             UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url_es   VARCHAR(500)  NOT NULL,                      -- URL de Cloudinary para banner en Español
  image_url_en   VARCHAR(500),                                -- URL de Cloudinary para banner en Inglés (opcional)
  link_url_es    VARCHAR(500),                                -- Enlace de redirección para Español
  link_url_en    VARCHAR(500),                                -- Enlace de redirección para Inglés
  alt_es         VARCHAR(255),                                -- Texto alternativo para Español (Accesibilidad)
  alt_en         VARCHAR(255),                                -- Texto alternativo para Inglés (Accesibilidad)
  is_active      BOOLEAN       NOT NULL DEFAULT true,         -- Estado de publicación
  "order"        INTEGER       NOT NULL DEFAULT 0,            -- Orden de prioridad en carrusel
  company_id     BIGINT        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),
  deleted_at     TIMESTAMPTZ,                                 -- Soporte para soft delete
  CONSTRAINT FK_ads_companies FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX IDX_ads_active_carousel ON ads (company_id, is_active, "order", created_at) WHERE deleted_at IS NULL;
CREATE INDEX IDX_ads_company ON ads (company_id);
```

### 4.2 TypeORM Entity (`src/ads/entities/ad.entity.ts`)

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

@Entity('ads')
@Index('IDX_ads_active_carousel', ['companyId', 'isActive', 'order', 'createdAt'])
export class Ad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 500, name: 'image_url_es', comment: 'Cloudinary URL for ES' })
  imageUrlEs: string;

  @Column('varchar', { length: 500, name: 'image_url_en', nullable: true, comment: 'Cloudinary URL for EN' })
  imageUrlEn: string | null;

  @Column('varchar', { length: 500, name: 'link_url_es', nullable: true })
  linkUrlEs: string | null;

  @Column('varchar', { length: 500, name: 'link_url_en', nullable: true })
  linkUrlEn: string | null;

  @Column('varchar', { length: 255, name: 'alt_es', nullable: true })
  altEs: string | null;

  @Column('varchar', { length: 255, name: 'alt_en', nullable: true })
  altEn: string | null;

  @Column('boolean', { name: 'is_active', default: true })
  isActive: boolean;

  @Column('integer', { default: 0 })
  order: number;

  @Index()
  @Column({ name: 'company_id', type: 'bigint' })
  companyId: number;

  @ManyToOne(() => Company, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
```

---

## 5. Eventos de Dominio

El módulo emitirá eventos de dominio para auditoría de cambios y sincronización de caché (si aplica en capas superiores):

| Evento | Cuándo | Payload |
|:---|:---|:---|
| `ad.created` | Tras registrar un anuncio exitosamente | `{ adId: string, companyId: number }` |
| `ad.updated` | Tras actualizar campos de un anuncio | `{ adId: string, companyId: number }` |
| `ad.deleted` | Tras realizar soft delete de un anuncio | `{ adId: string, companyId: number }` |

---

## 6. Plan de Implementación Atómico

A continuación se detalla el plan paso a paso para la correcta construcción e integración del módulo:

### Tarea 1: Interfaces y Contratos
- [x] Crear la interfaz del repositorio: `src/ads/interfaces/i-ad-repository.interface.ts`
- [x] Definir el token de inyección en constantes: `src/ads/constants/ads.constants.ts`

### Tarea 2: Entidad y Migración de Base de Datos
- [x] Crear la entidad de TypeORM: `src/ads/entities/ad.entity.ts`
- [x] Generar migración de base de datos: `npm run migration:generate -- --name=CreateAdsTable`
- [x] Auditar SQL generado en la migración.

### Tarea 3: Modificación del Seed de Roles y Permisos
- [x] Añadir permisos (`read:ads`, `write:ads`, `create:ads`, `update:ads`, `delete:ads`) en `src/seed/data/roles.seed-data.ts`.
- [x] Asociar los nuevos permisos a los roles `admin` y `manager`.
- [x] Registrar la tabla `ads` en el orden de limpieza de seeds (`SEED_TABLES_ORDER`).

### Tarea 4: Data Transfer Objects (DTOs)
- [x] Crear DTO de creación: `src/ads/dto/create-ad.dto.ts` (con validaciones de URL, tipos, etc.)
- [x] Crear DTO de actualización: `src/ads/dto/update-ad.dto.ts`
- [x] Crear DTO de respuesta: `src/ads/dto/ad-response.dto.ts`
- [x] Crear DTO de paginación: `src/ads/dto/ads-pagination.dto.ts`
- [x] Exportar DTOs mediante indexador: `src/ads/dto/index.ts`

### Tarea 5: Excepciones Personalizadas
- [x] Crear la excepción: `src/ads/exceptions/ad-not-found.exception.ts`

### Tarea 6: Repositorio TypeORM
- [x] Crear repositorio e implementar persistencia: `src/ads/repositories/ad.repository.ts`

### Tarea 7: Servicio de Negocio
- [x] Crear el servicio: `src/ads/ads.service.ts`
- [x] Implementar la lógica para obtener los anuncios activos con límite de 5 (`take(5)`).
- [x] Implementar la lógica CRUD de administración acoplada al tenant (`companyId`).

### Tarea 8: Decoradores de Swagger
- [x] Crear decoradores para documentación de API: `src/ads/decorators/ads-swagger.decorators.ts`

### Tarea 9: Controlador
- [x] Crear el controlador REST: `src/ads/ads.controller.ts`
- [x] Configurar anotaciones de autenticación, permisos y guards (`TenantGuard`, `AuthPermissions`).

### Tarea 10: Módulo NestJS y Registro Global
- [x] Crear el módulo de publicidad: `src/ads/ads.module.ts`
- [x] Importar y registrar `AdsModule` en `src/app.module.ts`

### Tarea 11: Cobertura de Pruebas Unitarias
- [x] Crear pruebas unitarias para el controlador: `src/ads/ads.controller.spec.ts`
- [x] Crear pruebas unitarias para el servicio: `src/ads/ads.service.spec.ts`
- [x] Ejecutar cobertura y asegurar un mínimo del 80%: `npm run test:cov`
