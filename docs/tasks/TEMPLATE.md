# Plantilla de Tareas de Desarrollo: [Nombre de la Funcionalidad] (RFC-XXX)

Esta plantilla es generada automáticamente por el **Agente Tech-Lead** a partir de un RFC aprobado. Sirve como contrato de desarrollo para el **Agente Desarrollador Backend**, promoviendo un flujo de trabajo autotesteado capa por capa para facilitar la creación de **Pull Requests (PRs) independientes por fase**.

## Estado del Módulo
- [ ] **Fase 1: Base de Datos & Persistencia**
  - [ ] Tarea 1.1: Crear Entidades de TypeORM
  - [ ] Tarea 1.2: Generar y Ejecutar Migración
- [ ] **Fase 2: Dominio & Lógica de Negocio (Auto-testeado)**
  - [ ] Tarea 2.1: Crear Interfaces de Repositorio (si aplica)
  - [ ] Tarea 2.2: Implementar Casos de Uso / Servicios
  - [ ] Tarea 2.3: Escribir Pruebas Unitarias del Servicio (`*.spec.ts`)
- [ ] **Fase 3: API & Controladores (Auto-testeado)**
  - [ ] Tarea 3.1: Definir DTOs con class-validator
  - [ ] Tarea 3.2: Implementar Controladores y Endpoints REST
  - [ ] Tarea 3.3: Escribir Pruebas Unitarias del Controlador (`*.spec.ts`)
- [ ] **Fase 4: Eventos & Integraciones (Auto-testeado)**
  - [ ] Tarea 4.1: Implementar Listeners de Eventos (Desacoplamiento)
  - [ ] Tarea 4.2: Escribir Pruebas Unitarias del Listener (`*.spec.ts`)
- [ ] **Fase 5: Verificación Manual E2E**
  - [ ] Tarea 5.1: Pruebas Manuales E2E (Postman / cURL)

---

## 🗄️ Fase 1: Base de Datos y Persistencia

### Tarea 1.1: Crear Entidades de TypeORM
- **Descripción:** Definir la clase de entidad con sus decoradores de columnas, relaciones e índices.
- **Archivos a crear/modificar:** `src/[modulo]/entities/*.entity.ts`
- **Criterios de Aceptación:**
  - Tipado estricto (sin `any`).
  - Relaciones configuradas correctamente.

### Tarea 1.2: Generar y Ejecutar Migración
- **Descripción:** Crear y aplicar la migración SQL.
- **Archivos a crear/modificar:** `src/migrations/*`
- **Criterios de Aceptación:**
  - Ejecutada exitosamente con `npm run typeorm:run`.

---

## 🧠 Fase 2: Dominio y Lógica de Negocio (Fase Auto-testeadora)

### Tarea 2.1: Implementar Interfaces de Repositorios
- **Descripción:** Definir la abstracción de acceso a datos para cumplir con el principio de Inversión de Dependencias.
- **Archivos a crear/modificar:** `src/[modulo]/interfaces/[nombre].repository.interface.ts`

### Tarea 2.2: Implementar Casos de Uso / Servicios
- **Descripción:** Escribir la lógica de negocio central del servicio, inyectando dependencias.
- **Archivos a crear/modificar:** `src/[modulo]/services/*.service.ts`
- **Criterios de Aceptación:**
  - Reglas de negocio del RFC implementadas.
  - Uso de `EventEmitter2` para lógica secundaria desacoplada.

### Tarea 2.3: Escribir Pruebas Unitarias del Servicio
- **Descripción:** Crear pruebas unitarias mockeando repositorios y servicios externos.
- **Archivos a crear/modificar:** `src/[modulo]/services/*.service.spec.ts`
- **Criterios de Aceptación:**
  - Probar flujos exitosos, casos borde y excepciones esperadas.
  - La suite de pruebas debe correr y pasar exitosamente (`npm run test` o `jest [ruta_del_test]`).
  - **Listo para PR de la Capa de Lógica de Negocio.**

---

## 🔌 Fase 3: API y Controladores (Fase Auto-testeadora)

### Tarea 3.1: Crear DTOs de Entrada y Salida
- **Descripción:** Definir objetos de transferencia de datos con validación.
- **Archivos a crear/modificar:** `src/[modulo]/dto/*.dto.ts`
- **Criterios de Aceptación:**
  - Validación con decoradores de `class-validator`.

### Tarea 3.2: Crear Controlador y Endpoints
- **Descripción:** Exponer las rutas REST, aplicar guards de seguridad (JWT, roles) e inyectar el servicio.
- **Archivos a crear/modificar:** `src/[modulo]/controllers/*.controller.ts`
- **Criterios de Aceptación:**
  - Códigos de estado HTTP semánticos y excepciones descriptivas.

### Tarea 3.3: Escribir Pruebas Unitarias del Controlador
- **Descripción:** Escribir pruebas unitarias para el controlador, mockeando el servicio de negocio.
- **Archivos a crear/modificar:** `src/[modulo]/controllers/*.controller.spec.ts`
- **Criterios de Aceptación:**
  - Probar mapeo de rutas, paso de parámetros correctos y respuestas HTTP esperadas.
  - Las pruebas deben correr y pasar exitosamente.
  - **Listo para PR de la Capa de API.**

---

## 📡 Fase 4: Eventos e Integraciones Externas (Fase Auto-testeadora)

### Tarea 4.1: Implementar Listeners de Eventos
- **Descripción:** Capturar eventos asíncronos para tareas secundarias (ej. envío de WhatsApp/Email).
- **Archivos a crear/modificar:** `src/[modulo]/listeners/*.listener.ts`

### Tarea 4.2: Escribir Pruebas Unitarias del Listener
- **Descripción:** Crear unit tests mockeando los clientes de APIs externas (ej. Resend, Twilio, WhatsApp logs).
- **Archivos a crear/modificar:** `src/[modulo]/listeners/*.listener.spec.ts`
- **Criterios de Aceptación:**
  - Las pruebas deben pasar exitosamente.
  - **Listo para PR de la Capa de Integraciones.**

---

## 🧪 Fase 5: Verificación E2E Final

### Tarea 5.1: Pruebas Manuales E2E
- **Descripción:** Validar el comportamiento completo de los endpoints mediante Postman/cURL y verificar los datos creados en PostgreSQL.
