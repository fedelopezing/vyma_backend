# Tareas de Desarrollo: Sistema de Noticias y Publicaciones (RFC-002)

Esta plantilla fue generada por el **Agente Tech-Lead** a partir del RFC-002 aprobado. Sirve como contrato de desarrollo para el **Agente Desarrollador Backend**, promoviendo un flujo de trabajo auto-testeado capa por capa para facilitar la creación de **Pull Requests (PRs) independientes por fase**.

## Estado del Módulo
- [ ] **Fase 0: Preparación y Dependencias**
  - [ ] Tarea 0.1: Instalar dependencias externas (`sanitize-html`, `slugify`)
  - [ ] Tarea 0.2: Generar el skeleton del módulo `News` con el CLI de NestJS
- [ ] **Fase 1: Base de Datos & Persistencia**
  - [ ] Tarea 1.1: Crear Entidades TypeORM (`News`)
  - [ ] Tarea 1.2: Registrar entidad en el módulo y generar/ejecutar la migración
- [ ] **Fase 2: Dominio & Lógica de Negocio (Auto-testeado)**
  - [ ] Tarea 2.1: Crear decorador `@SanitizeHtml()` y helper `slugify`
  - [ ] Tarea 2.2: Crear la clase del evento `NewsPublishedEvent`
  - [ ] Tarea 2.3: Implementar `NewsService` con toda la lógica de negocio
  - [ ] Tarea 2.4: Escribir Pruebas Unitarias del Servicio (`news.service.spec.ts`)
- [ ] **Fase 3: API & Controladores (Auto-testeado)**
  - [ ] Tarea 3.1: Definir DTOs (`CreateNewsDto`, `UpdateNewsDto`, `NewsPaginationDto`)
  - [ ] Tarea 3.2: Implementar `NewsController` con todos los endpoints REST
  - [ ] Tarea 3.3: Escribir Pruebas Unitarias del Controlador (`news.controller.spec.ts`)
- [ ] **Fase 4: Eventos & Integraciones (Auto-testeado)**
  - [ ] Tarea 4.1: Implementar `AstroWebhookListener`
  - [ ] Tarea 4.2: Escribir Pruebas Unitarias del Listener (`astro-webhook.listener.spec.ts`)
- [ ] **Fase 5: Verificación E2E Final**
  - [ ] Tarea 5.1: Pruebas Manuales E2E (Postman / cURL)

---

## ⚙️ Fase 0: Preparación y Dependencias

### Tarea 0.1: Instalar dependencias externas
- **Descripción:** Instalar las librerías `sanitize-html` (para prevención de XSS) y `slugify` (para generación de slugs limpios y consistentes a partir de texto bilingüe), incluyendo sus tipos para TypeScript.
- **Comandos a ejecutar:**
  ```bash
  npm install sanitize-html slugify
  npm install --save-dev @types/sanitize-html
  ```
- **Criterios de Aceptación:**
  - Ambas librerías aparecen en `dependencies` del `package.json`.
  - `@types/sanitize-html` aparece en `devDependencies`.
  - El servidor `npm run start:dev` levanta sin errores de importación.

### Tarea 0.2: Generar el skeleton del módulo `News` con el CLI de NestJS
- **Descripción:** Usar el CLI de NestJS para generar la estructura base del módulo, servicio y controlador para no crearlos manualmente y evitar errores de boilerplate.
- **Comandos a ejecutar:**
  ```bash
  nest g mo news
  nest g s news --no-spec
  nest g co news --no-spec
  ```
- **Archivos a crear:**
  - `src/news/news.module.ts`
  - `src/news/news.service.ts`
  - `src/news/news.controller.ts`
- **Criterios de Aceptación:**
  - El `NewsModule` es automáticamente importado en `AppModule`.
  - El servidor `npm run start:dev` levanta sin errores de módulo.

---

## 🗄️ Fase 1: Base de Datos y Persistencia

### Tarea 1.1: Crear Entidades TypeORM (`News`)
- **Descripción:** Definir la entidad `News` exactamente como está especificada en la RFC-002, incluyendo los enums `NewsCategory` y `NewsStatus`, todas las columnas, los índices de rendimiento, la relación `@ManyToOne` con `User` y el soporte para Soft-Delete.
- **Archivos a crear:**
  - `src/news/entities/news.entity.ts`
- **Criterios de Aceptación:**
  - Enum `NewsCategory` con valores: `NOTICIA`, `COMUNICADO`, `EVENTO_SOCIO`.
  - Enum `NewsStatus` con valores: `BORRADOR`, `PUBLICADO`.
  - Columnas `slugEs` y `slugEn` con `@Index({ unique: true })`.
  - Índice compuesto `@Index(['estado', 'categoria', 'deletedAt'])` definido a nivel de clase.
  - Relación `@ManyToOne(() => User)` con `onDelete: 'RESTRICT'` y `@JoinColumn({ name: 'autor_id' })`.
  - Columnas `createdAt`, `updatedAt` y `deletedAt` (Soft-Delete con `@DeleteDateColumn`).
  - Sin uso de tipos `any`. Tipado estricto en todas las propiedades.

### Tarea 1.2: Registrar entidad en el módulo y generar/ejecutar la migración
- **Descripción:** Registrar la entidad `News` en el `TypeOrmModule.forFeature([])` dentro de `NewsModule`. Luego generar la migración SQL y ejecutarla para validar que la tabla `news` se crea correctamente en PostgreSQL con toda la estructura de columnas e índices.
- **Archivos a modificar:**
  - `src/news/news.module.ts` (añadir `TypeOrmModule.forFeature([News])`)
- **Archivos a crear:**
  - `src/database/migrations/*CreateNewsTable.ts` (generado automáticamente)
- **Comandos a ejecutar:**
  ```bash
  npm run typeorm:generate -- --name=CreateNewsTable
  npm run typeorm:run
  ```
- **Criterios de Aceptación:**
  - La migración corre sin errores.
  - La tabla `news` existe en PostgreSQL con todas sus columnas e índices.
  - El comando `npm run typeorm:run` no genera una segunda migración pendiente (schema sincronizado).

---

## 🧠 Fase 2: Dominio y Lógica de Negocio (Fase Auto-testeadora)

### Tarea 2.1: Crear el decorador `@SanitizeHtml()` y el helper `slugify`
- **Descripción:** Implementar dos utilidades reutilizables en el módulo `common`:
  1. **Decorador `@SanitizeHtml()`**: Usa `class-transformer`'s `@Transform` junto con la librería `sanitize-html` para limpiar HTML de tags y atributos maliciosos (XSS). Respetar estrictamente la whitelist de tags y atributos definida en el RFC.
  2. **Helper `slugify`**: Función pura que recibe un string, elimina caracteres especiales, acentos y diacríticos (`á` → `a`), reemplaza espacios por guiones y retorna el resultado en minúsculas.
- **Archivos a crear:**
  - `src/common/decorators/sanitize-html.decorator.ts`
  - `src/common/helpers/slugify.helper.ts`
- **Criterios de Aceptación:**
  - `@SanitizeHtml()` permite los tags: `h1`-`h6`, `p`, `a`, `ul`, `ol`, `li`, `b`, `i`, `strong`, `em`, `code`, `blockquote`, `table`, `thead`, `tbody`, `tr`, `th`, `td`, `img`, `br`, `hr`, `div`, `pre`, `strike`, `nl`, `caption`.
  - `@SanitizeHtml()` permite atributos en `<a>`: `href`, `name`, `target`; en `<img>`: `src`, `alt`, `title`, `width`, `height`, `loading`.
  - `@SanitizeHtml()` permite esquemas de URL: `http`, `https`, `mailto`.
  - La función `slugify('Título con Ñ y Acentos!')` retorna `'titulo-con-n-y-acentos'`.
  - Si el valor de entrada no es un `string`, el decorador lo retorna tal cual sin modificar.

### Tarea 2.2: Crear la clase del evento `NewsPublishedEvent`
- **Descripción:** Crear la clase DTO de evento para tipar correctamente el payload que se emite al `EventEmitter2` cuando una noticia es publicada o modificada. Este objeto será consumido por el `AstroWebhookListener`.
- **Archivos a crear:**
  - `src/news/events/news-published.event.ts`
- **Criterios de Aceptación:**
  - La clase `NewsPublishedEvent` expone al menos: `id`, `slugEs`, `slugEn`, y `estado` de la noticia.
  - El nombre del evento se define como una constante exportable (ej. `export const NEWS_PUBLISHED_EVENT = 'news.published'`).

### Tarea 2.3: Implementar `NewsService`
- **Descripción:** Implementar el servicio principal de noticias, inyectando el repositorio de TypeORM (`@InjectRepository(News)`) y el `EventEmitter2`. Implementar todos los métodos especificados en el RFC.
- **Archivos a modificar:**
  - `src/news/news.service.ts`
- **Métodos a implementar y su lógica:**

  #### `create(createNewsDto, autorId: string): Promise<News>`
  - Autogenera `slugEs` a partir de `tituloEs` usando el helper `slugify`.
  - Autogenera `slugEn` a partir de `tituloEn` (si existe) o del `slugEs`.
  - **Prevención de colisiones de slugs (Estrategia Incremental):** Consulta la BD con `LIKE 'slug-base%'`. Si hay colisión, determina el mayor sufijo numérico existente y añade `-N+1` (ej. `mi-noticia` → `mi-noticia-2`). Todo en una transacción TypeORM.
  - Asigna `autorId` desde el JWT (no del body).
  - Si `estado === NewsStatus.PUBLICADO`, emite el evento `news.published` con el `EventEmitter2` de forma asíncrona (no bloquea el return).
  - Retorna el objeto `News` guardado.
  - Lanza `BadRequestException` si se intenta publicar sin `tituloEn`, `resumenEn` o `contenidoEn`.

  #### `findAll(paginationDto: NewsPaginationDto): Promise<{ data: News[], total: number }>`
  - Solo retorna noticias con `estado === PUBLICADO` (usa `withDeleted: false`).
  - Soporta filtro opcional por `categoria`.
  - Implementa paginación con `skip` y `take` usando `page` y `limit` del DTO.
  - Ordena por `createdAt DESC`.

  #### `findAllAdmin(paginationDto): Promise<{ data: News[], total: number }>`
  - Retorna todas las noticias (borradores y publicadas), sin filtro de estado.
  - Excluye las noticias con Soft-Delete (no incluye las eliminadas).
  - Soporta filtro por `estado` y `categoria`.

  #### `findOneBySlug(slug: string): Promise<News>`
  - Busca por `slugEs` **o** `slugEn` usando una query con `WHERE (slugEs = :slug OR slugEn = :slug) AND estado = 'PUBLICADO'`.
  - Lanza `NotFoundException` si no existe o no está publicada.

  #### `update(id: string, updateNewsDto: UpdateNewsDto): Promise<News>`
  - Primero hace `findOneOrFail` por `id` (lanza `NotFoundException` si no existe).
  - Si el nuevo `estado` es `PUBLICADO`, valida que los campos bilingües (`tituloEn`, `resumenEn`, `contenidoEn`) estén presentes; lanza `BadRequestException` de lo contrario.
  - Si estaba en `BORRADOR` y se actualiza el título, regenera los slugs usando la misma lógica incremental.
  - Si el `estado` cambia a `PUBLICADO` o si ya era `PUBLICADO` y se modifica el contenido, emite el evento `news.published` de forma asíncrona.
  - Retorna la entidad actualizada.

  #### `remove(id: string): Promise<void>`
  - Busca la noticia por `id` (lanza `NotFoundException` si no existe).
  - Aplica Soft-Delete usando el método `softDelete()` del repositorio de TypeORM.
  - No retorna el objeto eliminado (solo `void`).

- **Criterios de Aceptación:**
  - Todos los métodos tienen manejo de errores con excepciones de NestJS (`NotFoundException`, `BadRequestException`).
  - No hay lógica de base de datos hardcodeada en el controlador; toda está en el servicio.
  - Los eventos se emiten de forma no bloqueante (después del `save()`, antes del `return`).

### Tarea 2.4: Escribir Pruebas Unitarias del Servicio (`news.service.spec.ts`)
- **Descripción:** Crear el archivo de pruebas unitarias del `NewsService`, mockeando el repositorio de TypeORM y el `EventEmitter2` con `@golevelup/ts-jest` o `jest.fn()`. Cubrir los flujos más críticos.
- **Archivos a crear:**
  - `src/news/news.service.spec.ts`
- **Casos de prueba requeridos:**

  | Método | Escenario a cubrir |
  |---|---|
  | `create` | ✅ Crea noticia en borrador sin campos bilingües → OK |
  | `create` | ✅ Crea noticia `PUBLICADO` con todos los campos bilingües → emite evento `news.published` |
  | `create` | ❌ Intenta publicar sin `tituloEn` → lanza `BadRequestException` |
  | `create` | ✅ Resuelve colisión de slug añadiendo sufijo `-2` |
  | `findAll` | ✅ Retorna solo noticias `PUBLICADO`, paginadas |
  | `findOneBySlug` | ✅ Encuentra noticia por `slugEs` |
  | `findOneBySlug` | ✅ Encuentra noticia por `slugEn` |
  | `findOneBySlug` | ❌ Noticia no encontrada → lanza `NotFoundException` |
  | `update` | ✅ Actualiza noticia en borrador → no emite evento |
  | `update` | ✅ Pasa de borrador a publicado → emite evento |
  | `update` | ❌ Intenta publicar sin campos bilingüe → lanza `BadRequestException` |
  | `remove` | ✅ Aplica Soft-Delete correctamente |
  | `remove` | ❌ ID no encontrado → lanza `NotFoundException` |

- **Criterios de Aceptación:**
  - Todos los tests pasan: `jest src/news/news.service.spec.ts`.
  - Cobertura de ramas (`branches`) > 80% en el servicio.
  - **Listo para PR de la Capa de Dominio.**

---

## 🔌 Fase 3: API y Controladores (Fase Auto-testeadora)

### Tarea 3.1: Definir DTOs de Entrada y Salida
- **Descripción:** Crear los tres DTOs del módulo en `src/news/dto/`:
  1. `CreateNewsDto`: Usa `class-validator`, `@ApiProperty()` y el decorador `@SanitizeHtml()` en los campos de contenido HTML. Implementa la validación condicional bilingüe con `@ValidateIf`.
  2. `UpdateNewsDto`: Extiende `PartialType(CreateNewsDto)` de `@nestjs/swagger`.
  3. `NewsPaginationDto`: DTO de query params para listado público con soporte de `page`, `limit` y `categoria`.
- **Archivos a crear:**
  - `src/news/dto/create-news.dto.ts`
  - `src/news/dto/update-news.dto.ts`
  - `src/news/dto/news-pagination.dto.ts`
- **Criterios de Aceptación:**
  - `CreateNewsDto` tiene todos los decoradores de `class-validator` definidos en el RFC.
  - Los campos `tituloEn`, `resumenEn`, `contenidoEn` usan `@ValidateIf(o => o.estado === NewsStatus.PUBLICADO)`.
  - Los campos `contenidoEs` y `contenidoEn` tienen el decorador `@SanitizeHtml()`.
  - Todos los campos están documentados con `@ApiProperty()` incluyendo `description` y `example`.
  - `NewsPaginationDto` usa `@Type(() => Number)` para transformar los query params numéricos.

### Tarea 3.2: Implementar `NewsController` con todos los endpoints REST
- **Descripción:** Crear el controlador que expone los 6 endpoints definidos en el RFC. Separar claramente los endpoints públicos de los administrativos (protegidos por JWT y rol `admin`). Documentar completamente con decoradores de Swagger.
- **Archivos a modificar:**
  - `src/news/news.controller.ts`
- **Endpoints a implementar:**

  | Decorador HTTP | Ruta | Guards | Descripción |
  |---|---|---|---|
  | `@Get()` | *(raíz)* | Ninguno (público) | Listado paginado de noticias publicadas |
  | `@Get('admin')` | `admin` | `JwtAuthGuard`, `UserRoleGuard` | Listado admin con borradores |
  | `@Get(':slug')` | `:slug` | Ninguno (público) | Detalle de noticia por slug |
  | `@Post()` | *(raíz)* | `JwtAuthGuard`, `UserRoleGuard` | Crear noticia |
  | `@Put(':id')` | `:id` | `JwtAuthGuard`, `UserRoleGuard` | Actualizar noticia |
  | `@Delete(':id')` | `:id` | `JwtAuthGuard`, `UserRoleGuard` | Eliminar noticia (soft-delete) |

- **Criterios de Aceptación:**
  - El controlador está decorado con `@ApiTags('News')` y `@Controller('api/v1/news')`.
  - Los endpoints protegidos usan `@UseGuards(AuthGuard('jwt'), UserRoleGuard)` y `@RoleProtected(ValidRoles.admin)`.
  - El endpoint `POST` retorna código `201 Created`.
  - El endpoint `DELETE` retorna código `204 No Content`.
  - El `autorId` se extrae del JWT usando el decorador `@GetUser()`, **nunca** del body del request.
  - Todos los endpoints tienen `@ApiOperation({ summary: '...' })` y `@ApiResponse({ status: ..., description: '...' })`.

### Tarea 3.3: Escribir Pruebas Unitarias del Controlador (`news.controller.spec.ts`)
- **Descripción:** Crear pruebas unitarias del `NewsController`, mockeando completamente el `NewsService`.
- **Archivos a crear:**
  - `src/news/news.controller.spec.ts`
- **Casos de prueba requeridos:**

  | Endpoint | Escenario a cubrir |
  |---|---|
  | `GET /news` | ✅ Llama a `newsService.findAll()` con el DTO de paginación y retorna el resultado |
  | `GET /news/admin` | ✅ Llama a `newsService.findAllAdmin()` con el DTO |
  | `GET /news/:slug` | ✅ Llama a `newsService.findOneBySlug(slug)` con el slug correcto |
  | `POST /news` | ✅ Llama a `newsService.create()` con el DTO y el `autorId` del usuario JWT |
  | `PUT /news/:id` | ✅ Llama a `newsService.update(id, dto)` con los parámetros correctos |
  | `DELETE /news/:id` | ✅ Llama a `newsService.remove(id)` y no retorna body |

- **Criterios de Aceptación:**
  - Todos los tests pasan: `jest src/news/news.controller.spec.ts`.
  - El mock del `NewsService` verifica que los métodos son llamados con los argumentos esperados (`toHaveBeenCalledWith`).
  - **Listo para PR de la Capa de API.**

---

## 📡 Fase 4: Eventos e Integraciones Externas (Fase Auto-testeadora)

### Tarea 4.1: Implementar `AstroWebhookListener`
- **Descripción:** Crear el listener que escucha los eventos de noticias (`news.published`) y realiza una petición HTTP al webhook de Astro para activar el prerenderizado ISR. La petición al webhook debe estar completamente aislada en un bloque `try/catch` para que nunca afecte el ciclo de vida principal de la API, incluso si Astro está caído.
- **Archivos a crear:**
  - `src/news/listeners/astro-webhook.listener.ts`
- **Variables de entorno a agregar (en `.env` y `.env.example`):**
  ```env
  ASTRO_WEBHOOK_URL=http://tu-portal-astro.com/api/revalidate
  ASTRO_WEBHOOK_SECRET=tu_secreto_compartido
  ```
- **Criterios de Aceptación:**
  - El listener está decorado con `@OnEvent('news.published')` del `EventEmitter2`.
  - Realiza un `POST` al `ASTRO_WEBHOOK_URL` con el `slugEs` y `slugEn` de la noticia en el payload.
  - El error de conexión/timeout HTTP es capturado silenciosamente con `try/catch` y se registra en el log (`Logger` de NestJS) sin relanzar la excepción.
  - La URL y el secreto del webhook se leen desde `ConfigService`/`process.env`, nunca hardcodeados.

### Tarea 4.2: Escribir Pruebas Unitarias del Listener (`astro-webhook.listener.spec.ts`)
- **Descripción:** Crear pruebas unitarias del `AstroWebhookListener`, mockeando el cliente HTTP y el `ConfigService`.
- **Archivos a crear:**
  - `src/news/listeners/astro-webhook.listener.spec.ts`
- **Casos de prueba requeridos:**

  | Escenario | Comportamiento esperado |
  |---|---|
  | ✅ Webhook responde 200 | Realiza la petición HTTP con el payload correcto y no lanza error |
  | ❌ Webhook falla con error de red | Captura el error, lo registra en el logger y **NO** relanza la excepción |
  | ❌ Webhook responde 500 | Captura el error y el listener finaliza sin propagarlo |

- **Criterios de Aceptación:**
  - Todos los tests pasan: `jest src/news/listeners/astro-webhook.listener.spec.ts`.
  - Se verifica que el logger registra el error cuando la petición falla.
  - **Listo para PR de la Capa de Integraciones.**

---

## 🧪 Fase 5: Verificación E2E Final

### Tarea 5.1: Pruebas Manuales E2E (Postman / cURL)
- **Descripción:** Verificar el comportamiento completo del módulo de noticias de extremo a extremo con la aplicación corriendo localmente. Validar tanto los flujos de éxito como las validaciones de error.
- **Checklist de verificación:**

  **Flujos de creación (autenticado como `admin`):**
  - [ ] `POST /api/v1/news` con `estado: BORRADOR` y sin campos bilingüe → **201 Created** y slug autogenerado en `slugEs`.
  - [ ] `POST /api/v1/news` con `estado: PUBLICADO` y sin `tituloEn` → **400 Bad Request** con mensaje de error descriptivo.
  - [ ] `POST /api/v1/news` con `estado: PUBLICADO` y todos los campos bilingüe → **201 Created**, ambos slugs generados, evento emitido.
  - [ ] `POST /api/v1/news` con el mismo `tituloEs` dos veces → el segundo tiene `slugEs` terminado en `-2`.
  - [ ] `POST /api/v1/news` con contenido HTML con `<script>alert('xss')</script>` → el tag `<script>` es eliminado del `contenidoEs` guardado en la BD.

  **Flujos de lectura (público):**
  - [ ] `GET /api/v1/news` → retorna solo noticias `PUBLICADO`, paginadas (10 por defecto).
  - [ ] `GET /api/v1/news?categoria=COMUNICADO` → retorna solo noticias de esa categoría.
  - [ ] `GET /api/v1/news/:slugEs` → retorna la noticia correcta.
  - [ ] `GET /api/v1/news/:slugEn` → retorna la misma noticia encontrada por el slug en inglés.
  - [ ] `GET /api/v1/news/slug-inexistente` → **404 Not Found**.

  **Flujos administrativos:**
  - [ ] `GET /api/v1/news/admin` sin JWT → **401 Unauthorized**.
  - [ ] `GET /api/v1/news/admin` con JWT de usuario no-admin → **403 Forbidden**.
  - [ ] `GET /api/v1/news/admin` con JWT de admin → retorna borradores y publicadas.
  - [ ] `PUT /api/v1/news/:id` cambia `estado` a `PUBLICADO` → el webhook de Astro es disparado (verificar en el log del servidor).
  - [ ] `DELETE /api/v1/news/:id` → **204 No Content** y el registro persiste en la BD con `deleted_at` no nulo (Soft-Delete).

  **Verificación de base de datos:**
  - [ ] Confirmar en PostgreSQL que la tabla `news` tiene las columnas e índices correctos.
  - [ ] Confirmar que el Soft-Delete no elimina el registro físicamente de la BD.
