# Resumen Ejecutivo: Módulo de Medios (Media)

Este documento detalla el propósito de negocio, la arquitectura técnica y el comportamiento del módulo `media` en el sistema.

---

## 1. Propósito de Negocio

El módulo `media` gestiona el procesamiento, almacenamiento centralizado y optimización de recursos multimedia (imágenes) en la nube para la plataforma Vyma. Permite a los usuarios y administradores subir imágenes desde diversos clientes (web o aplicaciones móviles) para su uso en noticias, anuncios, eventos o perfiles de la compañía.

En la arquitectura multi-tenant, los recursos se organizan de manera aislada por empresa (`Company`) utilizando el identificador activo del tenant en el servicio de almacenamiento remoto (Cloudinary).

---

## 2. Flujo de Entrada (Endpoints y API)

Los endpoints del módulo están expuestos bajo la ruta base `api/v1/media` (o `/media` según prefijo global):

### Endpoints Autenticados
Requieren autenticación obligatoria mediante token JWT (`@Auth()`). El tenant activo (`companyId`) se resuelve automáticamente a partir del usuario en sesión.

*   `POST /media/upload`: Recibe un archivo binario mediante `multipart/form-data`.
    *   **Parámetros:** 
        *   `file` (campo binario obligatorio): Archivo de imagen a subir.
        *   `folder` (campo de texto opcional): Subcarpeta de destino (ej. `news`, `profiles`, `events`, `ads`).
    *   **Respuesta:** Objeto con metadatos del recurso subido (`publicId`, `url`, `format`, `width`, `height`, `bytes`).
*   `DELETE /media`: Elimina un recurso previamente subido a la nube.
    *   **Parámetros de consulta (`Query`):** `publicId` (identificador único del recurso en Cloudinary).
    *   **Respuesta:** Objeto indicando el estado del borrado (`{ success: true }`).

---

## 3. Lógica de Negocio y Optimización de Archivos

*   **Conversión Automática a WebP:** Todas las imágenes procesadas se convierten automáticamente al formato **WebP**, garantizando una reducción significativa de tamaño sin pérdida apreciable de calidad visual.
*   **Redimensión Adaptativa:** Se aplica un escalado límite máximo de **1080px** de ancho (preservando la relación de aspecto original).
*   **Compresión Dinámica:** Se aplica ajuste automático de calidad (`quality: auto`) optimizado para la web y aplicaciones móviles.
*   **Procesamiento por Streams en Memoria:** El servidor no almacena archivos temporales en el sistema de archivos local (`disk`). Utiliza `streamifier` para transmitir directamente los buffers en memoria a Cloudinary, optimizando el rendimiento de I/O.
*   **Validaciones Estrictas:**
    *   **Formatos permitidos:** `image/jpeg`, `image/png`, `image/webp`, `image/gif`.
    *   **Límite de tamaño:** Máximo 5 MB por archivo. En caso de exceso o formato no soportado, se lanzan excepciones personalizadas (`FileTooLargeException` / `InvalidFileTypeException`).

---

## 4. Configuración y Almacenamiento Multi-Tenant

*   **Estructura en la Nube:** Los archivos se almacenan en Cloudinary siguiendo la jerarquía:
    ```text
    vyma/<companyId>/<folder>/<public_id>.webp
    ```
    Si no se especifica una subcarpeta `folder`, el recurso se ubica directamente en `vyma/<companyId>/`.
*   **Credenciales de Entorno:** El módulo utiliza la configuración inyectada desde `ConfigService` mediante el provider global `CloudinaryProvider`:
    *   `CLOUDINARY_CLOUD_NAME`
    *   `CLOUDINARY_API_KEY`
    *   `CLOUDINARY_API_SECRET`
    *   `CLOUDINARY_ROOT_FOLDER` (opcional, por defecto `vyma`)
