# RFC 012: Módulo de Gestión de Personal (Legajo de Personal de Limpieza - MVP y Roadmap)

- **Estado:** Propuesto (Draft)
- **Fecha:** 2026-07-31
- **Autor:** Principal Software Architect & Tech Lead
- **PRD de Referencia:** [PRD-modulo-personal.md](file:///c:/Users/fedel/NestJs/vyma_backend/docs/PRDs/PRD-modulo-personal.md)
- **Módulo Destino:** `src/staff/` (`StaffModule`)

---

## 1. Resumen Ejecutivo

El presente RFC define la arquitectura técnica para la implementación del **Módulo de Gestión de Personal (`StaffModule`)** en el backend NestJS de VyMA. 

Dado el alcance normativo y operativo completo descrito en el PRD (normativa paraguaya, integración IPS, MTESS, SUACE y marcación biométrica), el desarrollo se ha estructurado estratégicamente en **Fases Incrementales**.

El **MVP (Fase 1)** se focaliza exclusivamente en la **Ficha Legajo Digital de Personal de Limpieza**, gestionando sus datos biográficos, laborales, salariales y bancarios, restringido al rol `MANAGER` / `ADMIN`. El módulo queda arquitectónicamente desacoplado y preparado para incorporar la app de marcación y las declaraciones gubernamentales en fases posteriores.

---

## 2. Hoja de Ruta de Evolución (Roadmap por Fases)

```mermaid
graph TD
    subgraph Fase 1: MVP - Legajo Digital
        F1A["CRUD Legajo Staff Member"]
        F1B["Datos Salariales & Bancarios"]
        F1C["Asignación de Sucursal de Limpieza"]
        F1D["Documentación Adjunta (Cédula/Contrato)"]
        F1E["Campo userId Opcional (Preparación App)"]
    end

    subgraph Fase 2: Control Operativo & Asistencia
        F2A["App de Marcación Geolocalizada"]
        F2B["Asignación de Horarios & Turnos"]
        F2C["Cómputo de Horas (Extras / Nocturnas)"]
        F2D["Motor de Pre-Liquidación (9% IPS / 16.5% Patronal)"]
        F2E["Alertas de Plazo 48hs (Altas/Bajas)"]
    end

    subgraph Fase 3: Integraciones Gubernamentales & Biometría
        F3A["Exportador .txt REI (IPS)"]
        F3B["Planillas REGOBPAT (MTESS)"]
        F3C["Dispersión Bancaria Electronic TXT/CSV"]
        F3D["Biometría Facial en Marcación"]
        F3E["Formalización SUACE / VUE (Formularios 1 y 2)"]
    end

    Fase 1 --> Fase 2 --> Fase 3
```

### Detalle de Fases:
- 🟢 **Fase 1 (MVP actual)**: Legajo Digital del Empleado (`StaffMember`), parámetros de salario/bancos, asignación a empresa/sucursal y gestión vía API REST para `MANAGER` / `ADMIN`.
- 🟡 **Fase 2**: Integración con `SchedulesModule`, control de asistencia en campo, cómputo de horas trabajadas y cálculo de provisiones laborales (Aguinaldo 8.33%, IPS Obrero 9% e IPS Patronal 16.5%).
- 🔴 **Fase 3**: Generación automática de archivos oficiales para el estado (REI IPS, REGOBPAT MTESS), dispersión de sueldos por banco, validación biométrica y trámites SUACE/VUE.

---

## 3. Estructura de Archivos del Módulo (`src/staff/`)

```
src/staff/
├── staff.module.ts
├── staff.controller.ts                # Controller REST protegido con RolesGuard (MANAGER, ADMIN)
├── staff.controller.spec.ts
├── staff.service.ts                   # Lógica de negocio y validaciones (CI única, etc.)
├── staff.service.spec.ts
├── constants/
│   └── staff-enums.ts                 # Enums: StaffStatus, ContractType, PaymentType, Gender
├── decorators/
│   └── staff-swagger.decorators.ts    # Documentación OpenAPI / Swagger
├── dto/
│   ├── create-staff-member.dto.ts     # DTO creación de legajo
│   ├── update-staff-member.dto.ts     # DTO actualización de legajo
│   ├── staff-member-response.dto.ts   # DTO respuesta estandarizada
│   ├── query-staff-member.dto.ts      # DTO filtrado y paginación
│   └── index.ts
├── entities/
│   └── staff-member.entity.ts         # Entidad TypeORM mapped a 'staff_members'
├── exceptions/
│   ├── staff-member-not-found.exception.ts
│   └── staff-member-duplicate-ci.exception.ts
├── interfaces/
│   └── i-staff-repository.interface.ts # Interface para Inversión de Dependencias
└── repositories/
    └── staff.repository.ts            # Repositorio personalizado TypeORM
```

---

## 4. API Endpoints

| Método | Path | Auth | Roles Permitidos | DTO Request | DTO Response | Descripción |
|:---|:---|:---|:---|:---|:---|:---|
| `GET` | `/api/v1/staff` | JWT | `ADMIN`, `MANAGER` | `QueryStaffMemberDto` | `PaginatedStaffResponseDto` | Lista paginada con filtros por nombre, CI, estado y sucursal |
| `GET` | `/api/v1/staff/:id` | JWT | `ADMIN`, `MANAGER` | — | `StaffMemberResponseDto` | Obtiene el detalle completo del legajo por ID |
| `POST` | `/api/v1/staff` | JWT | `ADMIN`, `MANAGER` | `CreateStaffMemberDto` | `StaffMemberResponseDto` | Crea un nuevo legajo de personal de limpieza |
| `PATCH` | `/api/v1/staff/:id` | JWT | `ADMIN`, `MANAGER` | `UpdateStaffMemberDto` | `StaffMemberResponseDto` | Modifica datos del legajo de personal |
| `PATCH` | `/api/v1/staff/:id/status` | JWT | `ADMIN`, `MANAGER` | `{ status: StaffStatus }` | `StaffMemberResponseDto` | Cambia el estado operativo (ACTIVO, INACTIVO, LICENCIA) |
| `DELETE` | `/api/v1/staff/:id` | JWT | `ADMIN`, `MANAGER` | — | `void` | Eliminación lógica del personal (`isActive: false` / `status: TERMINATED`) |

---

## 5. Esquema de Base de Datos

### Tabla: `staff_members`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from '../companies/entities/company.entity';
import { User } from '../users/entities/user.entity';

export enum StaffStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  TERMINATED = 'TERMINATED',
}

export enum ContractType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CASUAL = 'CASUAL',
  CONTRACTOR = 'CONTRACTOR',
}

export enum PaymentType {
  MONTHLY = 'MONTHLY',
  HOURLY = 'HOURLY',
  BIWEEKLY = 'BIWEEKLY',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

@Entity('staff_members')
export class StaffMember {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Index({ unique: true })
  @Column({ type: 'uuid', generated: 'uuid' })
  uuid: string;

  // Relación obligatoria con la Empresa Multi-tenant
  @Index()
  @Column({ type: 'bigint' })
  companyId: number;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  // Relación OPCIONAL con Usuario del sistema (preparado para futura App de Marcación)
  @Index()
  @Column({ type: 'bigint', nullable: true })
  userId: number | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User | null;

  // Datos Personales
  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Index()
  @Column({ type: 'varchar', length: 20 })
  nationalId: string; // Cédula de Identidad Paraguay

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string | null;

  @Column({ type: 'enum', enum: Gender, default: Gender.OTHER })
  gender: Gender;

  @Column({ type: 'date', nullable: true })
  birthDate: Date | null;

  // Datos Laborales
  @Column({ type: 'varchar', length: 100, default: 'Personal de Limpieza' })
  position: string;

  @Column({ type: 'enum', enum: ContractType, default: ContractType.FULL_TIME })
  contractType: ContractType;

  @Column({ type: 'enum', enum: StaffStatus, default: StaffStatus.ACTIVE })
  status: StaffStatus;

  @Column({ type: 'date' })
  hireDate: Date;

  @Column({ type: 'date', nullable: true })
  terminationDate: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  assignedLocation: string | null; // Sucursal / Cliente de limpieza asignado

  // Parámetros Salariales y Bancarios
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0.00 })
  baseSalary: number;

  @Column({ type: 'enum', enum: PaymentType, default: PaymentType.MONTHLY })
  paymentType: PaymentType;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate: number | null;

  @Column({ type: 'boolean', default: true })
  hasIpsCoverage: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bankName: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  bankAccountNumber: string | null;

  // Documentos adjuntos (URLs de Cloudinary via MediaModule)
  @Column({ type: 'jsonb', nullable: true })
  documentUrls: Array<{ title: string; url: string; category: string }> | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
```

---

## 6. Eventos de Dominio

| Evento | Cuándo se dispara | Receptores / Listeners |
|:---|:---|:---|
| `staff.created` | Tras registrar un nuevo legajo de personal | Log de auditoría |
| `staff.updated` | Al actualizar datos de legajo o salariales | Log de auditoría |
| `staff.status_changed` | Al cambiar estado (ej: de `ACTIVE` a `TERMINATED`) | Listener de alertas (preparado para aviso 48hs IPS en Fase 2) |

---

## 7. Plan de Implementación Atómico

### Tarea 1: Enums y Contratos de Repositorio (Prerequisito)
- [ ] `src/staff/constants/staff-enums.ts`
- [ ] `src/staff/interfaces/i-staff-repository.interface.ts`

### Tarea 2: Entidad y Migración TypeORM
- [ ] `src/staff/entities/staff-member.entity.ts`
- [ ] Generar migración: `npm run migration:generate -- --name=CreateStaffMembersTable`
- [ ] Auditar e inspeccionar SQL generado

### Tarea 3: DTOs y Validación
- [ ] `src/staff/dto/create-staff-member.dto.ts`
- [ ] `src/staff/dto/update-staff-member.dto.ts`
- [ ] `src/staff/dto/query-staff-member.dto.ts`
- [ ] `src/staff/dto/staff-member-response.dto.ts`
- [ ] `src/staff/dto/index.ts`

### Tarea 4: Excepciones Personalizadas
- [ ] `src/staff/exceptions/staff-member-not-found.exception.ts`
- [ ] `src/staff/exceptions/staff-member-duplicate-ci.exception.ts`

### Tarea 5: Repositorio Personalizado
- [ ] `src/staff/repositories/staff.repository.ts`

### Tarea 6: Servicio de Negocio
- [ ] `src/staff/staff.service.ts`

### Tarea 7: Decoradores de Documentación Swagger
- [ ] `src/staff/decorators/staff-swagger.decorators.ts`

### Tarea 8: Controlador REST
- [ ] `src/staff/staff.controller.ts`

### Tarea 9: Módulo Principal y Registro Global
- [ ] `src/staff/staff.module.ts`
- [ ] Registrar `StaffModule` en `src/app.module.ts`

### Tarea 10: Pruebas Unitarias y Cobertura
- [ ] `src/staff/staff.service.spec.ts`
- [ ] `src/staff/staff.controller.spec.ts`
- [ ] Ejecutar `npm run test:cov` para validar cobertura ≥ 80%
