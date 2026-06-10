export const welcomeActivationTemplate = (
  name: string,
  activationLink: string,
) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Bienvenido a Harmonia</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>¡Bienvenido a Harmonia, ${name}!</h2>
        <p>Tu cuenta ha sido creada exitosamente. Para activarla y configurar tu contraseña, por favor haz clic en el siguiente enlace:</p>
        <p style="text-align: center; margin: 30px 0;">
            <a href="${activationLink}" style="background-color: #4CAF50; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block; border-radius: 4px;">Activar mi cuenta</a>
        </p>
        <p>Este enlace expirará en 24 horas por motivos de seguridad.</p>
        <p>Si no solicitaste esta cuenta, puedes ignorar este correo de forma segura.</p>
        <br>
        <p>Saludos,<br>El equipo de Harmonia</p>
    </div>
</body>
</html>
`;
