---
description: Workflow para auditar, verificar y hacer cumplir las reglas de CONSTITUTION.md en el código fuente.
---

# Workflow: Constitution Guardian (Guardián de la Constitución)

Este workflow es ejecutado por el Agente para asegurar el cumplimiento estricto y sin excepciones de las normas y convenciones definidas en el archivo [CONSTITUTION.md](file:///c:/Users/fedel/NestJs/vyma_backend/CONSTITUTION.md).

## Objetivo
Inspeccionar archivos creados o modificados para encontrar inconsistencias de estructura, convenciones de nomenclatura incorrectas, uso de tipos prohibidos (como `any`), decoradores en controladores no separados, inyecciones de dependencias inválidas o cualquier otra desviación de la Constitución, generando un plan de acción correctivo.

---

## Fase 1: Identificación y Selección de Archivos
*   **Gatillo:** El usuario solicita auditar un módulo, un archivo específico, o los archivos modificados en una rama/PR.
*   **Acción del Agente:** Listar los archivos que serán auditados y confirmar su ruta absoluta en el workspace.

---

## Fase 2: Auditoría Estructural y de Convención (Capa Exterior)
El Agente verificará el cumplimiento de las secciones **2 (Arquitectura Global)** y **3 (Nomenclatura)** del [CONSTITUTION.md](file:///c:/Users/fedel/NestJs/vyma_backend/CONSTITUTION.md):
1.  **Nomenclatura de Archivos:** Verificar que todos los nombres de archivo sigan el formato `kebab-case` con su correspondiente sufijo (`.controller.ts`, `.service.ts`, `.entity.ts`, `.repository.ts`, `.dto.ts`, `.exception.ts`, etc.).
2.  **Ubicación de Carpetas:** Asegurar que los componentes estén en las subcarpetas designadas del módulo (ej. excepciones en `exceptions/`, DTOs en `dto/`, repositorios en `repositories/`).
3.  **Barrel Exports:** Si el módulo tiene DTOs, verificar que exista `dto/index.ts` exportándolos todos de manera limpia.

---

## Fase 3: Auditoría de Código y Buenas Prácticas (Capa Interior)
El Agente realizará un análisis línea por línea de los archivos cargados, contrastándolos con las siguientes reglas constitucionales críticas:

### Checklist de Validación:
1.  **Tipado Estricto (Sección 11):**
    *   ¿Se utiliza `any` en firmas de métodos, propiedades o variables? *(Terminantemente Prohibido)*.
    *   ¿Los retornos de funciones y promesas están tipados explícitamente?
2.  **Decoradores Limpios en Controladores (Secciones 2.6 y 15):**
    *   ¿El controlador contiene múltiples decoradores `@ApiOperation` o `@ApiResponse` directamente en el archivo? *(Prohibido)*.
    *   Todos los decoradores de Swagger/OpenAPI deben estar agrupados con `applyDecorators()` y extraídos a `[feature]-swagger.decorators.ts`.
3.  **Inyección de Dependencias (Sección 4):**
    *   ¿Se utiliza `@Inject` sobre propiedades o inyección de atributos privados en vez de *Constructor Injection*? *(Prohibido)*.
    *   ¿Se inyectan interfaces de repositorios utilizando tokens en mayúsculas (`@Inject(USER_REPOSITORY)`)?
4.  **Aislamiento y Aislamiento Multi-Tenant (Sección 2 y resumen-multitenant.md):**
    *   ¿Los controladores contienen lógica de negocio o acceso directo a la BD? *(Prohibido)*.
    *   ¿Los controladores de negocio sensibles a la empresa tienen el guard secuencial `@UseGuards(JwtAuthGuard, TenantGuard)`?
    *   ¿Los queries en servicios/repositorios filtran obligatoriamente por el parámetro `companyId` del usuario autenticado?
5.  **Validación de Entradas en DTOs (Sección 5):**
    *   ¿Cada propiedad de los DTOs tiene al menos un decorador de `class-validator` y su correspondiente `@ApiProperty()`?
    *   ¿Las propiedades opcionales usan `@IsOptional()`?
6.  **Manejo de Errores y Excepciones (Sección 6):**
    *   ¿Se lanzan excepciones de JS genéricas (`throw new Error()`)? *(Prohibido. Deben lanzarse excepciones HTTP semánticas de NestJS o excepciones del módulo en `exceptions/`)*.
    *   ¿Se capturan y mapean los errores nativos del motor de base de datos (ej: código PG `23505` para duplicados)?

---

## Fase 4: Reporte del Guardián y Plan de Acción
El Agente generará un informe estructurado que detalla los hallazgos de la auditoría.

### Estructura del Reporte:
```markdown
# 🛡️ Reporte del Guardián de la Constitución

## 1. Archivos Auditados
- `src/[modulo]/[nombre].controller.ts`
- `src/[modulo]/dto/[nombre].dto.ts`

## 2. Inconsistencias y Desviaciones Encontradas
- **[Gravedad: Alta/Media/Baja] - [Archivo:Línea]**
  - **Regla Violada:** [Sección de la Constitución]
  - **Descripción:** [Detalle de la violación, ej: Uso de 'any' en el parámetro data]
  - **Impacto:** [Por qué esto rompe los estándares del proyecto]
  - **Corrección Propuesta:**
    ```diff
    - data: any
    + data: CreateUserDto
    ```

## 3. Plan de Acción (Correcciones)
- [ ] Task 1: [Breve descripción de la corrección a realizar]
- [ ] Task 2: [Crear el archivo de decoradores de Swagger y limpiar el controlador]
```

---

## Fase 5: Ejecución y Remediación
*   **Acción del Usuario:** Aprobar el plan de acción (o dar feedback).
*   **Acción del Agente:** Aplicar las correcciones propuestas de manera secuencial, actualizar el archivo de tareas `task.md` y verificar la salud global del proyecto ejecutando el linter y los tests.
