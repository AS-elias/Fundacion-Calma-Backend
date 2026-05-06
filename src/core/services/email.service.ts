import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

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
    });
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
      `Por favor ingresa y cambia tu contraseña desde la opción de perfil o recuperación:\n` +
      `${appUrl}/login\n\n` +
      `Saludos,\nEquipo Fundación Calma`;

    const html =
      `<p>Hola <strong>${payload.nombre}</strong>,</p>` +
      `<p>Tu cuenta en Fundación Calma ha sido creada con éxito.</p>` +
      `<ul>` +
      `<li><strong>Email:</strong> ${payload.email}</li>` +
      `<li><strong>Contraseña temporal:</strong> ${payload.password}</li>` +
      `<li><strong>Rol:</strong> ${payload.rol}</li>` +
      `</ul>` +
      `<p>Cambia tu contraseña en <a href="${appUrl}/login">${appUrl}/login</a>.</p>` +
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
      this.logger.log(`[EmailService] new-user email sent: ${info.messageId}`);
    } catch (error) {
      this.logger.error(
        '[EmailService] Error al enviar email de usuario nuevo',
        error,
      );
      throw error;
    }
  }
}
