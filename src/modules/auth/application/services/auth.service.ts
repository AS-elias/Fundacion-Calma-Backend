import {
  Injectable,
  Inject,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { IUsuarioRepository } from '../../domain/repositories/usuario.repository';
import { USUARIO_REPOSITORY } from '../../domain/repositories/usuario.repository';
import { RegisterDto } from '../dto/register.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { RolesFundacion } from '../../domain/enums/roles.enum';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { EmailService } from '../../../../core/services/email.service';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
  ) {}

  async login(email: string, passwordPlana: string) {
    // 1. Buscar el usuario por email
    const usuario = await this.usuarioRepository.findByEmail(email);

    // 2. Si no existe, lanzamos error
    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (!usuario.estado || usuario.estado !== 'ACTIVO') {
      throw new UnauthorizedException('Cuenta desactivada');
    }

    // 3. Comparar la contraseña plana con el hash de la base de datos
    const passwordValida = await bcrypt.compare(
      passwordPlana,
      usuario.password_hash,
    );

    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // 4. Verificar si debe cambiar la contraseña
    if (usuario.debe_cambiar_password) {
      return {
        requirePasswordChange: true,
        usuarioId: usuario.id,
        email: usuario.email,
        mensaje: 'Debe cambiar su contraseña temporal antes de continuar.',
      };
    }

    // 4.1. Verificar si 2FA está habilitado
    if (usuario.is_two_factor_enabled && usuario.two_factor_secret) {
      if (usuario.two_factor_method === 'EMAIL') {
        const token = speakeasy.totp({
          secret: usuario.two_factor_secret,
          encoding: 'base32'
        });
        // Enviamos el código al instante sin bloquear el retorno
        this.emailService.send2FaCode(usuario.email, token).catch(e => {
          this.logger.error('Error enviando código 2FA por correo', e);
        });
      }
      return {
        require2fa: true,
        method: usuario.two_factor_method,
        usuarioId: usuario.id,
        mensaje: 'Se requiere código de verificación.'
      };
    }

    // 4. Si todo está bien, preparamos la información (Payload) para el Token
    const payload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol?.nombre,
    };

    // 5. Generar access_token y refresh_token
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    // 6. Retornar tokens y data del usuario
    return {
      access_token,
      refresh_token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre_completo,
        apellido: usuario.apellido_completo,
        email: usuario.email,
        foto_url: usuario.foto_url,
        rol: usuario.rol?.nombre,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verificar que el refresh_token sea válido
      const payload = this.jwtService.verify(refreshToken);

      if (!payload.sub) {
        throw new UnauthorizedException('Token inválido');
      }

      // Verificar que el usuario siga existiendo y esté activo
      const usuario = await this.usuarioRepository.findById(payload.sub);
      if (!usuario || usuario.estado !== 'ACTIVO') {
        throw new UnauthorizedException('Usuario no válido o inactivo');
      }

      // Generar nuevo access_token
      const newPayload = {
        sub: usuario.id,
        email: usuario.email,
        rol: usuario.rol?.nombre,
      };

      const new_access_token = this.jwtService.sign(newPayload);
      const new_refresh_token = this.jwtService.sign(newPayload, {
        expiresIn: '7d',
      });

      return {
        access_token: new_access_token,
        refresh_token: new_refresh_token,
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  async getCurrentUser(usuarioId: number) {
    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return {
      id: usuario.id,
      nombre: usuario.nombre_completo,
      email: usuario.email,
      rol: usuario.rol?.nombre,
    };
  }

  async findAllUsers() {
    return this.usuarioRepository.findAll();
  }

  async findUserById(id: number) {
    const usuario = await this.usuarioRepository.findById(id);

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return usuario;
  }

  async updateUser(id: number, usuario: Partial<any>) {
    return this.usuarioRepository.update(id, usuario);
  }

  async updateOwnProfile(id: number, usuario: Partial<any>) {
    const allowedFields = {
      nombre_completo: usuario.nombre_completo,
      apellido_completo: usuario.apellido_completo,
      telefono: usuario.telefono,
      puesto: usuario.puesto,
      foto_url: usuario.foto_url,
      fecha_nacimiento: usuario.fecha_nacimiento || undefined,
      linkedin_url: usuario.linkedin_url,
      biografia: usuario.biografia,
    };

    return this.usuarioRepository.update(id, allowedFields);
  }

  async changePassword(changePasswordDto: ChangePasswordDto) {
    const { email, tempPassword, newPassword } = changePasswordDto;

    const usuario = await this.usuarioRepository.findByEmail(email);
    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const passwordValida = await bcrypt.compare(
      tempPassword,
      usuario.password_hash,
    );
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (!usuario.debe_cambiar_password) {
      throw new BadRequestException(
        'El usuario no requiere cambio de contraseña obligatorio',
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.usuarioRepository.update(usuario.id, {
      password_hash: passwordHash,
      debe_cambiar_password: false,
    } as any);

    // Auto-login: Generamos los tokens para que ingrese directo al sistema
    const payload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol?.nombre,
    };

    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      mensaje: 'Contraseña actualizada exitosamente',
      access_token,
      refresh_token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre_completo,
        apellido: usuario.apellido_completo,
        email: usuario.email,
        foto_url: usuario.foto_url,
        rol: usuario.rol?.nombre,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const configuredDomains = (process.env.ALLOWED_EMAIL_DOMAINS || '')
      .split(',')
      .map((domain) => domain.trim().toLowerCase())
      .filter(Boolean);
    const emailDomain = registerDto.email.split('@')[1]?.toLowerCase();
    if (
      configuredDomains.length > 0 &&
      (!emailDomain || !configuredDomains.includes(emailDomain))
    ) {
      throw new BadRequestException(
        `El correo debe pertenecer a uno de estos dominios: ${configuredDomains.join(', ')}`,
      );
    }

    // 1. Verificar que el email no exista
    const usuarioExistente = await this.usuarioRepository.findByEmail(
      registerDto.email,
    );
    if (usuarioExistente) {
      throw new ConflictException('El email ya está registrado');
    }

    // 2. Generar o validar contraseña enviada
    let plainPassword = registerDto.password?.trim();
    let debe_cambiar_password = false;
    if (!plainPassword) {
      plainPassword = this.generarPasswordAleatoria();
      debe_cambiar_password = true;
      this.logger.log(
        `No se envió contraseña explícita para ${registerDto.email}, se generó una contraseña temporal aleatoria.`,
      );
    }
    if (plainPassword.length < 6) {
      throw new BadRequestException(
        'La contraseña debe tener mínimo 6 caracteres',
      );
    }

    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const rolValor = (registerDto.rol || RolesFundacion.PRACTICANTE)
      .toString()
      .trim();
    const rolNombre =
      rolValor.charAt(0).toUpperCase() + rolValor.slice(1).toLowerCase();

    const rol = await this.usuarioRepository.findRoleByName(rolNombre);
    if (!rol) {
      throw new BadRequestException(
        `No existe el rol ${rolValor} en la base de datos`,
      );
    }

    const nuevoUsuario = await this.usuarioRepository.create({
      email: registerDto.email,
      nombre_completo: registerDto.nombre_completo,
      apellido_completo: registerDto.apellido_completo,
      password_hash: passwordHash,
      puesto: registerDto.puesto || 'Practicante',
      estado: 'ACTIVO',
      rol_id: rol.id,
      debe_cambiar_password,
      fecha_fin_contrato: registerDto.fecha_fin_contrato ? new Date(registerDto.fecha_fin_contrato) : undefined,
    } as any);

    await this.registrarInicioNotificaciones(nuevoUsuario.id, registerDto.fecha_ingreso);
    await this.crearBienvenidaNuevoUsuario(nuevoUsuario);

    try {
      await this.emailService.sendNewUserNotification(nuevoUsuario.email, {
        nombre: `${nuevoUsuario.nombre_completo} ${nuevoUsuario.apellido_completo}`,
        email: nuevoUsuario.email,
        password: plainPassword,
        rol: rolNombre,
      });
    } catch (emailError) {
      this.logger.error('Error enviando email de nuevo usuario', emailError);
      // no bloqueamos la creación por el fallo del email; se puede retentar manualmente.
    }

    return {
      mensaje: 'Usuario registrado exitosamente',
      passwordTemporal: debe_cambiar_password ? plainPassword : null,
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre_completo,
        email: nuevoUsuario.email,
        rol: rolNombre,
      },
    };
  }

  private async crearBienvenidaNuevoUsuario(usuario: any): Promise<void> {
    const nombre = usuario.nombre_completo || 'usuario';

    await this.prisma.notificaciones.create({
      data: {
        usuario_id: usuario.id,
        titulo: 'Bienvenido a CALMA',
        tipo: 'comunicados',
        leido: false,
        imagen: null,
        mensaje: [
          `Hola ${nombre}, bienvenido a la plataforma de Fundacion Calma.`,
          'Desde aqui podras revisar tus notificaciones, acceder a recursos internos y dar seguimiento a las actividades segun tu rol.',
          'Atte. Equipo CALMA',
        ].join('\n\n'),
      },
    });
  }

  private async registrarInicioNotificaciones(
    usuarioId: number,
    fechaIngreso?: string,
  ): Promise<void> {
    const data = { 
      usuario_id: usuarioId,
      ...(fechaIngreso && { fecha_ingreso: new Date(fechaIngreso) })
    };
    
    await this.prisma.notificacion_inicio_usuario.upsert({
      where: { usuario_id: usuarioId },
      create: data as any,
      update: {},
    });
  }

  private generarPasswordAleatoria(longitud: number = 10): string {
    const mayusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const minusculas = 'abcdefghijklmnopqrstuvwxyz';
    const numeros = '0123456789';
    const simbolos = '!@#$%^&*_=+-';
    const todos = mayusculas + minusculas + numeros + simbolos;

    let password = '';
    password += mayusculas[Math.floor(Math.random() * mayusculas.length)];
    password += minusculas[Math.floor(Math.random() * minusculas.length)];
    password += numeros[Math.floor(Math.random() * numeros.length)];
    password += simbolos[Math.floor(Math.random() * simbolos.length)];

    for (let i = password.length; i < longitud; i++) {
      password += todos[Math.floor(Math.random() * todos.length)];
    }
    return password
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const usuario = await this.usuarioRepository.findByEmail(email);

    if (usuario) {
      const payload = { sub: usuario.id, email: usuario.email };
      const secret = process.env.JWT_SECRET + usuario.password_hash;
      const token = this.jwtService.sign(payload, { secret, expiresIn: '15m' });

      const appUrl = process.env.APP_URL || 'http://localhost:4200';
      const resetLink = `${appUrl}/reset-password?token=${token}`;

      await this.emailService.sendPasswordResetEmail(usuario.email, resetLink);
    }

    return {
      mensaje:
        'Si el correo existe en nuestro sistema, te hemos enviado un enlace para restablecer tu contraseña.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    let payload: any;
    try {
      payload = this.jwtService.decode(token);
    } catch (e) {
      throw new BadRequestException('Token inválido o malformado');
    }

    if (!payload || !payload.email) {
      throw new BadRequestException('Token inválido');
    }

    const usuario = await this.usuarioRepository.findByEmail(payload.email);
    if (!usuario) {
      throw new BadRequestException('Usuario no encontrado');
    }

    const secret = process.env.JWT_SECRET + usuario.password_hash;

    try {
      this.jwtService.verify(token, { secret });
    } catch (e) {
      throw new BadRequestException(
        'El token ha expirado o ya ha sido utilizado.',
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.usuarioRepository.update(usuario.id, {
      password_hash: passwordHash,
      debe_cambiar_password: false,
    } as any);

    return {
      mensaje:
        'Contraseña actualizada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.',
    };
  }

  // --- MÉTODOS DE 2FA ---

  async generate2fa(usuarioId: number, method: 'APP' | 'EMAIL') {
    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario) throw new UnauthorizedException('Usuario no encontrado');

    const secret = speakeasy.generateSecret({
      name: `Fundación Calma (${usuario.email})`
    });

    // Guardar el secreto de forma temporal (aún no está enabled)
    await this.usuarioRepository.update(usuarioId, {
      two_factor_secret: secret.base32,
    });

    if (method === 'EMAIL') {
      const token = speakeasy.totp({
        secret: secret.base32,
        encoding: 'base32'
      });
      await this.emailService.send2FaCode(usuario.email, token);
      return { method: 'EMAIL', message: 'Código enviado al correo para confirmación.' };
    } else {
      const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url!);
      return { method: 'APP', qrCodeUrl: qrCodeDataUrl, secret: secret.base32 };
    }
  }

  async enable2fa(usuarioId: number, code: string, method: 'APP' | 'EMAIL') {
    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario || !usuario.two_factor_secret) {
      throw new BadRequestException('Secreto no encontrado. Genera el código 2FA primero.');
    }

    const isVerified = speakeasy.totp.verify({
      secret: usuario.two_factor_secret,
      encoding: 'base32',
      token: code,
      window: 2 // Tolerar ligero retraso de tiempo
    });

    if (!isVerified) {
      throw new BadRequestException('Código incorrecto o expirado.');
    }

    await this.usuarioRepository.update(usuarioId, {
      is_two_factor_enabled: true,
      two_factor_method: method
    });

    return { message: 'Autenticación en dos pasos habilitada con éxito.' };
  }

  async disable2fa(usuarioId: number) {
    await this.usuarioRepository.update(usuarioId, {
      is_two_factor_enabled: false,
      two_factor_secret: null,
      two_factor_method: null
    });
    return { message: 'Autenticación en dos pasos deshabilitada.' };
  }

  async resend2faEmail(usuarioId: number) {
    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario || !usuario.is_two_factor_enabled || !usuario.two_factor_secret) {
       throw new BadRequestException('2FA no habilitado');
    }
    const token = speakeasy.totp({
      secret: usuario.two_factor_secret,
      encoding: 'base32'
    });
    await this.emailService.send2FaCode(usuario.email, token);
    return { message: 'Código reenviado al correo.' };
  }

  async authenticate2fa(usuarioId: number, code: string) {
    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario || !usuario.is_two_factor_enabled || !usuario.two_factor_secret) {
      throw new UnauthorizedException('El usuario no tiene 2FA habilitado');
    }

    const isVerified = speakeasy.totp.verify({
      secret: usuario.two_factor_secret,
      encoding: 'base32',
      token: code,
      window: 2
    });

    if (!isVerified) {
      throw new UnauthorizedException('Código incorrecto o expirado');
    }

    // Generar el token JWT final ya que superó la prueba
    const payload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol?.nombre,
    };
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      access_token,
      refresh_token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre_completo,
        apellido: usuario.apellido_completo,
        email: usuario.email,
        foto_url: usuario.foto_url,
        rol: usuario.rol?.nombre,
      },
    };
  }
}
