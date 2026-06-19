---
description: Diagnostica y resuelve bugs del backend NestJS usando RCA estructurado.
---

# Workflow: `/troubleshoot-bug` — Diagnóstico y Resolución de Bugs (NestJS Backend)

Este workflow asiste al agente adoptando el rol de **L3 Support & Bug Hunter Specialist** para diagnosticar, aislar y resolver defectos en el backend de forma atómica.

- **Comando:** `/troubleshoot-bug`
- **Contexto requerido:** Descripción del bug, endpoint afectado, y rol del usuario que lo reportó.

---

## 📋 Instrucciones para el Agente

### Fase 1: Triage

Pide al usuario (si no lo proveyó):
1. **Endpoint exacto**: `[METHOD] /path` y cuerpo de la request.
2. **Rol del usuario**: ¿Anónimo? ¿Admin? ¿Manager?
3. **Síntoma exacto**: Status code recibido + body de respuesta de error.
4. **Frecuencia**: ¿Siempre? ¿Solo con ciertos datos?

Clasifica severidad:
- 🔴 P0: Seguridad comprometida, datos perdidos.
- 🟠 P1: Feature principal rota.
- 🟡 P2: Dato incorrecto o degradación parcial.
- 🟢 P3: Warning, log incorrecto, cosmético.

---

### Fase 2: Diagnóstico por Tipo de Error

#### Si es 403 Forbidden:
1. Lee el controller: `@UseGuards(...)` y `@Roles(...)`.
2. Verifica que `@Public()` no esté en un endpoint que debería ser privado.
3. Verifica el valor del enum `Role` que el token del usuario tiene vs. el requerido.

#### Si es 400 Bad Request:
1. Lee el DTO correspondiente.
2. Busca la propiedad que falla la validación en el mensaje de error.
3. Verifica `whitelist: true` — ¿está enviando un campo no declarado en el DTO?

#### Si es 404 Not Found:
1. Lee el servicio `findOne`/`findBySlug`.
2. Verifica que el repositorio retorna `null` correctamente.
3. Verifica que la excepción es `NotFoundException` correctamente tipada.

#### Si es 500 Internal Server Error:
1. Busca el `try/catch` en el servicio.
2. Busca el log del error en `nest.log` o consola.
3. Traza si el error viene de la BD (código de error PostgreSQL).

#### Si es un N+1 query:
1. Busca en el repositorio `findAll` y `findOne`.
2. Verifica si falta `relations` o un `leftJoinAndSelect`.

---

### Fase 3: Fix Atómico

Solo modifica los archivos directamente responsables del bug.

---

### Fase 4: Anti-Regresión

```bash
npm run test -- --testPathPattern=src/[feature]/
npm run test:cov
```

Añade test case que cubra el bug.

---

### Fase 5: Entrega del Reporte

```markdown
### 🐛 Bug Resuelto: [Título]

- **Severidad:** [P0/P1/P2/P3]
- **Endpoint:** `[METHOD] /[path]`

#### Root Cause
**Archivo:** `[filepath#LN]`
**Causa:** [explicación técnica]

#### Fix Aplicado
- `[filepath]` — [qué se cambió]

#### Anti-Regresión
- Test añadido: ✅
- `npm run test` resultado: ✅

#### Impacto en Consumidores
- Astro `swisschampy`: [ninguno / actualizar types]
- Next.js admin: [ninguno / actualizar types]
```
