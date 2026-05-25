import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as dns from 'dns';

// Forzar el uso de IPv4 por defecto para evitar problemas (ESOCKET) en servidores como Render
// que no soportan bien las conexiones salientes por IPv6 hacia smtp.gmail.com
dns.setDefaultResultOrder('ipv4first');

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('EMAIL_HOST');
    const port = Number(this.configService.get<number>('EMAIL_PORT') ?? 587);
    const secure = this.configService.get<string>('EMAIL_SECURE') === 'true';
    const user = this.configService.get<string>('EMAIL_USER');
    const pass = this.configService.get<string>('EMAIL_PASS');

    if (!host || !user || !pass) {
      this.logger.warn(
        '[EmailService] No se encontraron credenciales SMTP (EMAIL_HOST/EMAIL_USER/EMAIL_PASS). Se deshabilita envío de correos.',
      );
      // No inicializamos transporter para evitar intentos de login con credenciales vacías.
      this.transporter = null;
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      family: 4, // Forzar la resolución y conexión por IPv4
    } as any);
  }

  async sendNewUserNotification(
    to: string,
    payload: { nombre: string; email: string; password: string; rol: string },
  ) {
    if (!this.transporter) {
      this.logger.warn(
        '[EmailService] Transporter no inicializado, envío de email omitido (sin SMTP).',
      );
      return;
    }

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

    try {
      const info = await this.transporter.sendMail({
        from:
          this.configService.get<string>('EMAIL_FROM') || 'no-reply@calma.org',
        to,
        subject,
        text,
        html,
      });
      this.logger.log(`[EmailService] new-user email sent: ${info.messageId}`);
    } catch (error) {
      this.logger.error(
        '[EmailService] Error al enviar email de usuario nuevo',
        error,
      );
      throw error;
    }
  }

  async sendPasswordResetEmail(to: string, resetLink: string) {
    if (!this.transporter) {
      this.logger.warn(
        '[EmailService] Transporter no inicializado, envío de email de recuperación omitido.',
      );
      return;
    }

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

    try {
      const info = await this.transporter.sendMail({
        from:
          this.configService.get<string>('EMAIL_FROM') || 'no-reply@calma.org',
        to,
        subject,
        text,
        html,
      });
      this.logger.log(
        `[EmailService] Password reset email sent: ${info.messageId}`,
      );
    } catch (error) {
      this.logger.error(
        '[EmailService] Error al enviar email de recuperación de contraseña',
        error,
      );
      throw error;
    }
  }
}
