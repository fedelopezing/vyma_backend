# RFC-015 — Módulo de Lugares (Places) con OpenStreetMap

- **Estado:** Propuesto
- **Autor:** Agente Arquitecto
- **Módulo:** `PlacesModule`

## 1. Resumen Ejecutivo

Este RFC define la integración de **OpenStreetMap (Nominatim)** como proveedor de geocodificación para reemplazar la dependencia de Google Maps API (evitando la necesidad de registrar tarjeta de crédito y gestionar facturación).

El objetivo principal es proveer autocompletado de direcciones al crear clientes, empresas, personal o sedes en el sistema.

**Decisiones Clave:**
1. **Proveedor:** API pública gratuita de OpenStreetMap (Nominatim).
2. **Caché:** Sin caché en base de datos. Se actuará como un proxy dinámico en tiempo real ya que OSM es un proyecto vivo y mantenido, y el volumen de peticiones esperado (para alta de clientes/personal) no superará los límites gratuitos (1 req/sec).
3. **Alcance Geográfico:** Restringido a Paraguay (`countrycodes=py`) para mejorar la precisión de los resultados.
4. **Fases:** Se implementa *Forward Geocoding* (texto → coordenadas) con la estructura preparada para *Reverse Geocoding* (coordenadas → texto) en el futuro.

---

## 2. Estructura del Módulo

```text
src/places/
├── places.module.ts
├── places.controller.ts           + .spec.ts
├── places.service.ts              + .spec.ts
├── decorators/
│   └── places-swagger.decorators.ts
├── dto/
│   ├── search-place.dto.ts
│   ├── place-response.dto.ts
│   └── index.ts
└── providers/
    ├── osm-nominatim.provider.ts  + .spec.ts
    └── i-places-provider.interface.ts
```

> No se incluye `entities` ni `repositories` ya que el módulo actúa como un proxy sin persistencia local.

---

## 3. Contratos de API (Endpoints)

| Method | Path | Auth | Roles | Guard | DTO Request | DTO Response |
|:---|:---|:---|:---|:---|:---|:---|
| GET | `/api/v1/places/search` | JWT | `USER, MANAGER, ADMIN` | `JwtAuthGuard` | `SearchPlaceDto` | `PlaceResponseDto[]` |
| GET | `/api/v1/places/reverse` | JWT | `USER, MANAGER, ADMIN` | `JwtAuthGuard` | `ReversePlaceDto` | `PlaceResponseDto` (Phase 2) |

---

## 4. DTOs

### Request: `SearchPlaceDto`
```typescript
export class SearchPlaceDto {
  @ApiProperty({ description: 'Texto a buscar', example: 'Shopping del Sol' })
  @IsString()
  @IsNotEmpty()
  q: string;

  @ApiPropertyOptional({ description: 'Límite de resultados', default: 5 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Max(10)
  limit?: number = 5;
}
```

### Response: `PlaceResponseDto`
```typescript
export class PlaceResponseDto {
  @ApiProperty({ example: -25.2818961 })
  lat: number;

  @ApiProperty({ example: -57.5684613 })
  lon: number;

  @ApiProperty({ example: 'Shopping del Sol, Aviadores del Chaco, Asunción' })
  displayName: string;

  @ApiPropertyOptional({ example: 'Asunción' })
  city?: string;

  @ApiPropertyOptional({ example: 'Asunción' })
  state?: string;

  @ApiPropertyOptional({ example: 'Paraguay' })
  country?: string;

  @ApiPropertyOptional({ example: 'hotel' })
  type?: string;
}
```

---

## 5. Integración con OpenStreetMap (Nominatim)

### Interfaz del Proveedor (`i-places-provider.interface.ts`)
```typescript
export interface IPlacesProvider {
  search(query: string, limit: number): Promise<PlaceResponseDto[]>;
  reverse?(lat: number, lon: number): Promise<PlaceResponseDto>;
}
```

### Implementación (`osm-nominatim.provider.ts`)

- **URL:** `https://nominatim.openstreetmap.org/search`
- **Método:** `GET`
- **Query Params:**
  - `q`: [texto a buscar]
  - `format`: `json`
  - `addressdetails`: `1`
  - `countrycodes`: `py` (Fijo para Paraguay)
  - `limit`: [limite]
- **Headers Obligatorios:** Nominatim requiere estrictamente un header `User-Agent` descriptivo para el uso público. Se configurará dinámicamente o por variable de entorno (ej. `VymaBackend/1.0 (contacto@empresa.com)`).
- **Rate Limit Local:** Nominatim exige 1 petición por segundo. Si el frontend hiciera *debounce*, el backend debería estar a salvo, pero de ser necesario, se puede implementar un throttler temporal en este módulo.

---

## 6. Manejo de Errores

- Si Nominatim responde `50x` o timeout: El backend captura el error en un bloque `try/catch`, registra el incidente vía `Logger` y retorna un error estándar de la aplicación HTTP `503 Service Unavailable` indicando fallo temporal en el proveedor de geolocalización.
- Si Nominatim retorna `[]` (cero resultados): Se retorna una lista vacía con `200 OK`.

---

## 7. Plan de Implementación Atómico

### Tarea 1: Interfaz y Proveedor OSM
- [ ] `src/places/interfaces/i-places-provider.interface.ts`
- [ ] `src/places/providers/osm-nominatim.provider.ts` (con HttpModule)
- [ ] Asegurar inyección del header `User-Agent`.

### Tarea 2: DTOs
- [ ] `src/places/dto/search-place.dto.ts`
- [ ] `src/places/dto/place-response.dto.ts`
- [ ] `src/places/dto/index.ts`

### Tarea 3: Servicio de Orquestación
- [ ] `src/places/places.service.ts` (actúa como intermediario)

### Tarea 4: Controlador y Decoradores
- [ ] `src/places/decorators/places-swagger.decorators.ts`
- [ ] `src/places/places.controller.ts`

### Tarea 5: Módulo
- [ ] `src/places/places.module.ts` (registrar `HttpModule`)
- [ ] Registrar `PlacesModule` en `src/app.module.ts`

### Tarea 6: Tests Unitarios
- [ ] Mock de Nominatim en `osm-nominatim.provider.spec.ts`
- [ ] Mocks del servicio y controlador en `places.service.spec.ts` y `places.controller.spec.ts`
- [ ] Cobertura ≥ 80%
