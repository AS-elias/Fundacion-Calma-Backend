import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { TransportOptions } from 'nodemailer';

type EmailProvider = 'smtp' | 'resend' | 'google-script';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly provider: EmailProvider;
  private transporter?: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.provider = this.resolveProvider();
    if (this.provider === 'smtp') {
      this.initializeSmtpTransporter();
    }

    const scriptUrl = this.configService.get<string>('GOOGLE_SCRIPT_EMAIL_URL');
    this.logger.log(
      `[EmailService] Provider activo: ${this.provider}` +
        (this.provider === 'google-script'
          ? ` | script=${scriptUrl ? 'configurada' : 'FALTA GOOGLE_SCRIPT_EMAIL_URL'}`
          : ''),
    );

    if (this.provider === 'google-script' && !scriptUrl) {
      this.logger.error(
        '[EmailService] EMAIL_PROVIDER=google-script pero falta GOOGLE_SCRIPT_EMAIL_URL en variables de entorno (Render/local)',
      );
    }
  }

  /** Render Free bloquea SMTP (465/587). Preferir google-script o resend en producción. */
  private resolveProvider(): EmailProvider {
    const explicit = this.configService
      .get<string>('EMAIL_PROVIDER')
      ?.trim()
      .toLowerCase();

    const googleUrl = this.configService.get<string>('GOOGLE_SCRIPT_EMAIL_URL')?.trim();
    const resendKey = this.configService.get<string>('RESEND_API_KEY')?.trim();
    const emailHost = this.configService.get<string>('EMAIL_HOST');
    const emailUser = this.configService.get<string>('EMAIL_USER');
    const emailPass = this.configService.get<string>('EMAIL_PASS');
    const hasSmtp = Boolean(emailHost && emailUser && emailPass);

    if (explicit === 'resend') {
      return 'resend';
    }

    if (explicit === 'google-script') {
      return 'google-script';
    }

    // Si hay URL del script, usarla aunque EMAIL_PROVIDER=smtp o SMTP incompleto (caso Render)
    if (googleUrl && explicit !== 'resend') {
      if (explicit === 'smtp') {
        this.logger.warn(
          '[EmailService] GOOGLE_SCRIPT_EMAIL_URL definida; ignorando EMAIL_PROVIDER=smtp sin credenciales SMTP completas',
        );
      }
      return 'google-script';
    }

    if (resendKey) {
      return 'resend';
    }

    if (explicit === 'smtp' || hasSmtp) {
      if (!hasSmtp) {
        this.logger.error(
          '[EmailService] SMTP incompleto (faltan HOST/USER/PASS). En Render usa EMAIL_PROVIDER=google-script y GOOGLE_SCRIPT_EMAIL_URL',
        );
      } else {
        this.logger.warn(
          '[EmailService] SMTP activo; en Render Free los puertos 465/587 suelen estar bloqueados',
        );
      }
      return 'smtp';
    }

    this.logger.error(
      '[EmailService] Correo no configurado. Añade GOOGLE_SCRIPT_EMAIL_URL + EMAIL_PROVIDER=google-script',
    );
    return 'google-script';
  }

  private initializeSmtpTransporter() {
    const emailHost = this.configService.get<string>('EMAIL_HOST');
    const emailPort = Number(this.configService.get<string>('EMAIL_PORT') ?? 465);
    const emailSecure = this.configService.get<string>('EMAIL_SECURE') === 'true';
    const emailUser = this.configService.get<string>('EMAIL_USER');
    const emailPass = this.configService.get<string>('EMAIL_PASS');

    if (!emailHost || !emailUser || !emailPass) {
      this.logger.warn('[EmailService] SMTP incompleto');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailSecure,
      auth: { user: emailUser, pass: emailPass },
      family: 4,
      connectionTimeout: 30000,
      socketTimeout: 30000,
    } as TransportOptions);
    this.logger.log('[EmailService] SMTP transporter listo (solo desarrollo / hosting con SMTP)');
  }

  private getFromAddress(): string {
    return (
      this.configService.get<string>('RESEND_FROM') ||
      this.configService.get<string>(
        'EMAIL_FROM',
        'Fundación Calma <onboarding@resend.dev>',
      )
    );
  }

  private async sendViaResend(
    to: string,
    subject: string,
    html: string,
    text: string,
  ) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      throw new Error('RESEND_API_KEY no configurada');
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.getFromAddress(),
        to: [to],
        subject,
        html,
        text,
      }),
    });

    const body = (await response.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
    };

    if (!response.ok) {
      throw new Error(body.message || `Resend HTTP ${response.status}`);
    }

    this.logger.log(
      `[EmailService] Email enviado vía Resend a ${to} (id: ${body.id ?? 'n/a'})`,
    );
    return body;
  }

  private async sendViaGoogleScript(
    to: string,
    subject: string,
    html: string,
    text: string,
  ) {
    const scriptUrl = this.configService.get<string>('GOOGLE_SCRIPT_EMAIL_URL');
    if (!scriptUrl) {
      throw new Error('GOOGLE_SCRIPT_EMAIL_URL no configurada');
    }

    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        subject,
        html,
        text,
        from: this.getFromAddress(),
      }),
      redirect: 'follow',
    });

    const responseText = await response.text();

    if (response.status === 403 || responseText.includes('Acceso denegado')) {
      throw new Error(
        'Google Apps Script: acceso denegado (403). Redespliega la app web con "Quién tiene acceso: Cualquier persona". Ver scripts/DEPLOY-GOOGLE-EMAIL.md',
      );
    }

    if (!response.ok) {
      throw new Error(
        `Google Script HTTP ${response.status}: ${responseText.slice(0, 200)}`,
      );
    }

    let parsed: { ok?: boolean; error?: string } = {};
    try {
      parsed = JSON.parse(responseText) as { ok?: boolean; error?: string };
    } catch {
      throw new Error(
        `Google Script no devolvió JSON. ¿URL /exec correcta? Respuesta: ${responseText.slice(0, 120)}`,
      );
    }

    if (parsed.ok === false) {
      throw new Error(parsed.error || 'Google Script rechazó el envío');
    }

    this.logger.log(`[EmailService] Email enviado vía Google Script a ${to}`);
    return parsed;
  }

  private async sendViaSmtp(
    to: string,
    subject: string,
    html: string,
    text: string,
  ) {
    if (!this.transporter) {
      const googleUrl = this.configService.get<string>('GOOGLE_SCRIPT_EMAIL_URL');
      if (googleUrl) {
        this.logger.warn(
          '[EmailService] SMTP no disponible; enviando por Google Apps Script',
        );
        return this.sendViaGoogleScript(to, subject, html, text);
      }
      throw new Error(
        'Correo no configurado: define GOOGLE_SCRIPT_EMAIL_URL y EMAIL_PROVIDER=google-script en Render',
      );
    }

    const result = await this.transporter.sendMail({
      from: this.getFromAddress(),
      to,
      subject,
      text,
      html,
    });

    this.logger.log(
      `[EmailService] Email enviado vía SMTP a ${to} (MessageID: ${result.messageId})`,
    );
    return result;
  }

  private async sendEmail(
    to: string,
    subject: string,
    html: string,
    text: string,
  ) {
    try {
      this.logger.debug(`[EmailService] Enviando a ${to} (${this.provider})`);

      switch (this.provider) {
        case 'resend':
          return await this.sendViaResend(to, subject, html, text);
        case 'google-script':
          return await this.sendViaGoogleScript(to, subject, html, text);
        default:
          return await this.sendViaSmtp(to, subject, html, text);
      }
    } catch (error) {
      this.logger.error('[EmailService] Error sending email', {
        provider: this.provider,
        message: error instanceof Error ? error.message : String(error),
        to,
        subject,
      });
      throw error;
    }
  }

  async sendNewUserNotification(
    to: string,
    payload: { nombre: string; email: string; password: string; rol: string },
  ) {
    const appUrl =
      this.configService.get<string>('APP_URL') ||
      'https://fundacion-calma-fronted.onrender.com';
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

    await this.sendEmail(to, subject, html, text);
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

    await this.sendEmail(to, subject, html, text);
  }

  async send2FaCode(to: string, code: string) {
    const subject = 'Código de Autenticación (2FA) - Fundación Calma';
    const text =
      `Hola,\n\n` +
      `Tu código de seguridad de 6 dígitos es: ${code}\n\n` +
      `Este código expirará en 10 minutos.\n` +
      `Si no solicitaste este código, ignora este correo.\n\n` +
      `Saludos,\nEquipo Fundación Calma`;

    const html =
      `<p>Hola,</p>` +
      `<p>Se ha solicitado un acceso a tu cuenta.</p>` +
      `<p>Tu código de seguridad es:</p>` +
      `<h2 style="background-color:#f1f5f9; padding:10px; border-radius:5px; text-align:center; font-family:monospace; letter-spacing:5px;">${code}</h2>` +
      `<p>Este código expirará en 10 minutos.</p>` +
      `<p>Si no solicitaste este código, ignora este correo de forma segura.</p>` +
      `<p>Saludos,<br/>Equipo Fundación Calma</p>`;

    await this.sendEmail(to, subject, html, text);
  }
}
