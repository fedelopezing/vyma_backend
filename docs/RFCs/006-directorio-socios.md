# RFC: Directorio de Socios (RFC-006)

**Fecha:** 2026-06-19
**Autor:** Arquitecto Tech Lead
**Estado:** Draft
**Relacionado con:** RFC-004 (Multi-Tenant)

---

## 1. Visión y Objetivo

Crear una plataforma pública para visualizar los socios de la Cámara de Comercio (por defecto CCPS), mejorando el networking. Además, establecer un flujo automatizado para la recepción, revisión y aprobación de nuevas solicitudes de membresía que se integre en el ecosistema (Web pública, Admin Next.js y Backend NestJS).

## 2. Propuesta Arquitectónica

El módulo `members` permitirá gestionar la información pública de las empresas asociadas, así como el ciclo de vida de la solicitud de membresía. Al ser el sistema multi-tenant (RFC-004), toda solicitud y registro de socio debe estar vinculada a un `companyId` específico (la entidad de la Cámara de Comercio).

### Decisiones de Diseño Clave

1. **Gestión de Imágenes**: El frontend subirá el logo a Cloudinary y enviará únicamente la URL (`logoUrl`) en el payload JSON. No se utilizará `multipart/form-data` en el backend.
2. **Paginación y Ordenamiento**: La vista principal será una grilla de 4x3. Por defecto, el `GET /members` traerá un límite de `12` elementos. El orden predeterminado será primero los destacados (`isFeatured` DESC) y luego alfabético (`companyName` ASC).
3. **Seguridad Anti-Spam**: 
   - El front-end deberá enviar un token de reCAPTCHA.
   - El backend validará el token y aplicará un **Rate Limiting** por IP y por `companyId`.
4. **Notificaciones y Resiliencia**:
   - Evento `MemberApplicationReceived` enviará un correo al usuario notificando la recepción.
   - Evento `MemberApplicationStatusChanged` enviará un correo con la aprobación o rechazo.
   - Si el servicio de correos falla, se capturará la excepción y se disparará una alerta al Administrador del tenant.
5. **Concurrencia Administrativa**: Se implementará un bloqueo optimista (Optimistic Locking) usando el decorador `@VersionColumn()` de TypeORM. Si dos administradores intentan actualizar el mismo registro al mismo tiempo, el segundo recibirá un error (HTTP 409 Conflict) impidiendo que se sobrescriban los datos inadvertidamente.

---

## 3. Modelo de Datos (TypeORM Schema)

```typescript
// src/members/entities/member.entity.ts
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

export enum MemberStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  INACTIVE = 'INACTIVE',
}

export enum FeeType {
  ANNUAL = 'ANNUAL',
  SEMIANNUAL = 'SEMIANNUAL',
}

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  @Index()
  companyId: number;

  @ManyToOne(() => Company, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company; // Tenant al que pertenece esta solicitud

  @Column('varchar', { length: 255, unique: true })
  email: string;

  @Column({ type: 'enum', enum: FeeType })
  feeType: FeeType;

  @Column('varchar', { length: 255 })
  @Index()
  companyName: string;

  @Column('varchar', { length: 50 })
  taxId: string;

  @Column('varchar', { length: 255 })
  address: string;

  @Column('varchar', { length: 100 })
  city: string;

  @Column('varchar', { length: 100 })
  country: string;

  @Column('varchar', { length: 50 })
  phone: string;

  @Column('varchar', { length: 100 })
  @Index()
  category: string;

  @Column('varchar', { length: 255 })
  representativeName: string;

  @Column('varchar', { length: 255 })
  representativeEmail: string;

  @Column('varchar', { length: 50 })
  representativePhone: string;

  @Column('jsonb', { nullable: true })
  socialLinks: Record<string, string>;

  @Column('jsonb', { nullable: true })
  marketingContact: { name: string; email: string; phone?: string };

  @Column('varchar', { length: 500, nullable: true })
  logoUrl: string;

  @Column('boolean', { default: false })
  @Index()
  isFeatured: boolean;

  @Column({ type: 'enum', enum: MemberStatus, default: MemberStatus.PENDING })
  @Index()
  status: MemberStatus;

  @VersionColumn()
  version: number; // Bloqueo Optimista

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;
}
```

---

## 4. Diseño de API Endpoints

### Endpoints Públicos

| Método | Ruta | Rate Limit | Request | Response | Descripción |
|:---|:---|:---|:---|:---|:---|
| `GET` | `/members/:companyId` | Default | `limit=12`, `page`, `q` | `PaginatedMembersResponseDto` | Lista socios aprobados de una empresa. Orden: featured, alfabético. |
| `GET` | `/members/:companyId/featured` | Default | - | `MemberResponseDto[]` | Retorna únicamente los socios destacados. |
| `POST` | `/members/apply` | Custom (IP+CompanyId) | `ApplyMemberDto` (con reCAPTCHA) | `MemberResponseDto` | Envío de nueva solicitud. |

### Endpoints Administrativos (`/admin/members`)
**Requieren:** `JwtAuthGuard`, `TenantGuard`, Role `ADMIN` / `MANAGER`.

| Método | Ruta | Request | Response | Descripción |
|:---|:---|:---|:---|:---|
| `GET` | `/admin/members` | `page`, `limit`, `status` | `PaginatedMembersResponseDto` | Lista todas las solicitudes para el Tenant actual. |
| `PATCH`| `/admin/members/:id/status` | `{ status, version }` | `MemberResponseDto` | Aprueba o rechaza. Usa `version` para bloqueo optimista. |
| `PATCH`| `/admin/members/:id/featured`| `{ isFeatured, version }` | `MemberResponseDto` | Activa/Desactiva el destaque. |
| `PUT`  | `/admin/members/:id` | `UpdateMemberDto` | `MemberResponseDto` | Edita info general del socio. |

---

## 5. Eventos de Dominio

La comunicación asíncrona para notificaciones se maneja a través de la librería `EventEmitter2` de NestJS.

| Evento | Payload | Disparador | Acción Esperada (Listener) | Resiliencia |
|:---|:---|:---|:---|:---|
| `member.application.received` | `Member` | `POST /members/apply` | Envía correo de confirmación de recepción al solicitante. | Si falla, alerta al ADMIN del tenant. |
| `member.application.status-changed` | `Member`, `newStatus` | `PATCH /admin/members/:id/status` | Envía correo al solicitante informando la aprobación o rechazo. | Si falla, alerta al ADMIN del tenant. |

---

## 6. Plan de Implementación Atómico

### Tarea 1: Módulo y Estructura
- [ ] Crear `src/members/members.module.ts` y registrar en `app.module.ts`.

### Tarea 2: Entidad y Migración
- [ ] `src/members/entities/member.entity.ts`.
- [ ] Generar migración: `npm run migration:generate -- --name=CreateMembersTable`.
- [ ] Revisar que la migración incluya la columna de versión y las foreign keys.

### Tarea 3: DTOs
- [ ] `src/members/dto/apply-member.dto.ts` (Incluyendo validación de `recaptchaToken` y `companyId`).
- [ ] `src/members/dto/update-member.dto.ts`.
- [ ] `src/members/dto/member-response.dto.ts`.
- [ ] `src/members/dto/member-query.dto.ts`.

### Tarea 4: Excepciones Personalizadas
- [ ] `src/members/exceptions/member-not-found.exception.ts`.

### Tarea 5: Repositorio e Interfaces
- [ ] `src/members/interfaces/i-members-repository.interface.ts`.
- [ ] `src/members/repositories/members.repository.ts` (Implementación con TypeORM, soportando concurrencia).

### Tarea 6: Servicios y Lógica de Negocio
- [ ] `src/members/members.service.ts` (Lógica pública, paginación base 12).
- [ ] `src/members/admin-members.service.ts` (Lógica de administración con concurrencia).

### Tarea 7: Controladores y Swagger
- [ ] `src/members/members.controller.ts` (Público + Rate Limiting manual o interceptor).
- [ ] `src/members/admin-members.controller.ts` (Protegido por `TenantGuard`).
- [ ] `src/members/decorators/members-swagger.decorators.ts`.

### Tarea 8: Eventos y Listeners (Notificaciones)
- [ ] Crear los listeners para atrapar `member.application.*` y enviar los emails.
- [ ] Configurar el sistema de fallback (Alertas de Admin en caso de fallo del envío de email).

### Tarea 9: Tests Unitarios
- [ ] `src/members/members.service.spec.ts`
- [ ] `src/members/admin-members.service.spec.ts`
- [ ] Garantizar `>= 80%` coverage local.

### Tarea 10: Integración con Frontend (Documentación)
- [ ] Documentar variables de entorno si se añadió clave secreta de reCAPTCHA (`RECAPTCHA_SECRET_KEY`).
