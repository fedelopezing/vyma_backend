# Resumen Ejecutivo: Módulo de Usuarios (Users)

Este documento detalla el propósito de negocio, la arquitectura técnica y el comportamiento del módulo `users` en el sistema.

---

## 1. Propósito de Negocio

El módulo `users` se encarga de la gestión y aprovisionamiento de las identidades de usuario en la plataforma. Controla la creación administrativa de cuentas, la asignación de roles y la orquestación inicial para el proceso de activación de cuentas por correo electrónico.

---

## 2. Flujo de Entrada (Endpoints y API)

El módulo restringe la creación de cuentas exclusivamente a administradores:
*   `POST /users`: Recibe los datos básicos del usuario (`name`, `email`, `roleId`). Está protegido por `AuthGuard('jwt')` y `UserRoleGuard`, garantizando que únicamente usuarios con el rol `admin` puedan consumirlo.

---

## 3. Lógica de Negocio y Transaccionalidad

*   **Creación de Cuentas:** Cuando se registra un usuario, el sistema:
    1. Genera una contraseña aleatoria temporal y la hashea con `bcrypt`.
    2. Registra al usuario en estado inactivo (`isActive = false`).
    3. Genera un token temporal de activación a través de `ActivationTokensService`.
    4. Emite un evento de dominio `user.created` para disparar notificaciones asíncronas.
*   **Transaccionalidad:** Para garantizar que el usuario no se cree si el token de activación falla (o viceversa), todo este flujo se ejecuta de forma atómica dentro de una transacción de base de datos (`runInTransaction`).

---

## 4. Eventos y Listeners (Desacoplamiento)

*   **`UserCreatedEvent` (Evento):** Contiene la información del usuario creado y el token de activación generado.
*   **`UserCreatedListener` (Escuchador):** Escucha el evento `'user.created'`. Su única responsabilidad es invocar asíncronamente a `EmailService` para enviar un correo de bienvenida al usuario con su enlace y token de activación. Si el envío falla, captura el error y lo registra en los logs del sistema sin interrumpir la experiencia del flujo principal.
