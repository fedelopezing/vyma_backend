# PRD-06: Ad Banner (Espacio Publicitario) - Cámara de Comercio Paraguayo-Suiza (CCPS)

## 1. Visión General (Overview)

- **Objetivo:** Proveer un espacio publicitario destacado en la página principal donde socios o empresas visitantes puedan publicitar sus servicios o productos. Esto genera un valor directo para los anunciantes (visibilidad) y representa una herramienta de engagement y potencial fuente de ingresos para la Cámara.
- **Audiencia Objetivo:** 
  - Visitantes generales y socios que visualizan los anuncios.
  - Empresas interesadas en adquirir el espacio (potenciales anunciantes).
  - Administradores de la CCPS (quienes gestionan los banners y solicitudes).
- **Éxito del Proyecto:**
  - Rendimiento óptimo del componente (Performance > 90 en Lighthouse) manejando correctamente la carga de imágenes dinámicas.
  - Navegación fluida e intuitiva del carrusel.
  - Ruta de conversión clara y sin fricciones hacia el contacto para solicitar publicidad.

---

## 2. Alcance Funcional (Scope)

### Lo que SÍ incluye (In Scope)

- [ ] **Carrusel de Anuncios (React Island):** Un visor de imágenes con transiciones suaves (fade in/out) que rota automáticamente (ej. cada 5 segundos). Incluye indicadores (dots) para navegación manual.
- [ ] **Identificador de Anuncio y Micro-CTA Flotante:** Un overlay minimalista sobre el carrusel (ej: en la esquina superior/inferior) que contiene:
  - Un badge indicador (ej: "Publicidad" o "Patrocinado").
  - Un enlace/botón sutil ("Publicite aquí" o "Info") que sirve como llamada a la acción (CTA) para enviar un correo electrónico directo de solicitud.
- [ ] **Slide de Autopromoción (Opcional):** Un banner diseñado por la propia Cámara (ej: "¿Desea ver su empresa aquí?") que rota dentro del carrusel para incentivar las solicitudes de publicidad.
- [ ] **Integración de Backend:** Endpoints para obtener de forma dinámica la lista de imágenes publicitarias activas desde la base de datos.
- [ ] **Gestor de Anuncios (Admin Next.js):** Interfaz CRUD para que los administradores suban nuevas imágenes de banners, configuren su orden y habiliten/deshabiliten pautas.

### Lo que NO incluye (Out of Scope)

- [ ] Sistema de autogestión y pasarela de pagos automatizada para anunciantes (en esta fase la venta del espacio se manejará vía correo electrónico directo para evitar formularios públicos de contacto propensos a spam).
- [ ] Tracking detallado de clics por usuario o segmentación avanzada de anuncios según el perfil del visitante.

---

## 3. Reglas de Negocio (Business Rules)

- **Regla 1 (Rotación de Anuncios):** El carrusel rotará de manera automática cada 5 segundos siempre que exista más de un anuncio activo.
- **Regla 2 (Límite de Banners):** Se mostrará un máximo de 5 anuncios activos simultáneamente para asegurar el rendimiento visual y mantener la exclusividad del espacio para los anunciantes.
- **Regla 3 (i18n):** Los textos fijos de la interfaz ("Publicidad", "Publicite aquí") deben estar soportados por el sistema de traducciones (`t('home.adBanner...')`). Los banners como tal (imágenes) deberían ser universales, o bien el modelo de datos deberá contemplar una imagen por idioma si estas contienen texto impreso.

---

## 4. Requerimientos No Funcionales (NFR)

- **Tecnología Base:** `AdBanner` será implementado estrictamente como una **React Island** dentro de la página estática Astro, debido al uso de `useState` y `useEffect` para el control de los intervalos del carrusel.
- **Rendimiento e Imágenes:** Las imágenes consumidas del backend deben tener el atributo `loading="lazy"` y `referrerPolicy="no-referrer"` (como ya se esboza en el código base), asegurando no bloquear el renderizado inicial (LCP). Se recomienda inicializar el componente con la directiva `client:visible`.
- **Diseño "Alpine Editorial":** Respetar la regla "No-Line". El micro-CTA y el badge identificador deben ser extremadamente discretos y flotantes sobre el carrusel (ej: overlay semi-transparente `bg-surface/80 backdrop-blur-md` con un "Ghost Border" `border-outline-variant/15` para cumplir con las guías estéticas premium). Sombras sutiles (`shadow-sm`) e interacciones suaves de hover en los dots y el enlace.
- **Accesibilidad (a11y):** Los botones de indicadores deben poseer `aria-label` descriptivos ("Anuncio 1", "Anuncio 2"). Las imágenes requieren atributos `alt` traducidos y claros.

---

## 5. Criterios de Aceptación (User Stories)

### Historia 1: Visualización Automática del Carrusel
- **Dado que** un usuario ingresa a la página principal (Home),
- **Cuando** se desplaza hacia la sección del componente `AdBanner`,
- **Entonces** el componente (`client:visible`) carga las imágenes disponibles e inicia automáticamente la transición (fade) entre los banners cada 5 segundos.

### Historia 2: Interacción Manual con Anuncios
- **Dado que** el usuario visualiza el carrusel en funcionamiento,
- **Cuando** hace clic en uno de los indicadores inferiores (dots),
- **Entonces** el carrusel detiene momentáneamente su flujo automático y transiciona de inmediato a la imagen seleccionada.

### Historia 3: Ruta de Conversión (Solicitud de Publicidad)
- **Dado que** una empresa visitante visualiza el bloque publicitario,
- **Cuando** hace clic en el micro-CTA ("Publicite aquí") o en el slide de autopromoción,
- **Entonces** el sistema abre el cliente de correo del usuario con una plantilla predefinida y dirección comercial directa de la Cámara para solicitar pautas comerciales, evitando formularios públicos propensos a recibir spam.

---

## 6. Impacto por Proyecto

### 🛠️ Backend (NestJS `vyma_backend`)
- **Endpoints requeridos:**
  - `GET /ads/active` — Endpoint público que retorna la lista de banners aprobados y vigentes.
  - `[CRUD] /admin/ads` — Endpoints protegidos para la gestión (Crear, Leer, Actualizar, Borrar).
- **Entidades/Migraciones:** 
  - Nueva entidad `Ad` o `Banner` con campos básicos: `id`, `imageUrl`, `isActive`, `order`, `createdAt`.

### 🖥️ Admin (Next.js `vyma_frontend`)
- **Módulo afectado:** Creación de un nuevo módulo (ej. `src/app/marketing/ads/`).
- **Funcionalidades:** Tabla listado de anuncios, formulario de subida de imagen y toggle para activar/desactivar el banner.
- **Permisos:** Acceso restringido a roles de `Admin` o `Marketing`.

### 🌐 Web Pública (Astro `swisschampy`)
- **Páginas afectadas:** `src/pages/[lang]/index.astro` (Home).
- **Componentes:**
  - Estáticos (Astro): Contenedor opcional.
  - Interactivos (React islands): Actualizar `src/components/react/marketing/AdBanner.tsx` para que consuma datos de la API mediante el hook o fetcher en lugar del array estático `ADS`.
- **API Endpoints consumidos:** `GET /ads/active` (a través de la capa `api-consumer`).
- **i18n:** Claves JSON requeridas: `home.adBanner.label` ("Publicidad" / "Patrocinado"), `home.adBanner.ctaBtn` ("Publicite aquí" / "Anúnciate"), `home.adBanner.imageAlt`.
