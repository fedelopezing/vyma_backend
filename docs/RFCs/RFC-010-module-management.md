# RFC-010: Administración de Módulos Activos (Feature Flags)

## 1. Contexto & Objetivos

En Vyma Backend, cada inquilino (Tenant/Company) tiene acceso limitado a un subconjunto de características del software mediante la columna `activeModules` en la entidad `Company`. El acceso a los recursos y endpoints administrativos de estos módulos es validado en tiempo de ejecución por el `ModuleAccessGuard` basándose en el listado de módulos inyectado por el `TenantGuard`.

Actualmente, no existen endpoints específicos para que el `SuperAdmin` administre (active o desactive) estos módulos de forma atómica para cada compañía. Las modificaciones deben hacerse actualizando la compañía de manera global a través del endpoint genérico `PATCH /companies/:uuid`. 

### Objetivos
1. Diseñar y proveer endpoints REST específicos y atómicos para la **activación** y **desactivación** de módulos de una compañía.
2. Limitar estos endpoints estrictamente al rol `SuperAdmin` (`isSuperAdmin: true`).
3. Validar de forma estricta los módulos solicitados utilizando el enum `CompanyModule`.
4. Garantizar la consistencia de los datos en caché invalidándola de manera proactiva al cambiar el acceso a un módulo.

---

## 2. Decisiones Técnicas & Diseño

### A. Módulo y Estructura de Archivos

Las modificaciones se realizarán dentro del módulo `companies` existente. Se agregarán los siguientes archivos y carpetas:

```
src/companies/
├── dto/
│   ├── manage-module.dto.ts               # [NEW] DTO para validar el módulo enviado en el body
│   └── index.ts                           # [MODIFY] Exportar el nuevo DTO
```

Además, se modificarán los siguientes archivos para añadir la lógica del negocio:
- `src/companies/companies.controller.ts` (Endpoints)
- `src/companies/companies.service.ts` (Lógica de servicio)
- `src/companies/decorators/companies-swagger.decorators.ts` (Documentación Swagger de los nuevos endpoints)

---

### B. API Endpoints

| Método | Path | Auth | Guard | DTO Request | DTO Response | Descripción |
|:---|:---|:---|:---|:---|:---|:---|
| POST | `/companies/:uuid/modules/activate` | JWT | SuperAdmin | `ManageModuleDto` | `Company` | Activa un módulo para la compañía dada por su UUID. |
| POST | `/companies/:uuid/modules/deactivate` | JWT | SuperAdmin | `ManageModuleDto` | `Company` | Desactiva un módulo para la compañía dada por su UUID. |

#### Autenticación y Autorización
Los endpoints requerirán el decorador `@Auth()` que valida el token JWT del SuperAdmin.
Se realizará una verificación explícita de `req.user.isSuperAdmin` en el controlador para restringir el acceso:
```typescript
if (!req.user?.isSuperAdmin) {
  throw new ForbiddenException('Only superadmin can manage company modules');
}
```

---

### C. DTOs

Se creará el DTO `ManageModuleDto` para validar que el valor del módulo provisto sea un elemento del enum `CompanyModule`:

```typescript
// src/companies/dto/manage-module.dto.ts
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CompanyModule } from '../../common/constants/modules.enum';

export class ManageModuleDto {
  @ApiProperty({
    description: 'Módulo de la compañía a administrar',
    enum: CompanyModule,
    example: CompanyModule.NEWS,
  })
  @IsEnum(CompanyModule)
  @IsNotEmpty()
  module: CompanyModule;
}
```

---

### D. Reglas de Negocio e Impacto de Desactivación

1. **Aislamiento y feature flags:**
   Al desactivar un módulo para un Tenant (ej. desactivar `ADS`), el `ModuleAccessGuard` bloqueará de forma inmediata el acceso a todos los endpoints correspondientes del tenant retornando `403 Forbidden`.
2. **Impacto en Datos Existentes (Desactivación):**
   De acuerdo con las directrices de aislamiento y consistencia de datos, **no se realiza borrado ni soft-delete en cascada** de los datos ya registrados para dicho módulo en el tenant (anuncios, noticias, eventos, etc.). La información permanece guardada y aislada de manera segura en la base de datos vinculada al `companyId`. Esto permite que si la compañía vuelve a contratar/activar el módulo en el futuro, recupere el acceso a su información histórica sin pérdida de datos.
3. **Invalidación de Caché:**
   Ambas operaciones llamarán a `CompaniesRepository.update(id, { activeModules })`. Dicho método ya invalida automáticamente las claves de caché `company:id:${id}` y `company:uuid:${uuid}`, por lo que el cambio tendrá efecto inmediato en tiempo de ejecución.
4. **Idempotencia:**
   * Si se intenta activar un módulo que ya está activo, el servicio no realizará ninguna consulta de actualización en base de datos y retornará la entidad tal como está.
   * Si se intenta desactivar un módulo que ya no está en `activeModules`, se retornará de igual forma sin realizar cambios innecesarios en base de datos.

---

## 3. Plan de Implementación Atómico

### Tarea 1: DTO de Administración
- [ ] Crear `src/companies/dto/manage-module.dto.ts`
- [ ] Exportar DTO en `src/companies/dto/index.ts`

### Tarea 2: Lógica de Negocio en Servicio
- [ ] Implementar método `activateModule(uuid: string, module: CompanyModule): Promise<Company>` en `src/companies/companies.service.ts`
- [ ] Implementar método `deactivateModule(uuid: string, module: CompanyModule): Promise<Company>` en `src/companies/companies.service.ts`

### Tarea 3: Documentación Swagger
- [ ] Agregar decoradores Swagger para `activateModule` y `deactivateModule` en `src/companies/decorators/companies-swagger.decorators.ts`

### Tarea 4: Endpoints en Controlador
- [ ] Añadir endpoint `POST /companies/:uuid/modules/activate` en `src/companies/companies.controller.ts`
- [ ] Añadir endpoint `POST /companies/:uuid/modules/deactivate` in `src/companies/companies.controller.ts`

### Tarea 5: Pruebas Unitarias
- [ ] Agregar tests para la nueva lógica en `src/companies/companies.service.spec.ts`
- [ ] Agregar tests para los nuevos endpoints en `src/companies/companies.controller.spec.ts`
- [ ] Ejecutar suite de pruebas: `npm run test` y verificar cobertura
