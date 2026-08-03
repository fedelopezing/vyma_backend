PRD: Módulo de Clientes, Sedes Geolocalizadas y Contratos B2B

1. Visión del Producto y Objetivos Estratégicos

Definición de Entidad: Cliente/Cuenta Corporativa

En el ecosistema de servicios B2B intensivos en mano de obra (limpieza técnica, seguridad privada y outsourcing), la Cuenta Corporativa es la entidad legal —Persona Física o Jurídica— que actúa como beneficiaria del servicio y responsable solidaria ante los órganos rectores. El sistema debe centralizar la gestión de esta entidad para mitigar riesgos operativos y asegurar la transparencia financiera mediante una vinculación directa entre el despliegue de personal en campo y la facturación electrónica.

Objetivos Estratégicos

* Centralización Administrativa: Consolidar datos fiscales, documentos legales (Escrituras, Cédula Tributaria) y operativos en un solo repositorio auditable, alineado a los registros del SUACE/VUE.
* Delimitación Geográfica de Servicios: Garantizar que la inversión en capital humano se ejecute exclusivamente en los perímetros autorizados mediante geocercas activas, eliminando el fraude por ausentismo.
* Automatización del Ciclo de Ingresos: Sincronizar el cumplimiento de contratos y servicios adicionales con el ecosistema SIFEN para una pre-liquidación sin errores manuales.
* Trazabilidad Regulatoria (Compliance): Asegurar que toda asignación de personal cumpla con los plazos de comunicación al sistema REI (IPS) y REGOBPAT (MTESS), protegiendo a la empresa ante multas administrativas.

2. Gestión de Cuentas, Jerarquía y Datos Fiscales

Ficha Técnica del Cliente (Mapeo SUACE/VUE)

El sistema debe implementar campos específicos según el tipo de contribuyente para garantizar la interoperabilidad con los formularios oficiales de formalización.

Campo	Persona Física	Persona Jurídica
Razón Social	Nombre del Propietario	Denominación Social según Escritura
RUC	Requerido	Requerido
Sociedad Comercial	EIRL, Condominio, Sucesión	SA, SRL, Sucursal Extranjera, Simple
Nombre de Fantasía	Requerido	Requerido
Condición IVA	10%, 5%, Exento	10%, 5%, Exento
Datos Base	Nombres, Apellidos, Fecha Nac.	N/A (Se maneja en Representantes)
Correo Electrónico	Principal y Secundario (VUE)	Principal y Secundario (VUE)
Domicilio Fiscal	Depto, Distrito, Localidad, Barrio	Depto, Distrito, Localidad, Barrio

Estructura Jerárquica Operativa

1. Nivel 1: Casa Matriz (Titular del RUC): Entidad legal principal que firma el contrato marco y recibe la factura global (si aplica).
2. Nivel 2: Establecimientos / Puntos de Expedición: Sucursales vinculadas a números de establecimiento declarados ante la DNIT. Cada punto tiene su propia gestión de asistencia.
3. Nivel 3: Centros de Costo: Segmentación contable interna del cliente para imputación de gastos por departamento (ej. Logística, Administración, Planta Alta).

Submódulo de Representantes y Firmantes

Captura de datos requerida por el formulario de "Personas Relacionadas" del VUE:

* Identificación: Nacionalidad, Tipo de Documento, Género y Estado Civil (obligatorios según Source Image 8).
* Perfil: Cargo (Propietario, Gerente, Socio), Profesión y Número de Registro Profesional (si aplica).
* Vigencia de Poderes: Fecha de inicio y fin de vigencia del cargo para alertas de renovación.
* Datos de Socios: Si el tipo es "Socio", registrar Nro. de acciones suscriptas, valor de cada acción y valor total en bienes aportados.

3. Gestión de Sedes Operativas y Geocercas

Especificaciones de Establecimientos (Sincronización VUE)

Cada sede operativa debe documentar los campos obligatorios del registro de establecimientos del sistema RIEL/VUE:

* Identificación: Nombre del Establecimiento y si es Casa Central (Si/No).
* Ubicación Catastral: Cuenta Corriente Catastral, Nro. de Padrón y Nro. de Finca (obligatorios para auditorías patrimoniales).
* Datos de Contacto: Teléfono, Celular, Correo de Sede y Referencia de Ubicación.

Geolocalización Técnica y Control de Asistencia

* Captura de Coordenadas: Integración de mapa interactivo para fijar Latitud/Longitud con precisión decimal.
* Configuración de Geocerca: Definición de un radio de tolerancia (metros) configurable por sede.
* Metadatos Operativos: El sistema debe exigir la carga de horarios de acceso permitidos, stock de insumos básicos y listado de EPP (Equipos de Protección Personal) requeridos para el ingreso.

4. Administración de Contratos Recurrentes y SLA

Tipos de Contrato y Reglas de Facturación

Tipo	Aplicación	Lógica de Liquidación
Abono Fijo	Servicios estándar mensuales.	Facturación automática del monto pactado.
Bolsa de Horas	Servicios técnicos o consultoría.	Consumo de horas hombre ejecutadas contra saldo.
Evento/Adicional	Refuerzos o coberturas puntuales.	Cobro por demanda según reporte de novedad.

Sistema de Alertas de Documentación y Vigencia

Para mantener la "Salud del Cliente", el sistema debe alertar sobre el vencimiento de:

* Contratos B2B: Notificación con 60-90 días de antelación para gestiones de prórroga o nuevas licitaciones.
* Documentación Impositiva (SET): Seguimiento obligatorio de la Cédula Tributaria, Constancia SET y Formulario 101 - Renta (con actualización anual requerida según fecha de presentación del año anterior).

5. Asignación Operativa de Personal y Cuadrillas

* Lógica de Vinculación N:M: Los empleados (nómina) pueden asignarse a múltiples sedes.
* Restricción de Arquitectura: Un empleado no puede estar activo (fichado) en dos geocercas simultáneamente. El sistema debe bloquear fichajes concurrentes en ubicaciones distintas.
* Tablero de Cobertura (Real-Time): Dashboard para supervisores con estados:
  * Cubierto: Fichaje exitoso dentro de geocerca en hora.
  * Vacante: Turno sin empleado asignado.
  * Retraso/Ausencia: El sistema dispara alerta si no hay fichaje transcurridos 15 minutos del inicio del turno.

6. Control de Calidad e Informes de Cumplimiento

* Registro de Novedades Multimedia: Los supervisores y cuadrillas deben subir respaldos obligatorios: Fotos con Timestamp e información de GPS embebida, audios de novedades y texto.
* Service Delivery Report (SDR): Documento consolidado mensual que sirve como justificación legal del Abono Fijo. Debe incluir el resumen de asistencia validado por el sistema REI para garantizar que el personal facturado coincide con el personal declarado ante el IPS.

7. Integración con Facturación Electrónica SIFEN (DNIT)

Flujo de Pre-liquidación

Consolidación de cargos fijos y variables (horas extras, insumos adicionales reportados en campo) para generar la pre-factura antes de la emisión del Documento Electrónico (DE).

Protocolo de Emisión SIFEN

1. Firma Digital: Generación de XML utilizando el Certificado Digital F1 provisto por entidades autorizadas en Paraguay (ej. Documenta o Bancard).
2. Obtención de CDC: Envío al WebService de SIFEN para validación y recepción del Código de Control (CDC).
3. Generación de e-KuDE: Creación del PDF reglamentario con el Código QR de validación.
4. Distribución Omnicanal: Envío automático del e-KuDE y XML al correo administrativo y al WhatsApp del contacto registrado en la Ficha del Cliente.

8. Arquitectura Técnica y Modelo de Datos

Modelo Entidad-Relación (E-R)

Cliente -> (1:N) -> Representantes Cliente -> (1:N) -> Establecimientos (Sucursales) Establecimiento -> (1:1) -> Geocerca Establecimiento -> (1:N) -> Contratos Empleado -> (N:M) -> Establecimientos (Historial de asignaciones)

Endpoints para Integración ERP

* GET /clientes?ruc={ruc}&tipo={PF|PJ}: Retorna ficha completa, incluyendo condición IVA y sociedad comercial.
* POST /contratos: Registra términos comerciales vinculados a un establecimiento.
* GET /facturas/cdc/{cdc_id}: Retorna el estado del DE y el link de descarga del e-KuDE.

Seguridad y Cumplimiento de Plazos Legales

El sistema debe integrar un motor de reglas para el cumplimiento de los plazos del MTESS e IPS:

* Alerta de Comunicación de Movimientos: Notificación obligatoria para procesar altas y bajas en el sistema REI e ingresar movimientos en el sistema REGOBPAT dentro del ventana legal de 3 días hábiles desde la ocurrencia del evento, evitando sanciones por parte de la Dirección de Registro Obrero Patronal.
* Auditoría: Log completo de cambios en datos de RUC y Representantes para trazabilidad ante requerimientos del SUACE.
