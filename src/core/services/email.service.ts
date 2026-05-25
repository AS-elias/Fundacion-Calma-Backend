import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resendApiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.resendApiKey = this.configService.get<string>('RESEND_API_KEY') || '';
    if (!this.resendApiKey) {
      this.logger.warn(
        '[EmailService] No se encontró RESEND_API_KEY. Se deshabilita el envío de correos.',
      );
    }
  }

  private async sendEmailViaResend(
    to: string,
    subject: string,
    html: string,
    text: string,
  ) {
    if (!this.resendApiKey) {
      this.logger.warn(
        '[EmailService] Envío omitido porque no hay RESEND_API_KEY.',
      );
      return;
    }

    const from =
      this.configService.get<string>('EMAIL_FROM') || 'onboarding@resend.dev';

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to,
          subject,
          html,
          text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          `Resend API Error: ${response.status} - ${JSON.stringify(data)}`,
        );
      }

      this.logger.log(`[EmailService] Email sent successfully via Resend: ${data.id}`);
    } catch (error) {
      this.logger.error('[EmailService] Error al enviar email con Resend', error);
      throw error;
    }
  }

  async sendNewUserNotification(
    to: string,
    payload: { nombre: string; email: string; password: string; rol: string },
  ) {
    const appUrl =
      this.configService.get<string>('APP_URL') || 'http://localhost:4200';
    const subject = 'Bienvenido a Fundación Calma - Cuenta creada';

    const text =
      `Hola ${payload.nombre},\n\n` +
      `Tu cuenta en Fundación Calma ha sido creada con éxito.\n` +
      `Email: ${payload.email}\n` +
      `Contraseña temporal: ${payload.password}\n` +
      `Rol: ${payload.rol}\n\n` +
      `Ingresa por primera vez en:\n` +
      `${appUrl}/login\n\n` +
      `Luego, cambia tu contraseña por una más segura desde tu perfil o mediante la opción de recuperación de contraseña.\n` +
      `Este correo se envió a tu cuenta real; si no lo ves, revisa spam o correo no deseado.\n\n` +
      `Saludos,\nEquipo Fundación Calma`;

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido a Fundación Calma</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f5f7fa; color: #333333;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f7fa; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                    
                    <!-- Header -->
                    <tr>
                        <td align="center" style="background-color: #048abf; padding: 40px 20px;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px;">¡Bienvenido a Calma!</h1>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 40px 20px 40px;">
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #555555;">
                                Hola <strong style="color: #2c3e50;">${payload.nombre}</strong>,
                            </p>
                            <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 1.6; color: #555555;">
                                Tu cuenta en la plataforma institucional ha sido creada con éxito bajo el rol de <strong>${payload.rol}</strong>. Para comenzar a utilizar tus herramientas, por favor inicia sesión utilizando tus credenciales temporales.
                            </p>
                            <!-- Credenciales -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa; border-left: 4px solid #048abf; border-radius: 4px; margin-bottom: 30px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="margin: 0 0 10px 0; font-size: 15px;"><strong>Correo:</strong> ${payload.email}</p>
                                        <p style="margin: 0; font-size: 15px;"><strong>Clave Temporal:</strong> <span style="font-family: monospace; background-color: #e2e8f0; padding: 4px 8px; border-radius: 4px; letter-spacing: 1px;">${payload.password}</span></p>
                                    </td>
                                </tr>
                            </table>
                            <!-- Botón -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 30px;">
                                <tr>
                                    <td align="center">
                                        <a href="${appUrl}/login" style="display: inline-block; background-color: #048abf; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-weight: bold; font-size: 16px; transition: background-color 0.3s;">
                                            Iniciar Sesión Ahora
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #7f8c8d;">
                                <em>Nota de Seguridad:</em> Por protección, el sistema te exigirá cambiar esta contraseña temporal por una nueva y privada durante tu primer inicio de sesión.
                            </p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td align="center" style="background-color: #f1f5f9; padding: 25px; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0; font-size: 13px; color: #94a3b8;">
                                © 2026 Fundación Calma. Todos los derechos reservados.<br>
                                Si no solicitaste esta cuenta, ignora este correo.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

    await this.sendEmailViaResend(to, subject, html, text);
  }

  async sendPasswordResetEmail(to: string, resetLink: string) {
    const subject = 'Recuperación de contraseña - Fundación Calma';
    const text =
      `Hola,\n\n` +
      `Has solicitado restablecer tu contraseña en Fundación Calma.\n` +
      `Ingresa al siguiente enlace para crear una nueva contraseña. Este enlace expirará en 15 minutos:\n\n` +
      `${resetLink}\n\n` +
      `Si no solicitaste este cambio, puedes ignorar este correo.\n\n` +
      `Saludos,\nEquipo Fundación Calma`;

    const html =
      `<p>Hola,</p>` +
      `<p>Has solicitado restablecer tu contraseña en <strong>Fundación Calma</strong>.</p>` +
      `<p>Haz clic en el siguiente enlace para crear una nueva contraseña. Este enlace expirará en 15 minutos:</p>` +
      `<p><a href="${resetLink}">Restablecer mi contraseña</a></p>` +
      `<p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>` +
      `<p><a href="${resetLink}">${resetLink}</a></p>` +
      `<p>Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>` +
      `<p>Saludos,<br/>Equipo Fundación Calma</p>`;

    await this.sendEmailViaResend(to, subject, html, text);
  }
}
