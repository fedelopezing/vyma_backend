### Especificación de Requisitos de Producto (PRD): Módulo de Gestión y Control de Personal (Paraguay)

##### 1\. Objetivos del Producto y Alcance Normativo

El propósito central de este módulo es la unificación, automatización y blindaje legal de los registros laborales exigidos por la normativa paraguaya. El sistema actúa como el motor de cumplimiento para la empresa, garantizando que cada registro de asistencia y cada movimiento de nómina se traduzca fielmente en las declaraciones exigidas por el Estado.**Misión Estratégica:**  Centralizar la gestión operativa del capital humano mediante la integración mandatoria con el Registro Electrónico de Información (REI) del Instituto de Previsión Social (IPS) y el sistema de Registro Obrero Patronal (REOP) del Ministerio de Trabajo, Empleo y Seguridad Social (MTESS), bajo los lineamientos técnicos de la Resolución 527/2024.

##### 2\. Formalización de la Empresa y Configuración Inicial (Vía SUACE/VUE)

El sistema debe guiar al usuario a través del proceso de formalización ante el Sistema Unificado de Apertura y Cierre de Empresas (SUACE) y la Ventanilla Única de Exportación (VUE), aplicando lógica condicional para evitar errores de registro:

* **Lógica de Registro Inicial:**  El sistema consultará: "¿Cuenta la empresa con registro previo en IPS y MTESS?".  
* Si  **NO** : Redirigir a "Solicitud Registro Empresa – SUACE".  
* Si  **SÍ** : Redirigir a "Solicitud Cédula MIPYMES".  
* **Diferenciación de Entidades:**  Carga obligatoria del  **Formulario N° 1**  para  **Empresas Físicas**  o el  **Formulario N° 2**  para  **Empresas Jurídicas** .  
* **Gestión de Credenciales VUE:**  Proceso automatizado para la obtención de Usuario y Contraseña en el portal  **VUE (vue.org.py)** .  
* **Workflow de Verificación Profesional:**  Se implementará un estado de "Pendiente de Verificación". El sistema impedirá la impresión final hasta que el usuario confirme que ha enviado el borrador al correo oficial (jorge.aguayo@suace.gov.py) y recibido el retorno de validación técnica.  
* **Carga de Documentos Críticos y Reglas de Vencimiento:**  
* **Cédula Tributaria:**  El sistema debe predefinir por defecto la fecha de vencimiento al  **31/12/3000** .  
* **Constancia SET:**  El sistema debe predefinir por defecto la fecha de vencimiento al  **31/12/3000** .  
* **Declaración de Renta (Formulario 101):**  La fecha de vencimiento se calculará automáticamente a un año de la fecha de presentación del año anterior.  
* **Escritura de Constitución:**  Requisito bloqueante para personas jurídicas.

##### 3\. Legajo Digital del Colaborador y Parámetros Salariales

El legajo debe cumplir con la captura de datos biográficos y legales, aplicando validaciones de integridad de datos (campos de Cédula de Identidad numéricos y únicos).**Tabla: Parámetros de Aportes y Beneficios**| Concepto | Porcentaje Aplicable | Base de Cálculo || \------ | \------ | \------ || Aporte Obrero (Retención IPS) | 9% | Salario Bruto || Aporte Patronal (Costo Empresa) | 16.5% | Salario Bruto || Provisión de Aguinaldo | 8.33% | Salario Bruto |  
**Gestión de Representantes y Lógica de Socios:**  Para la validez legal ante el portal VUE, el sistema capturará: CI, Nacionalidad, Género, Estado Civil, Dirección, Cargo y Profesión. Si el tipo de persona es  **Socio** , se habilitarán campos obligatorios de profundidad de datos:

* **Nro de Acciones suscriptas.**  
* **Valor de cada Acción.**  
* **Valor total en Bienes aportados.**

##### 4\. Control de Asistencia y Gestión de Personal en Campo

Para garantizar la inalterabilidad de los datos de jornada, el módulo exige:

* **Geocercas (Geofencing):**  Restricción de marcación a perímetros específicos parametrizados por sucursal.  
* **Marcación Offline:**  Registro local con marca de tiempo (Timestamp) protegida y sincronización automática tras detectar conectividad.  
* **Reconocimiento Facial:**  Validación biométrica obligatoria en cada marcación para evitar la suplantación ("buddy punching").

##### 5\. Cómputo de Horas y Pre-liquidación

El sistema procesará los eventos de asistencia para alimentar la nómina legal.

* **Alertas de Movimientos:**  El sistema debe generar alertas automáticas para la comunicación de altas y bajas de personal dentro del periodo de 48 horas exigido por la práctica administrativa para evitar multas.  
* **Estructura REI:**  La pre-liquidación consolidará horas ordinarias, extraordinarias y ausencias en el formato de exportación requerido por el sistema REI de IPS.

##### 6\. Exportaciones Legales y Conectividad Bancaria

El módulo debe generar entregables digitales nativos:

* **Sistema REI (IPS):**  Archivos planos (.txt) para declaración mensual de salarios y movimientos.  
* **Sistema REGOBPAT (MTESS):**  Generación de planillas laborales anuales y semestrales.  
* **Dispersión de Haberes:**  Exportación de archivos TXT/CSV configurables según la estructura de los principales bancos de plaza para el pago electrónico de salarios.

##### 7\. Requisitos de Arquitectura y API REST

* **Interoperabilidad:**  Exposición de servicios vía  **API REST**  para integración bidireccional con ERPs.  
* **Manejo de Documentación:**  La API debe soportar protocolos  **multipart/form-data**  para la carga masiva de archivos pesados (Escrituras de Constitución, Cédulas Tributarias) en formatos  **PDF**  y  **TIFF** .  
* **Seguridad y Auditoría:**  Control de acceso basado en roles (RBAC) con trazabilidad total de cambios en el legajo del empleado.

##### 8\. Obligaciones y Plazos Post-Formalización

Calendario de cumplimiento integrado en el sistema para alertar al empleador sobre sus responsabilidades vigentes:  
CALENDARIO DE CUMPLIMIENTO LABORAL (PARAGUAY):  
\+-----------------------+--------------------------+-----------------------+  
| Obligación            | Frecuencia               | Portal Relacionado    |  
\+-----------------------+--------------------------+-----------------------+  
| Declaración Salarios  | Mensual (Vcto. variable) | Sistema REI (IPS)     |  
| Comunicación de Alta  | Máximo 48hs de ingreso   | Sistema REI (IPS)     |  
| Planillas Laborales   | Según cronograma MTESS   | REGOBPAT (MTESS)      |  
| Comunicación de Baja  | Máximo 48hs del cese     | REI / REGOBPAT        |  
| Renovación Renta/SET  | Anual (Post-cierre)      | VUE / SUACE           |  
\+-----------------------+--------------------------+-----------------------+

