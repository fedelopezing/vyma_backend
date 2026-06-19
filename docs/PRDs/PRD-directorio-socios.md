# PRD: Directorio de Socios (Members Directory)

## 1. Visión y Objetivo
Crear una plataforma pública para visualizar los socios de la Cámara de Comercio Paraguayo-Suiza (CCPS), mejorando el networking. A su vez, establecer un flujo automatizado para la recepción, revisión y aprobación de nuevas solicitudes de membresía que se integre en todo el ecosistema (Web, Admin y Backend).

## 2. Alcance
**In Scope:**
- Sección en la Home con los logos de socios destacados, seleccionados desde el panel admin.
- Página pública con el listado completo de socios (directorio), con scroll infinito, buscador por nombres y filtros por rubro/categoría.
- Formulario público (en página separada) para solicitar la membresía a la CCPS, con los campos detallados en el formulario de referencia.
- Almacenamiento de socios y estado de solicitudes en la base de datos (Backend NestJS `vyma_backend`).
- Gestión de socios en el panel de administración (Aprobación/Rechazo/Edición y marca de destacado en Next.js `vyma_frontend`).

**Out of Scope:**
- Portal privado o login exclusivo para socios en la web pública.
- Pasarela de pagos automatizada para el cobro de la membresía en esta fase.

## 3. Historias de Usuario
- Como **visitante**, quiero ver los logos de los socios destacados en la página principal para conocer las empresas que apoyan a la CCPS.
- Como **visitante**, quiero ver el listado completo de socios, usar un scroll infinito para navegar cómodamente, y poder buscar por nombre o filtrar por rubro para encontrar empresas específicas.
- Como **empresa interesada**, quiero acceder a una página dedicada con un formulario completo de solicitud de membresía online para iniciar mi proceso de asociación.
- Como **administrador de la CCPS**, quiero poder revisar las solicitudes de membresía entrantes, aprobarlas/rechazarlas, y elegir qué socios mostrar como "Destacados" en la Home desde mi panel de control.

## 4. Requerimientos Funcionales y Definiciones (Basado en Feedback)

- **Datos a mostrar en el Directorio:** Logo, Nombre de la empresa, Descripción corta, Sitio Web, Email, Teléfono, Dirección.
- **Paginación del Directorio:** Se implementará **Scroll Infinito**, complementado con un buscador por texto (nombre de la empresa) y filtros por "Rubro/Categoría".
- **Lógica de la Home (`NewMembers`):** Se mostrarán únicamente los "Socios Destacados" (`isFeatured: true`), los cuales serán seleccionados manualmente por el administrador en el panel de control.
- **Formulario de Registro:** Estará ubicado en una ruta separada (`/members/apply`). Los campos principales (basados en la referencia) incluirán:
  - Email, Tipo de cuota (Anual/Semestral).
  - Razón Social, RUC/CNPJ.
  - Dirección, Ciudad, País.
  - Teléfono de contacto de la empresa.
  - Rubro o Actividad de la empresa (selector).
  - Datos del representante: Nombre, Email, Celular.
  - Redes sociales de la empresa.
  - Contacto del área de marketing.

## 5. Impacto por Proyecto

### 🛠️ Backend (NestJS `vyma_backend`)
- **Endpoints requeridos:**
  - `GET /members` — Listado público de socios aprobados. Soportará query params para búsqueda (`?q=`), filtros (`?category=`), y paginación (`?page=&limit=`) necesaria para el scroll infinito del frontend.
  - `GET /members/featured` — Devuelve los logos de los socios destacados para la Home.
  - `POST /members/apply` — Endpoint público para enviar una nueva solicitud de membresía con todos los campos del formulario.
  - `GET /admin/members` — Listado de todas las solicitudes y socios actuales.
  - `PATCH /admin/members/:id/status` — Aprobar, rechazar o dar de baja a un socio.
  - `PATCH /admin/members/:id/featured` — Activar/desactivar el estado de destacado.
  - `PUT /admin/members/:id` — Editar información general de un socio.
- **Entidades/Migraciones:** 
  - Nueva tabla `Member` con campos: corporativos, logoUrl, información de contacto, rubro/categoría, datos del representante, `isFeatured` (boolean), y `status` (`PENDING`, `APPROVED`, `REJECTED`, `INACTIVE`).
- **Eventos de dominio:** 
  - `MemberApplicationReceived` (Notificación al equipo de la CCPS).
  - `MemberApplicationStatusChanged` (Notificación al solicitante sobre su aprobación).

### 🖥️ Admin (Next.js `vyma_frontend`)
- **Módulo afectado:** `src/app/members/`
- **Funcionalidades:** 
  - Tabla de gestión de solicitudes con filtros por estado.
  - Botones de acción rápida para Aprobar/Rechazar solicitudes pendientes.
  - Toggle (switch) para marcar o desmarcar a un socio como "Destacado" para la Home.
  - Formulario de edición para actualizar información de un socio existente.
- **Permisos:** Administradores y Managers de la CCPS.

### 🌐 Web Pública (Astro `swisschampy`)
- **Páginas nuevas / Modificadas:** 
  - `src/pages/[lang]/members/index.astro` (Listado del directorio).
  - `src/pages/[lang]/members/apply.astro` (Página para el formulario de registro).
  - `src/components/astro/home/NewMembers.astro` (Actualizado para consumir `GET /members/featured`).
- **Componentes:**
  - **Estáticos (Astro):** `MemberCard.astro` (diseño de la tarjeta).
  - **Interactivos (React islands):** 
    - `MembersDirectory.tsx` (`client:load`): Manejará el estado del listado, el scroll infinito usando un Intersection Observer (o un botón de cargar más que cargue on-scroll), y el estado del buscador y filtros debounced.
    - `MembershipForm.tsx` (`client:load`): Formulario multi-step o largo con validaciones (Zod/React Hook Form) para el registro de la membresía.
- **API Endpoints consumidos:** Llamadas a `GET /members`, `GET /members/featured` y `POST /members/apply` a través del `api-consumer`.
- **i18n:** Traducciones necesarias en el diccionario `members.ts` (ES/EN) para el directorio, filtros, y campos del formulario.
