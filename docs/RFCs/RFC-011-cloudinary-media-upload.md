# RFC-011: Módulo de Gestión de Medios e Integración con Cloudinary (`MediaModule`)

- **Estado:** Propuesto
- **Fecha:** 2026-07-31
- **Autor:** Principal Software Architect & Tech Lead
- **Modulo:** `MediaModule` (`src/media/`)

---

## 1. Contexto y Propósito de Negocio

El backend de Vyma requiere un mecanismo centralizado, seguro y multi-tenant para la subida, optimización y almacenamiento de imágenes y activos multimedia en la nube (**Cloudinary**).

Dado que la plataforma alimentará aplicaciones web y futuras aplicaciones móviles (iOS/Android), centralizar la carga de imágenes en el backend previene la exposición de credenciales privadas de Cloudinary en el cliente, garantiza la estandarización de formatos (`webp`), aplica límites de tamaño y transforma automáticamente las imágenes a dimensiones óptimas (máximo 1080px).

---

## 2. Decisiones de Arquitectura

1. **Flujo de Carga (Backend Proxy / Direct Upload):**
   * El cliente realiza un request `POST /media/upload` enviando el archivo mediante `multipart/form-data` con el campo `file`.
   * El backend procesa el archivo mediante `Multer` (usando `MemoryStorage` en buffer) y lo transmite por stream directamente al SDK de Cloudinary.

2. **Optimizaciones y Transformaciones Automáticas:**
   * **Formato Estándar:** Conversión obligatoria a `webp` para reducir significativamente el peso sin perder calidad.
   * **Redimensión Inteligente:** Escala reducida si la imagen supera los `1080px` en cualquiera de sus dimensiones (modo `limit`), preservando la relación de aspecto.
   * **Calidad:** Compresión dinámica con `quality: 'auto'`.

3. **Estructura Multi-Tenant en Cloudinary:**
   * Las imágenes se organizan dinámicamente en Cloudinary según la empresa a la que pertenece el usuario:
     * `vyma/<companyUuid>/<folder_type>/` (ejemplo: `vyma/b7f3a8.../news/` o `vyma/global/profiles/`).

4. **Sin Persistencia en BD (Fase 1):**
   * No se creará una tabla de auditoría `media` en PostgreSQL por el momento. El endpoint retorna los metadatos formateados directamente de Cloudinary (`public_id`, `secure_url`, `width`, `height`, `format`, `bytes`).

---

## 3. Estructura de Archivos del Módulo (`src/media/`)

```
src/media/
├── media.module.ts
├── media.controller.ts
├── media.controller.spec.ts
├── media.service.ts
├── media.service.spec.ts
├── constants/
│   └── media.constants.ts
├── decorators/
│   └── media-swagger.decorators.ts
├── dto/
│   ├── upload-media.dto.ts
│   ├── media-response.dto.ts
│   └── index.ts
├── exceptions/
│   ├── invalid-file-type.exception.ts
│   └── file-too-large.exception.ts
├── interfaces/
│   └── cloudinary-response.interface.ts
└── providers/
    └── cloudinary.provider.ts
```

---

## 4. Configuración de Entorno

Se agregarán las siguientes variables al archivo `.env` y al `ConfigModule` de NestJS:

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
CLOUDINARY_ROOT_FOLDER=vyma
```

---

## 5. Especificación de Endpoints (API REST)

| Método | Endpoint | Autenticación | Guard | DTO Request | DTO Response | Descripción |
|:---|:---|:---|:---|:---|:---|:---|
| **POST** | `/media/upload` | JWT | `AuthGuard` | `multipart/form-data` (`file`, `folder?`) | `MediaResponseDto` | Sube y optimiza una imagen a Cloudinary. |
| **DELETE** | `/media` | JWT | `AuthGuard` | Query: `publicId` | `{ success: boolean }` | Elimina una imagen de Cloudinary por su `public_id`. |

---

## 6. DTOs e Interfaces

### `MediaResponseDto`
```typescript
export class MediaResponseDto {
  @ApiProperty({ example: 'vyma/company-uuid/news/sample_id' })
  publicId: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/.../sample.webp' })
  url: string;

  @ApiProperty({ example: 'webp' })
  format: string;

  @ApiProperty({ example: 1080 })
  width: number;

  @ApiProperty({ example: 720 })
  height: number;

  @ApiProperty({ example: 124500 })
  bytes: number;
}
```

---

## 7. Plan de Implementación Atómico

### Tarea 1: Dependencias e Interfaces
- [ ] Instalar paquetes `cloudinary` y `@types/multer`
- [ ] Crear `src/media/interfaces/cloudinary-response.interface.ts`
- [ ] Crear `src/media/constants/media.constants.ts` (`CLOUDINARY = 'Cloudinary'`)

### Tarea 2: Provider e Integración con Cloudinary
- [ ] Crear `src/media/providers/cloudinary.provider.ts` con inyección de `ConfigService`

### Tarea 3: DTOs y Excepciones
- [ ] Crear `src/media/dto/media-response.dto.ts`
- [ ] Crear `src/media/dto/upload-media.dto.ts` (si requiere parámetros adicionales como `folder`)
- [ ] Crear `src/media/dto/index.ts`
- [ ] Crear `src/media/exceptions/invalid-file-type.exception.ts`
- [ ] Crear `src/media/exceptions/file-too-large.exception.ts`

### Tarea 4: Servicio (`MediaService`)
- [ ] Crear `src/media/media.service.ts` con lógica de `uploadImage` (transformación `webp`, max 1080px, stream) y `deleteImage`
- [ ] Crear `src/media/media.service.spec.ts`

### Tarea 5: Decoradores Swagger y Controlador
- [ ] Crear `src/media/decorators/media-swagger.decorators.ts`
- [ ] Crear `src/media/media.controller.ts` usando `FileInterceptor('file')` y validación de mime-type / tamaño (max 5MB)
- [ ] Crear `src/media/media.controller.spec.ts`

### Tarea 6: Módulo y Registro Global
- [ ] Crear `src/media/media.module.ts`
- [ ] Registrar `MediaModule` en `src/app.module.ts`

### Tarea 7: Verificación
- [ ] Correr tests unitarios `npm run test` (cobertura ≥ 80%)
