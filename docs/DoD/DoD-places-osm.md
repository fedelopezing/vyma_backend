# Definition of Done (DoD) - Módulo Places (OpenStreetMap)

## Objetivo
Verificar que la integración con la API de Nominatim (OpenStreetMap) funciona correctamente como proxy sin necesidad de persistencia en base de datos.

## Pruebas Manuales (Happy Path)

1. Levantar la aplicación localmente:
   ```bash
   npm run start:dev
   ```

2. Abrir Swagger en el navegador:
   `http://localhost:3000/api-docs`

3. Navegar a la sección **Places** y abrir el endpoint `GET /api/v1/places/search`.

4. Realizar una búsqueda de un lugar real en Paraguay (ej. "Shopping del Sol").
   - **Query Params:**
     - `q`: `Shopping del Sol`
     - `limit`: `5` (opcional)
   - **Expected Result:**
     - Status: `200 OK`
     - Body: Un array de objetos con `lat`, `lon`, y `displayName` correctos.
     ```json
     [
       {
         "lat": -25.2818961,
         "lon": -57.5684613,
         "displayName": "Shopping del Sol, Avenida Aviadores del Chaco...",
         "city": "Asunción",
         "type": "mall"
       }
     ]
     ```

## Pruebas de Casos Extremos (Edge Cases)

5. Realizar búsqueda sin resultados:
   - **Query Params:**
     - `q`: `LugarInexistente12345`
   - **Expected Result:**
     - Status: `200 OK`
     - Body: `[]` (Array vacío).

6. Test de Error de Proveedor (Nominatim Caído):
   - **Instrucciones:** Temporalmente, puedes cambiar el `baseUrl` en `osm-nominatim.provider.ts` a un dominio inexistente como `https://dominio-falso-para-test.com/search`.
   - **Expected Result:**
     - Status: `503 Service Unavailable`
     - Body:
       ```json
       {
         "message": "El servicio de geolocalización no está disponible temporalmente.",
         "error": "Service Unavailable",
         "statusCode": 503
       }
       ```

## Criterios de Aceptación Cumplidos
- [ ] Endpoints `/api/v1/places/search` implementados.
- [ ] Requiere autenticación JWT y roles.
- [ ] Uso de OpenStreetMap (Nominatim) sin keys privadas.
- [ ] Swagger documentado correctamente.
- [ ] Lints y Typescript build pasan.
- [ ] Cobertura de Test unitario en el provider y servicio.
