# Vyma Backend 🎵

Un backend moderno, robusto y altamente escalable desarrollado con **NestJS** y **TypeScript** para la gestión de turnos, agendas, servicios y notificaciones automáticas (Email y WhatsApp).

---

## 🚀 Características Principales

- **Autenticación y Autorización**: Sistema seguro basado en JSON Web Tokens (JWT) y Control de Acceso Basado en Roles/Permisos (RBAC).
- **Gestión de Turnos y Agendas**: Completo sistema de horarios (`schedules`) y pausas o descansos (`schedule-breaks`) para profesionales.
- **Perfiles y Servicios**: Administración de profesionales, profesiones asociadas y catálogo de servicios ofrecidos.
- **Notificaciones Integradas**:
  - **Email**: Integración fluida con la API de [Resend](https://resend.com/).
  - **WhatsApp**: Bot automatizado y notificador en tiempo real mediante `whatsapp-web.js` con generación de códigos QR en terminal.
- **Seguridad**: Limitador de peticiones (Rate Limiting / Throttling) global configurado por IP (30 req / 60s por defecto).
- **Base de Datos**: ORM potente con **TypeORM** y PostgreSQL con soporte para migraciones automáticas y herramientas de seeding.

---

## 🛠️ Stack Tecnológico

- **Framework**: [NestJS](https://nestjs.com/) (v10+)
- **Lenguaje**: TypeScript
- **Base de Datos**: PostgreSQL
- **ORM**: TypeORM
- **Mensajería & Notificaciones**: Resend API, `whatsapp-web.js` (con autenticación por sesión persistente)
- **Seguridad**: `@nestjs/throttler`, `@nestjs/jwt`, `bcrypt`
- **Documentación**: Swagger / OpenAPI (`@nestjs/swagger`)

---

## ⚙️ Configuración del Entorno

1. Clona el repositorio y entra en el directorio del proyecto:
   ```bash
   cd vyma_backend
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Crea un archivo `.env` en la raíz del proyecto basándote en el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```

4. Configura las variables de entorno en tu `.env`:
   ```env
   STAGE=dev
   NODE_ENV=development

   # Base de Datos PostgreSQL
   DB_PASSWORD=tu_password
   DB_NAME=vyma
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres

   # Puerto del Servidor
   PORT=3000
   HOST_API=http://localhost:3000/api
   JWT_SECRET=tu_secreto_super_seguro

   # Notificaciones (Resend & WhatsApp)
   RESEND_API_KEY=tu_api_key_de_resend
   EMAIL_BIOLIMPIEZA_TO="destinatario@correo.com"
   ALLOWED_ORIGINS="http://localhost:3000,https://tu-dominio.com"
   WHATSAPP_TO="+5959xxxxxxxx"
   ```

---

## 💻 Ejecución del Proyecto

### Desarrollo
Para iniciar el servidor en modo desarrollo con recarga automática (*hot-reload*):
```bash
npm run start:dev
```

### Producción
Para compilar y ejecutar el proyecto optimizado para producción:
```bash
# Compilar el código TypeScript a JavaScript
npm run build

# Levantar el servidor en producción
npm run start:prod
```

---

## 🧪 Ejecución de Pruebas

El proyecto cuenta con un entorno configurado para pruebas unitarias e integración usando **Jest**.

```bash
# Pruebas unitarias
npm run test

# Pruebas unitarias en modo observador (watch)
npm run test:watch

# Cobertura de código (Coverage)
npm run test:cov

# Pruebas End-to-End (E2E)
npm run test:e2e
```

---

## 🧰 Scripts Útiles y Herramientas de Desarrollo

### 🏷️ Autogeneración de Etiquetas Swagger (`add-api-tags.js`)
Para mantener la documentación de Swagger limpia, estructurada y agrupada por módulos de forma automática, el proyecto cuenta con un script utilitario personalizado:
```bash
node scripts/add-api-tags.js
```

**¿Cómo funciona?**
- Escanea de forma automática y recursiva el directorio `src/` buscando controladores (`*.controller.ts`).
- **Previene duplicados**: Si un controlador ya tiene el decorador `@ApiTags(...)` aplicado, lo ignora automáticamente.
- Si no está presente, analiza la ruta del `@Controller(...)`, remueve el prefijo de versión (como `api/v1/`), capitaliza y formatea el nombre (ej. `auth-management` -> `"Auth Management"`).
- Inyecta de forma segura el decorador `@ApiTags('Nombre')` y añade de forma automática la importación correspondiente de `@nestjs/swagger` al inicio del archivo si no existía.

### 🌱 Base de Datos / Migraciones y Semillas (Seeding)
Puedes poblar tu base de datos de desarrollo con datos de prueba preestablecidos (usuarios, roles, profesiones) utilizando el módulo de Seeding mediante HTTP al endpoint habilitado de desarrollo (o a través del servicio inyectado).

Para la gestión de base de datos con **TypeORM**:
```bash
# Crear una nueva migración vacía
npm run typeorm:create --name=NombreDeMigracion

# Generar una migración basada en cambios en las entidades
npm run typeorm:generate --name=NombreDeMigracion

# Ejecutar migraciones pendientes
npm run typeorm:run

# Revertir la última migración ejecutada
npm run typeorm:revert
```

---

## 🌐 Despliegue en Producción (PM2)

Para entornos de producción, se recomienda administrar el ciclo de vida de la aplicación con **PM2**:

```bash
# 1. Compilar el bundle de producción
npm run build

# 2. Detener la instancia anterior (si aplica)
pm2 stop vyma-backend

# 3. Iniciar el servicio usando la configuración del ecosistema
pm2 start ecosystem.config.js --env production

# 4. Ver los logs de producción en tiempo real
pm2 logs vyma-backend --lines 100
```

---

## 📄 Licencia

Este proyecto es privado y de uso exclusivo bajo los términos de licencia no comercial (`UNLICENSED`).
