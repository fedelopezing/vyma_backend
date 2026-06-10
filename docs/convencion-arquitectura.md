# Convenciones de Arquitectura y Buenas Prácticas - NestJS

## 1. Propósito de este Documento

Este documento establece las directrices de diseño de software, arquitectura modular, convenciones de nomenclatura, patrones técnicos obligatorios y las instrucciones de comportamiento para los agentes de Inteligencia Artificial que operan en este repositorio.

El objetivo principal es mantener la cohesión del código, asegurar la máxima testabilidad y escalabilidad, evitar acoplamientos innecesarios, y guiar tanto a desarrolladores humanos como a agentes de IA para producir código que cumpla con los más altos estándares de calidad (Clean Architecture).

---

## 2. Estructura Global de Carpetas (Arquitectura Modular)

El proyecto se organiza bajo una **Arquitectura Modular basada en Features** (características del negocio), no en capas técnicas genéricas. Toda la lógica de una característica debe auto-contenerse dentro de su propio módulo para facilitar su mantenimiento y evitar el acoplamiento directo.

### Estructura General del Proyecto (`src/`)

```
src/
├── main.ts                     # Punto de entrada de la aplicación
├── app.module.ts               # Módulo raíz que orquesta los módulos de feature
├── common/                     # Utilidades compartidas a nivel global
│   ├── decorators/             # Decoradores compartidos
│   ├── guards/                 # Guards globales o reutilizables
│   ├── helpers/                # Funciones de ayuda generales
│   ├── interceptors/           # Interceptores compartidos
│   └── pipes/                  # Pipes de transformación/validación comunes
├── database/                   # Configuración de base de datos y migraciones
│   └── migrations/             # Archivos de migración de TypeORM
└── [feature-name]/             # Módulo de Feature auto-contenido (Ej: auth, users, schedules)
    ├── auth.module.ts          # Definición y configuración del módulo
    ├── auth.controller.ts      # Controladores que exponen endpoints HTTP
    ├── auth.controller.spec.ts # Pruebas unitarias del controlador
    ├── auth.service.ts         # Servicio con lógica de negocio principal
    ├── auth.service.spec.ts    # Pruebas unitarias del servicio
    ├── constants/              # Constantes específicas del módulo
    ├── cron/                   # Tareas programadas asociadas a la feature
    ├── decorators/             # Decoradores propios del módulo
    ├── dto/                    # Objetos de Transferencia de Datos
    │   ├── index.ts            # Exportaciones de DTOs para importaciones limpias
    │   └── login-user.dto.ts
    ├── entities/               # Entidades de base de datos (TypeORM)
    ├── events/                 # Clases de eventos disparados por la feature
    ├── guards/                 # Protectores de rutas específicos del módulo
    ├── interfaces/             # Interfaces de tipado internas del módulo
    ├── listeners/              # Escuchadores de eventos inter-módulo
    └── strategies/             # Estrategias de Passport/Autenticación
```

### Reglas de la Estructura Modular
1. **Feature Modules Autónomos**: Cada módulo debe agrupar sus propios controladores, servicios, DTOs, entidades, y listeners.
2. **Importación Limpia de DTOs**: La carpeta `dto` de cada módulo debe incluir un archivo `index.ts` que exporte todos los DTOs del módulo.
3. **Common Exclusivamente Genérico**: La carpeta `src/common` solo debe albergar código estrictamente reutilizable por múltiples módulos sin dependencias de negocio (ej. helper de transacciones, filtros globales).

---

## 3. Convenciones de Nomenclatura (Naming Conventions)

Para asegurar la legibilidad del código a lo largo de todo el proyecto, se establecen convenciones estrictas de Casing y Sufijos.

### Reglas de Casing por Elemento

| Tipo de Elemento | Convención de Casing | Sufijo Obligatorio | Ejemplo |
| :--- | :--- | :--- | :--- |
| **Nombres de Archivos** | `kebab-case` | `.module.ts`, `.controller.ts`, `.service.ts`, `.dto.ts`, `.entity.ts`, `.guard.ts`, `.strategy.ts`, `.decorator.ts`, `.spec.ts`, `.interface.ts`, `.listener.ts` | `create-user.dto.ts`<br>`auth.controller.ts` |
| **Clases** | `PascalCase` | Nombre descriptivo + rol (opcional) | `AuthController`<br>`CreateUserDto`<br>`User` (entidad) |
| **Métodos y Funciones** | `camelCase` | Ninguno (verbos) | `activateAccount()` |
| **Variables y Propiedades** | `camelCase` | Ninguno | `passwordHash`<br>`email` |
| **Interfaces** | `PascalCase` | Ninguno (o prefijo `I` si es genérico) | `JwtPayload`<br>`IUserRepository` |
| **Nombres de Módulos (Clase)** | `PascalCase` | `Module` | `AuthModule`<br>`UsersModule` |
| **Nombres de Enums (Clase)** | `PascalCase` | Ninguno | `NewsCategory` |
| **Miembros de Enums** | `UPPER_SNAKE_CASE` o `PascalCase` | Ninguno | `NewsCategory.NOTICIA` |
| **Constantes** | `UPPER_SNAKE_CASE` | Ninguno | `JWT_SECRET`<br>`ROLES_KEY` |

---

## 4. Reglas Técnicas y Patrones de Diseño Obligatorios

### 4.1 Inyección de Dependencias y Desacoplamiento
- **Preferencia por Constructor Injection**: Las dependencias se deben declarar e inyectar de manera explícita en el constructor de la clase utilizando TypeScript de manera directa. Queda prohibida la inyección por propiedad (`@Inject()`) a menos que sea estrictamente necesaria por herencia.
- **Evitar el Patrón Service Locator**: Queda terminantemente prohibido utilizar `ModuleRef.get()` o contenedores globales para resolver dependencias en tiempo de ejecución de forma dinámica, ya que oculta las dependencias y rompe la testabilidad de las unidades.
- **Desacoplamiento Mediante Eventos (EDA)**: Cuando un módulo requiera reaccionar al estado de otro, no debe importar directamente el servicio ajeno si esto genera un acoplamiento estrecho o dependencia circular. Se debe implementar `@nestjs/event-emitter` para emitir eventos de dominio (ej: `OrderCreatedEvent`) y tener listeners independientes (`OrderListener`) en los módulos correspondientes.
- **Principio de Segregación de Interfaces (ISP)**: Los servicios y repositorios deben depender de interfaces o tipos pequeños y enfocados, no de abstracciones gigantescas que contengan métodos innecesarios.

### 4.2 Validación de Datos (DTOs)
- **Validación al Límite (Input Validation)**: Todos los endpoints expuestos en los controladores deben recibir parámetros validados estrictamente mediante DTOs.
- **Decoración Obligatoria en Propiedades**: Cada propiedad definida en un DTO debe contener al menos un decorador de validación de `class-validator` (ej: `@IsString()`, `@IsEmail()`, `@IsOptional()`, `@IsInt()`). Propiedades sin validar no son aceptables.
- **Documentación con Swagger**: Todos los DTOs de entrada y salida deben usar `@ApiProperty()` de `@nestjs/swagger` detallando una descripción clara y un ejemplo (`example`) representativo para facilitar la auto-documentación de la API.

### 4.3 Manejo de Errores y Excepciones
- **Excepciones Controladas de NestJS**: Queda prohibido lanzar errores genéricos como `new Error()`. Toda anomalía en la lógica de negocio o validación debe resolverse mediante las excepciones HTTP integradas de NestJS (`BadRequestException`, `UnauthorizedException`, `NotFoundException`, `ConflictException`, `InternalServerErrorException`, etc.).
- **Filtros de Excepciones (Exception Filters)**: El servidor debe tener configurado un filtro global para interceptar excepciones imprevistas, formatear la respuesta del servidor y loguear el stack trace detalladamente.
- **Errores de Base de Datos**: Capturar los errores nativos de la base de datos (como el código `23505` de clave duplicada en PostgreSQL) en las capas de servicio y mapearlos a la excepción HTTP correspondiente (`ConflictException`).

### 4.4 Tipado Estricto
- **Cero Uso de `any`**: Queda estrictamente prohibido usar el tipo `any` en firmas de métodos, propiedades o variables del código productivo. Su uso anula los beneficios de TypeScript. En su lugar, utilizar tipados estrictos, tipos genéricos, `unknown`, o `never`.
- **Tipado Explícito de Retornos**: Todos los métodos expuestos en controladores y servicios deben declarar de forma explícita el tipo de dato que retornan (ej: `async findOne(id: number): Promise<User>`).
- **Interfaces para Contratos**: Utilizar interfaces explícitas para estructurar payloads de tokens, payloads de eventos, y configuraciones.

---

## 5. Instrucción de Comportamiento para Agentes de IA

Este apartado contiene las directrices de acción de obligatorio cumplimiento para cualquier agente de Inteligencia Artificial que colabore en el desarrollo de la aplicación.

### Rol: Creador de RFC (Tech Lead)
* **Planificación Estructurada de Archivos**: Al diseñar los pasos de desarrollo para un nuevo endpoint o característica (feature), debes mapear detalladamente y de antemano qué archivos se crearán y su ubicación exacta dentro de la estructura modular establecida en la **Sección 2**.
* **Contratos Previos**: Debes redactar explícitamente los contratos de las interfaces de entrada y salida (DTOs de entrada y respuestas de la API) en el RFC antes de delegar cualquier tarea de desarrollo al agente Desarrollador.

### Rol: Desarrollador Senior
* **Alineación de Carpetas**: No inventes subcarpetas, convenciones o nombres de archivos fuera de lo especificado en este manual o Spec Kit. Utiliza las rutas relativas correspondientes a la modularidad.
* **Separación de Responsabilidades**: Si implementas un caso de uso o lógica de negocio, crea por separado su Controlador (`.controller.ts`), su Servicio asociado (`.service.ts`) y los DTOs requeridos. No mezcles lógica en un único archivo.
* **Decoración de Validación Completa**: Asegúrate de añadir el decorador de validación de `class-validator` correspondiente a cada una de las propiedades de los DTOs implementados.

### Rol: Code Reviewer (Tech Lead de Control)
* **Inspección de `any`**: Revisa meticulosamente todos los archivos modificados o creados para asegurar la total ausencia del tipo `any` en firmas, variables y retornos.
* **Inspección de Excepciones**: Asegúrate de que las respuestas ante errores utilicen las excepciones controladas de NestJS. Ningún error crudo del motor de BD o del runtime de JS debe llegar directamente al cliente.
* **Auditoría de Nomenclatura**: Verifica rigurosamente que los archivos y elementos de código cumplan con el estándar de Casing y sufijos definido en la tabla de la **Sección 3**.
