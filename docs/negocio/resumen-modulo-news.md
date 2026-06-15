# Resumen Ejecutivo: Módulo de Noticias (News)

Este documento detalla el propósito de negocio, la arquitectura técnica y el comportamiento del módulo `news` en el sistema.

---

## 1. Propósito de Negocio

El módulo `news` gestiona el ciclo de vida del contenido informativo de la plataforma (noticias y comunicados). Permite la redacción bilingüe (Español e Inglés), la administración de borradores y la publicación final de las noticias, integrando notificaciones a plataformas externas (Astro) para la regeneración de contenido web estático.

En la arquitectura multi-tenant, cada noticia está vinculada de manera obligatoria a una empresa (`Company`) mediante su `companyId`.

---

## 2. Flujo de Entrada (Endpoints y API)

Existen dos contextos de consumo expuestos en `POST/GET/PUT/DELETE` bajo `api/v1/news`:

### Endpoints Públicos (Clientes)
*   `GET /api/v1/news`: Retorna la lista paginada de noticias publicadas. Es un endpoint público **cross-tenant** (no filtra por `companyId`, lo que permite ver noticias publicadas de todas las empresas de la plataforma).
*   `GET /api/v1/news/:slug`: Obtiene el detalle de una noticia específica utilizando su slug (único tanto en español como en inglés).

### Endpoints Administrativos (Filtrados por Tenant)
Están protegidos secuencialmente por `JwtAuthGuard` y `TenantGuard` para garantizar el aislamiento entre empresas:
*   `GET /api/v1/news/admin`: Retorna todas las noticias (borradores, publicadas, etc.) con paginación, pertenecientes exclusivamente al tenant activo (`companyId`) del administrador.
*   `POST /api/v1/news`: Crea una nueva noticia. El sistema asigna automáticamente la autoría al usuario autenticado y el `companyId` a la empresa activa del JWT del administrador.
*   `PUT /api/v1/news/:id`: Actualiza el contenido, idioma o estado de una noticia perteneciente al tenant del administrador.
*   `DELETE /api/v1/news/:id`: Realiza un borrado lógico (soft-delete) de la noticia, validando el aislamiento por tenant.

---

## 3. Lógica de Negocio y Ciclo de Publicación


*   **Bilingüismo Obligatorio:** El sistema permite guardar borradores incompletos, pero valida estrictamente que una noticia contenga títulos, descripciones y contenido tanto en **español** como en **inglés** al momento de cambiar su estado a `publicado`.
*   **Generación de Eventos:** Al publicarse una noticia (o actualizarse a estado publicado), el servicio emite de forma automática el evento `news.published` conteniendo los slugs correspondientes.

---

## 4. Eventos y Listeners (Notificación Externa)

*   **`NewsPublishedEvent` (Evento):** Contiene el ID de la noticia, los slugs correspondientes (`slugEs`, `slugEn`) y el estado.
*   **`AstroWebhookListener` (Escuchador Webhook):** Escucha asíncronamente el evento `'news.published'`. 
  * Reacciona enviando una petición HTTP `POST` a un webhook externo (`ASTRO_WEBHOOK_URL`) firmado con un token de seguridad (`ASTRO_WEBHOOK_SECRET`).
  * Esta llamada notifica al frontend en Astro para que regenere estáticamente (ISR) las páginas asociadas a los slugs publicados de inmediato.
  * Captura errores de red y timeouts de manera segura para que una falla en el servidor externo no cause una caída ni un rollback de la transacción en nuestro backend.
