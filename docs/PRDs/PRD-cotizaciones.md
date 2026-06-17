# PRD-03: Sistema de Cotizaciones y Widget de Monedas - Cámara de Comercio Paraguayo-Suiza (CCPS)

## 1. Visión General (Overview)

- **Objetivo:** Implementar un sistema automatizado para obtener y mostrar las cotizaciones referenciales diarias de monedas extranjeras (USD, CHF, EUR, BRL, ARS) en Guaraníes (PYG) en el portal de la CCPS. Esto elimina la carga administrativa manual y provee a los inversores y socios información cambiaria actualizada y cacheada para un rendimiento óptimo.
- **Audiencia Objetivo:** Inversores suizos y paraguayos, empresas asociadas, y visitantes que evalúan transacciones comerciales bilaterales.
- **Éxito del Proyecto:**
  - **Rendimiento:** El widget no bloquea la carga inicial de la página principal gracias al renderizado asíncrono en cliente.
  - **Eficiencia del Servidor:** Las peticiones recurrentes al backend se resuelven en memoria (Cache), evitando consultas a la base de datos PostgreSQL.
  - **Confiabilidad:** El widget muestra un diseño visual consistente (skeleton) durante la carga y maneja fallos de red con datos de respaldo (fallback).

---

## 2. Alcance Funcional (Scope)

El ecosistema de cotizaciones abarca los siguientes componentes y responsabilidades:

### A. Portal Web Público (Astro + React Islands) - *Este Proyecto*
- [ ] **Widget de Cotizaciones en el Hero:**
  - Conversión del bloque estático actual del Hero en una **Isla de React** hidratada (`client:load` o `client:visible`).
  - Estado de carga inicial mediante un **Skeleton Loader** que coincida con las dimensiones del diseño original para evitar el parpadeo visual (*Layout Shift*).
  - Consulta asíncrona al API de NestJS (`GET /api/v1/rates/latest`) al cargarse en el navegador del usuario.
  - Formateo dinámico de valores numéricos de compra y venta según los estándares locales (separadores de miles).
  - Manejo de excepciones de red: si el API no responde, el componente muestra los últimos valores guardados en local storage o un mensaje amigable con valores de referencia estáticos.

### B. Servicio Backend (NestJS + PostgreSQL) - *Proyecto Backend*
- [ ] **Servicio de Scraping Automatizado:**
  - Ejecución diaria mediante un cron job (ej: Lunes a Viernes a las 08:30 AM) para extraer la cotización oficial o de referencia del mercado minorista paraguayo.
  - Extracción de cotizaciones para las monedas: **Dólar (USD), Franco Suizo (CHF), Euro (EUR), Real (BRL) y Peso Argentino (ARS)**.
- [ ] **Persistencia y Caché:**
  - Registro de las cotizaciones extraídas en la tabla `exchange_rates` de PostgreSQL para auditoría e histórico.
  - Almacenamiento en caché en memoria (In-Memory Cache) del backend de la última cotización del día.
- [ ] **REST API Endpoint:**
  - `GET /api/v1/rates/latest` -> Devuelve un JSON con las cotizaciones del día directamente desde la caché del servidor.

### Lo que NO incluye (Out of Scope)
- [ ] Gráficos históricos interactivos de cotizaciones a lo largo del tiempo (esta fase solo requiere mostrar el valor del día actual).
- [ ] Conversor interactivo de monedas en vivo (input donde el usuario escribe un monto y se calcula).
- [ ] API de cotizaciones en tiempo real por segundo (forex tick-by-tick). Se manejan tasas diarias de referencia.

---

## 3. Reglas de Negocio (Business Rules)

- **Regla 1 (Estrategia de Caché):** La caché en memoria de NestJS debe actualizarse inmediatamente después de una ejecución exitosa del scraper. Todas las peticiones entrantes de los clientes deben ser respondidas desde la caché, resultando en 0 consultas a la base de datos PostgreSQL en visitas estándar.
- **Regla 2 (Control de Errores del Scraper):** Si el scraper falla al obtener los datos (web de origen caída), NestJS debe mantener la cotización del día anterior en caché e incluir una bandera `fallback: true` y una advertencia en el log de auditoría.
- **Regla 3 (Internacionalización - i18n):** Las etiquetas de textos en el widget ("Cotizaciones", "C:", "V:", "Valores referenciales...") deben cambiar dinámicamente según el idioma activo (`lang`) del portal Astro, inyectado como propiedad (prop) en la isla de React.
- **Regla 4 (Sello de Tiempo):** El JSON de respuesta del API debe incluir el campo `updatedAt` para mostrar al pie del widget la fecha de la última actualización (ej: "Actualizado: 17 de Junio, 08:35 hs").

---

## 4. Requerimientos No Funcionales (NFR)

- **Tecnología Base (Astro Island):** El componente en el frontend debe desarrollarse en React (`.tsx`) bajo la carpeta `src/components/react/`. Se hidratará utilizando la directiva de Astro `client:load` debido a su ubicación prioritaria arriba del pliegue.
- **Estilos e Interfaz "Alpine Editorial":** 
  - El diseño visual del widget debe ser idéntico al maquetado estático: uso de banderas circulares (`flag-icons`), bordes fantasma (`border-outline-variant/15`) y tipografía `Inter` con contrastes claros.
  - Los estados de carga y error no deben deformar el layout del Hero Banner.
- **Seguridad CORS:** El endpoint de NestJS debe estar configurado con políticas CORS específicas para aceptar únicamente peticiones originadas desde el dominio oficial del portal público de la CCPS y de desarrollo local.

---

## 5. Criterios de Aceptación (User Stories)

### Historia 1: Carga y Renderizado Exitoso de Cotizaciones
- **Dado que** un usuario visitante ingresa a la página de Inicio de la CCPS,
- **Cuando** se carga el Hero Banner arriba del pliegue,
- **Entonces** visualiza inmediatamente un *skeleton loader* en el espacio del widget de divisas y, tras completarse la petición asíncrona exitosamente, las cotizaciones reales (USD, CHF, EUR, etc.) se renderizan con separadores de miles y la fecha de última actualización.

### Historia 2: Comportamiento ante Fallo de Red o Servidor Caído
- **Dado que** el servidor backend de NestJS está caído o hay un problema de conectividad a internet en el cliente,
- **Cuando** el usuario entra a la Home y el widget intenta consultar `GET /api/v1/rates/latest`,
- **Entonces** el widget detecta el fallo del fetch, oculta el cargador y renderiza de forma elegante las cotizaciones de contingencia (valores por defecto) con una nota indicando que son valores históricos de referencia.

### Historia 3: i18n Consistente en el Widget
- **Dado que** un usuario navega en la versión en Inglés (`/en/`),
- **Cuando** visualiza el widget de cotizaciones,
- **Entonces** el título del widget cambia a "Exchange Rates", las leyendas de compra/venta cambian a "B:" / "S:" (Buy / Sell) y la nota aclaratoria se muestra en inglés, manteniendo la coherencia lingüística del sitio.
