# PRD-02: Sistema de Noticias y Publicaciones (Ecosistema Completo) - Cámara de Comercio Paraguayo-Suiza (CCPS)

## 1. Visión General (Overview)

- **Objetivo:** Implementar un sistema de Noticias y Publicaciones dinámico y cohesionado que cierre el circuito tecnológico del portal de la CCPS. Esto permite a los administradores autenticarse y gestionar publicaciones enriquecidas desde una aplicación administrativa independiente, consumiendo APIs seguras de un backend centralizado y reflejando las novedades de forma instantánea y performante en el portal público.
- **Estructura del Ecosistema:**
  1. **Portal Web Público (Astro + React):** Renderizado de alto rendimiento para el listado y lectura de artículos.
  2. **Aplicación Web Admin (Next.js):** Interfaz protegida para la creación, edición y administración de noticias.
  3. **Servicio Backend (NestJS + PostgreSQL):** Capa lógica de APIs REST, autenticación JWT, validación de datos y almacenamiento persistente.
- **Éxito del Proyecto:**
  - Carga ultra-rápida en el portal público (Lighthouse > 95%).
  - Administración intuitiva y fluida mediante un editor visual de texto enriquecido (HTML).
  - APIs de backend robustas, protegidas con JWT y con validaciones estrictas.

---

## 2. Alcance Funcional (Scope)

El alcance de este módulo está estructurado en torno a los tres componentes del ecosistema:

### A. Portal Web Público (Astro + React Islands) - *Este Proyecto*
- [ ] **Página de Listado de Noticias (`/noticias`):**
  - **Sección Hero:** Tarjeta destacada de la noticia más reciente con imagen de portada a gran escala, metadatos (fecha, autor, categoría) y título con tipografía editorial masiva (*Inter*, tracking-tight).
  - **Grid Asimétrico de Novedades:** Tarjetas de noticias secundarias ordenadas cronológicamente utilizando el sistema "No-Line" (delimitación mediante sutiles contrastes de fondo, sin bordes oscuros).
  - **Filtro de Categorías:** Widget interactivo (isla React hydrated con `client:visible`) para filtrar los artículos instantáneamente en el cliente por tipo.
- [ ] **Página de Detalle de Noticia (`/noticias/[slug]`):**
  - **Encabezado Editorial:** Título, categoría, fecha, autor e imagen de portada optimizada mediante el componente `<Image />` de Astro.
  - **Rich Text Content Render:** Renderizado estilizado y seguro de las etiquetas HTML del cuerpo (`<strong>`, `<em>`, `<blockquote>`, `<ul>`, `<ol>`, `<img />`).
  - **Compartir Noticia:** Isla React interactiva con animaciones sutiles para copiar el enlace al portapapeles y compartir en LinkedIn o WhatsApp.
- [ ] **Internacionalización (i18n):** Enrutamiento simétrico para acceder al detalle en ambos idiomas (`/noticias/slug-es` y `/en/news/slug-en`).

### B. Aplicación Web Admin (Next.js) - *Proyecto Admin*
- [ ] **Portal de Inicio de Sesión (Login):** Pantalla limpia de autenticación por credenciales (email/password) que consume el token JWT del backend.
- [ ] **Dashboard / Listado de Gestión:**
  - Tabla interactiva que lista todas las noticias almacenadas en la base de datos (tanto borradores como publicadas).
  - Columnas: Título, Categoría, Estado (Borrador/Publicado), Fecha de Creación y Acciones (Editar/Eliminar).
  - Filtro por categoría, buscador por título y paginación.
- [ ] **Formulario de Creación / Edición de Noticias:**
  - **Campos Generales:** Categoría (Selector), URL de la Imagen de Portada, Estado (Borrador/Publicado).
  - **Campos en Español (ES):** Título, Subtítulo/Resumen, Slug (autogenerado a partir del título en español), y **Editor de Texto Enriquecido (WYSIWYG)** que genera código HTML estructurado y limpio.
  - **Campos en Inglés (EN):** Título, Subtítulo/Resumen, Slug y **Editor de Texto Enriquecido** independiente para la traducción al inglés.

### C. Servicio Backend & Base de Datos (NestJS + PostgreSQL) - *Proyecto Backend*
- [ ] **Modelo de Datos de Noticias (PostgreSQL Schema):**
  - `id`: UUID (Primary Key).
  - `slug_es` / `slug_en`: VARCHAR, únicos y autogenerados.
  - `titulo_es` / `titulo_en`: VARCHAR.
  - `resumen_es` / `resumen_en`: TEXT.
  - `contenido_es` / `contenido_en`: TEXT (guarda el HTML estructurado).
  - `imagen_portada`: VARCHAR (URL de la imagen).
  - `categoria`: ENUM (`NOTICIA`, `COMUNICADO`, `EVENTO_SOCIO`).
  - `estado`: ENUM (`BORRADOR`, `PUBLICADO`).
  - `fecha_creacion` / `fecha_actualizacion`: TIMESTAMP.
  - `autor_id`: Relación con la tabla de Usuarios/Admin.
- [ ] **REST API Endpoints:**
  - **Endpoints Públicos (Consumidos por Astro):**
    - `GET /api/v1/news` -> Devuelve listado paginado y filtrado de noticias (retorna únicamente las que están en estado `PUBLICADO`).
    - `GET /api/v1/news/:slug` -> Devuelve el detalle de una noticia específica por su slug (solo si está en estado `PUBLICADO`).
  - **Endpoints Administrativos Protegidos (Consumidos por Next.js - Requieren JWT):**
    - `GET /api/v1/news/admin` -> Devuelve todas las noticias (borradores y publicados) con paginación extendida.
    - `POST /api/v1/news` -> Crea una nueva noticia con validaciones DTO estrictas.
    - `PUT /api/v1/news/:id` -> Actualiza una noticia existente por su ID.
    - `DELETE /api/v1/news/:id` -> Elimina físicamente o por soft-delete un artículo.

---

## 3. Reglas de Negocio (Business Rules)

- **Regla 1 (Control de Visibilidad en el Portal Público):** Bajo ninguna circunstancia una noticia en estado `BORRADOR` (Draft) debe ser devuelta por los endpoints públicos de NestJS ni renderizada en el portal público de Astro.
- **Regla 2 (Sincronización Obligatoria de i18n):** Para evitar inconsistencias visuales en el portal de CCPS, el formulario en Next.js exigirá la carga obligatoria del contenido en español (ES) e inglés (EN) antes de permitir el cambio de estado a `PUBLICADO`.
- **Regla 3 (Sanitización y Prevención XSS):** 
  - El backend de NestJS debe pasar un filtro de sanitización (e.g. usando `dompurify` o `sanitize-html` en DTOs o interceptores) para remover cualquier etiqueta `<script>`, `onload`, o código javascript inyectado maliciosamente antes de guardar el HTML en Postgres.
  - El portal público de Astro utilizará un renderizado directo seguro tras verificar el origen de confianza de la API.
- **Regla 4 (Clasificación Estricta):** Cada artículo debe pertenecer obligatoriamente a una de estas tres categorías:
  - `NOTICIA`: Artículos institucionales o de economía bilateral.
  - `COMUNICADO`: Notas oficiales del directorio de la CCPS.
  - `EVENTO_SOCIO`: Promociones y eventos de networking de empresas asociadas.

---

## 4. Requerimientos No Funcionales (NFR)

- **Desempeño y Escalabilidad:**
  - Las peticiones del portal público de Astro a NestJS deben ser optimizadas con políticas de cache o mediante regeneración estática (ISR/SSG) en el servidor de Astro para evitar consultas redundantes a la base de datos PostgreSQL en cada hit.
  - Compresión obligatoria en tránsito de los payloads JSON.
- **Diseño Editorial "Alpine" y Contenido Enriquecido:**
  - El contenido HTML estructurado renderizado en Astro debe adoptar estilos estandarizados en `globals.css` (sangrías y borde de acento en `<blockquote>`, listas con viñetas elegantes en `<ul>`/`ol`, y negritas de alto contraste).
  - Cero bordes de grilla pesados de 1px. Todo debe fluir con el concepto "No-Line".
- **Metadatos e Indexación (SEO):**
  - El backend de NestJS debe proveer metadatos limpios en la API (Título y Resumen) para que Astro los inserte dinámicamente en los tags `<title>` y `<meta name="description">` de cada página de detalle de noticia.

---

## 5. Criterios de Aceptación (User Stories)

### Historia 1: Crear y Publicar Noticia Completa
- **Dado que** un Administrador de la cámara ha iniciado sesión en la Web Admin de Next.js,
- **Cuando** completa el formulario de creación escribiendo el título en español e inglés, inserta un párrafo con negritas y una cita en los editores de texto enriquecido, define la categoría como `Noticia`, sube la imagen de portada y hace clic en `Publicar`,
- **Entonces** la app Next.js debe enviar el payload sanitizado al backend de NestJS, el cual valida los datos mediante DTOs, los almacena en PostgreSQL con estado `PUBLICADO` y devuelve una respuesta HTTP 201 exitosa.

### Historia 2: Visualización en el Portal Público
- **Dado que** existe una noticia guardada en PostgreSQL con estado `PUBLICADO`,
- **Cuando** un usuario visitante ingresa a `/noticias` en el portal de Astro,
- **Entonces** el sistema debe consultar la API de NestJS, renderizar la noticia en el grid asimétrico respetando el estilo "No-Line", y al hacer clic en ella, abrir el detalle `/noticias/[slug]` mostrando el HTML enriquecido (negritas, citas) formateado con total fidelidad visual y de manera segura.

### Historia 3: Ocultar Borradores al Público
- **Dado que** un administrador crea una publicación en Next.js y decide guardarla como `BORRADOR`,
- **Cuando** un usuario común navega por el portal público de Astro o intenta adivinar el slug del borrador,
- **Entonces** el endpoint público de NestJS no debe retornar la información (devolviendo HTTP 404 en el detalle) y el artículo no aparecerá listado bajo ninguna circunstancia en la web pública.
