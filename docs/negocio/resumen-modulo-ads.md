# Resumen Ejecutivo: Módulo de Banners Publicitarios (Ads)

Este documento detalla el propósito de negocio, la arquitectura técnica y el comportamiento del módulo `ads` en el sistema.

---

## 1. Propósito de Negocio

El módulo `ads` gestiona los banners y anuncios rotativos publicitarios expuestos en la página de inicio o carrusel de los portales web de cada organización (ej. CCPS). 

Permite a los administradores del inquilino subir imágenes promocionales (vinculadas opcionalmente a enlaces externos del anunciante) y controlar su estado de activación y el orden de visualización.

En la arquitectura multi-tenant, cada anuncio o banner está asignado a una organización (`Company`) mediante su `companyId`.

---

## 2. Estructura de Datos (Entidad Ad)

La entidad `Ad` consta de las siguientes propiedades:

*   **Identificación e Inquilinato:** `id` (UUID principal) y `companyId` (Tenant-scoped).
*   **Imágenes (Multilenguaje):** `imageUrlEs` (URL obligatoria de Cloudinary en español) e `imageUrlEn` (URL opcional de Cloudinary en inglés).
*   **Enlaces Externos:** `linkUrlEs` y `linkUrlEn` (redirecciones externas de anunciantes al hacer clic en el banner en su respectivo idioma).
*   **Accesibilidad (Alt Text):** `altEs` y `altEn` (textos alternativos para lectores de pantalla en español e inglés).
*   **Configuración y Orden:**
    *   `isActive` (bandera booleana para habilitar/deshabilitar la visibilidad del banner).
    *   `order` (índice entero para ordenar la visualización del carrusel de forma ascendente).
*   **Auditoría y Desactivación:** `createdAt`, `updatedAt` y `deletedAt` (soporte nativo para soft-delete).
*   **Indexado Compuesto:** Posee el índice compuesto `IDX_ads_active_carousel` sobre las columnas `[companyId, isActive, order, createdAt]` para resolver y listar los banners activos del carrusel a máxima velocidad en base de datos.

---

## 3. Flujo de Entrada (Endpoints y API)

El módulo distribuye su consumo en dos contextos bajo el prefijo `/ads`:

### A. Endpoint Público (Visualización del Carrusel)
Público y cross-tenant (no requiere token de autenticación):

*   `GET /api/v1/ads/active`: Retorna el listado de los anuncios activos para el carrusel de la compañía dada. Requiere el parámetro `companyUuid` para identificar el tenant a consultar. El servicio recupera un máximo de 5 anuncios activos y los ordena prioritariamente por el campo `order`.

### B. Endpoints Administrativos (Gestión del Dashboard)
Protegidos por autenticación JWT, aislamiento por inquilinos (`TenantGuard`) y control de módulos activos (`ModuleAccessGuard` validando que la compañía posea activo `CompanyModule.ADS`):

*   `GET /api/v1/ads/admin`: Retorna la lista paginada de todos los anuncios (tanto activos como inactivos) del tenant activo del administrador. Requiere permiso `read:ads`.
*   `POST /api/v1/ads/admin`: Crea y asocia un nuevo anuncio al tenant. Requiere permiso `create:ads`.
*   `PUT /api/v1/ads/admin/:id`: Actualiza las propiedades de un anuncio existente del inquilino (cambiar imágenes, orden, desactivar, etc.). Requiere permiso `update:ads`.
*   `DELETE /api/v1/ads/admin/:id`: Realiza el borrado lógico (soft-delete) del banner. Requiere permiso `delete:ads`.
