# 📊 Resumen Ejecutivo: Módulo de Personal (`StaffModule`)

---

### 1. Propósito y Alcance Actual (MVP - Fase 1)
El **Módulo de Personal (`StaffModule`)** centraliza la gestión del capital humano mediante un **Legajo Digital Unificado**, enfocado en su primera etapa operacional en el **Personal de Limpieza**.

#### 🔑 Capacidades Principales Implementadas:
* **Ficha Legajo Digital**: Captura de datos personales y legales (Cédula de Identidad paraguaya con validación de unicidad por empresa, Nombres, Apellidos, Contacto, Dirección, Género y Fecha de Nacimiento).
* **Parámetros Salariales y Bancarios**: Registro de Salario Base (en Guaraníes GS), Tipo de Cobro (Mensual, Por Hora, Quincenal), Cobertura IPS (Retención 9% obrera / 16.5% patronal), Nombre de Banco y Número de Cuenta para acreditaciones.
* **Ubicación y Estado Operativo**: Asignación de Sucursal/Cliente de limpieza donde presta servicios, Tipo de Contrato y Gestión de Estado (`ACTIVE`, `INACTIVE`, `ON_LEAVE`, `TERMINATED`).
* **Documentación Adjunta**: Almacenamiento seguro de documentos digitalizados (Cédulas, Contratos PDF) integrados a través de Cloudinary (`MediaModule`).
* **Preparación para App de Marcación**: Estructurado con una relación opcional `userId` para vincular fichas de empleados con cuentas de acceso del sistema cuando se despliegue la aplicación móvil en la Fase 2.

---

### 🏢 ¿Para qué empresas está activo este módulo?

1. **Biolimpieza SRL** *(Cliente Primario / Enfoque Principal)*:
   - Este módulo fue diseñado y priorizado con foco en la operación de **Biolimpieza SRL**, permitiendo la administración eficiente de su personal de servicios de limpieza desplegado en campo y en sucursales de clientes.

2. **Habilitación Dinámica para Cualquier Organización (Multi-Tenant Feature Flag)**:
   - El módulo `STAFF` ha sido incorporado formalmente al enumerador del sistema multi-tenant (`CompanyModule.STAFF`).
   - El **SuperAdmin** puede **activarlo o desactivarlo dinámicamente** para cualquier otra empresa registrada en la plataforma (como **CCPS**, **NatyNails**, u otras organizaciones futuras) a través del endpoint de gestión de módulos:
     `POST /api/v1/companies/:uuid/modules/activate` con `{ "module": "STAFF" }`.

---

### 🛡️ Arquitectura, Seguridad y Aislamiento de Datos
* **Multi-Tenancy Aislado**: Todas las operaciones están filtradas automáticamente por la empresa activa del usuario (`@ActiveCompanyId()`), garantizando el aislamiento absoluto de los datos de personal entre empresas (`Zero Cross-Tenant Data Leakage`).
* **Control de Acceso (RBAC)**: Protegido con tokens JWT y permisos declarativos (`@AuthPermissions('read:staff')` y `@AuthPermissions('write:staff')`), restringiendo el acceso exclusivamente a los roles `ADMIN` y `MANAGER`.
* **Event-Driven Architecture (EDA)**: Emite eventos de dominio como `staff.created`, `staff.updated` y `staff.status_changed` para auditorías y procesamiento asíncrono sin bloquear la API.

---

### 🚀 Roadmap de Evolución Próxima
* 🟡 **Fase 2 (Asistencia y Pre-Liquidación)**: Control de asistencia geolocalizada (Geofencing), integración con horarios/turnos (`SchedulesModule`), cómputo de horas extras y motor de cálculo de nómina paraguaya (Aporte Obrero 9%, Patronal 16.5%, Provisión de Aguinaldo 8.33%).
* 🔴 **Fase 3 (Conectividad Legal & Biometría)**: Generador automático de planillas oficiales para el estado paraguayo (REI .txt para IPS, REGOBPAT para MTESS), dispersión bancaria electrónicas (TXT/CSV), marcación por reconocimiento facial y formalización SUACE/VUE.
