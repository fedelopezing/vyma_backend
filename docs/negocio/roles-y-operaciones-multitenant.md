# 🛡️ Roles y Operaciones en la Arquitectura Multi-Tenant

Este documento describe la división de responsabilidades entre el **SuperAdmin** (administrador global de la plataforma) y los **Managers/Usuarios de Empresa** (administradores y operadores de tenants específicos), detallando cómo interactúan con la API en el día a día.

---

## 1. División de Roles y Responsabilidades

El sistema separa estrictamente el control global de la plataforma de la operación diaria de cada empresa:

```
                  ┌─────────────────────────────────────────┐
                  │        SuperAdmin (Global)              │
                  │  • CRUD de Empresas (Companies)         │
                  │  • Asociar Usuarios a Empresas          │
                  └────────────────────┬────────────────────┘
                                       │ Crea membresías
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │     Managers / Operadores (Tenant)      │
                  │  • CRUD de Noticias (News)              │
                  │  • Configurar Agendas y Recesos         │
                  │  • Crear Servicios y Profesiones        │
                  └─────────────────────────────────────────┘
```

### 1.1 SuperAdmin (`isSuperAdmin: true` a nivel de usuario)
El SuperAdmin es una cuenta global con privilegios para gobernar la plataforma a nivel macro. No pertenece a ninguna empresa en particular por defecto.

*   **Responsabilidades Exclusivas:**
    *   Crear nuevas empresas (`POST /companies`).
    *   Listar todas las empresas registradas (`GET /companies`).
    *   Editar datos maestros de empresas (`PATCH /companies/:uuid`).
    *   Asociar usuarios a empresas asignándoles un rol local (`POST /companies/:uuid/members`).
    *   Desvincular usuarios de empresas (`DELETE /companies/:uuid/members/:userUuid`).
*   **Contexto del Token:** Su token JWT inicial tiene `companyId: undefined`. El sistema le permite realizar bypass del `TenantGuard` para operaciones de administración general.

### 1.2 Tenant Manager (Rol `manager` dentro de una empresa)
Es el rol administrativo local asignado a un usuario para un tenant específico mediante una membresía activa en `UserCompany`.

*   **Responsabilidades:**
    *   Gestionar el contenido y noticias del tenant (`POST /news/admin`, `PUT /news/admin/:id`, etc.).
    *   Configurar y modificar los horarios y agendas de la empresa.
    *   Crear y actualizar el catálogo de servicios y profesiones locales.
*   **Contexto del Token:** Su token JWT de acceso contiene obligatoriamente el `companyId` y `companyUuid` de la empresa en la que inició sesión activa.

---

## 2. Flujo de Operación Diaria (Paso a Paso)

### 2.1 Cómo un SuperAdmin da de alta y configura un Tenant
Para iniciar a operar una nueva empresa en la plataforma, el SuperAdmin realiza el siguiente flujo:

1.  **Crear la Empresa:**
    El SuperAdmin realiza una petición para registrar la nueva empresa:
    *   **Endpoint:** `POST /companies`
    *   **Headers:** `Authorization: Bearer <SuperAdmin_Token>`
    *   **Body:**
        ```json
        {
          "name": "Biolimpieza S.A.",
          "taxId": "77777777-7",
          "email": "contacto@biolimpieza.com"
        }
        ```
    *   *El backend devuelve la empresa creada con su `uuid` público.*

2.  **Asociar el Administrador de la Empresa (Manager):**
    El SuperAdmin asocia a un usuario existente (o a sí mismo si desea administrarla temporalmente) como **Manager** de esa empresa:
    *   **Endpoint:** `POST /companies/<company_uuid>/members`
    *   **Headers:** `Authorization: Bearer <SuperAdmin_Token>`
    *   **Body:**
        ```json
        {
          "userUuid": "uuid-del-usuario-manager",
          "roleName": "manager"
        }
        ```
    *   *A partir de este momento, el usuario queda vinculado con rol `manager` en Biolimpieza.*

---

### 2.2 Cómo opera el Manager en su Empresa
El usuario asignado como Manager realiza las operaciones del día a día (por ejemplo, publicar noticias):

1.  **Iniciar Sesión (`POST /auth/login`):**
    El Manager ingresa sus credenciales globales.
    *   *Si solo pertenece a Biolimpieza:* El backend le devuelve directamente su `accessToken` definitivo.
    *   *Si pertenece a múltiples empresas (ej: Biolimpieza y Natynails):* El backend le devuelve un listado de empresas y un `selectionToken`.

2.  **Selección de Contexto (Solo si pertenece a varias empresas):**
    El cliente envía la selección de empresa elegida:
    *   **Endpoint:** `POST /auth/select-company`
    *   **Body:** `{ "companyUuid": "uuid-de-biolimpieza" }`
    *   *El backend valida y entrega el `accessToken` definitivo con `companyId: 2` (ID interno de Biolimpieza).*

3.  **Operar en el Negocio:**
    El Manager interactúa con los módulos transaccionales. Por ejemplo, al crear una noticia:
    *   **Endpoint:** `POST /news/admin`
    *   **Headers:** `Authorization: Bearer <accessToken>`
    *   **Body:**
        ```json
        {
          "tituloEs": "Inauguración de nueva sucursal",
          "resumenEs": "Abrimos una nueva sucursal en el centro.",
          "contenidoEs": "..."
        }
        ```
    *   **Lógica Interna:** El backend intercepta el token, extrae `req.user.companyId` (que es `2`), valida los permisos, y automáticamente inserta la noticia en la base de datos asociada a la empresa `2`. El frontend nunca tuvo que enviar el ID de la empresa en el cuerpo de la petición.

---

## 3. Resumen de Reglas de Seguridad en la API

| Endpoint / Operación | Acceso SuperAdmin | Acceso Tenant Manager | Comportamiento del Filtro / Aislamiento |
|:---|:---:|:---:|:---|
| **CRUD de Empresas** | `SÍ` | `NO` | Acceso global sin restricción de tenant. |
| **Asociación de Miembros** | `SÍ` | `NO` | Acceso global. Permite asociar cualquier usuario a cualquier empresa. |
| **Operaciones de Negocio (News, Schedules, etc.)** | `SÍ` (con membresía) | `SÍ` | El `TenantGuard` valida que el `companyId` del token coincida con el recurso. La consulta SQL filtra por `WHERE companyId = :companyId`. |
