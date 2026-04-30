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
import { RolesFundacion } from '../../domain/enums/roles.enum';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../../../../core/services/email.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
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

    // 4. Si todo está bien, preparamos la información (Payload) para el Token
    const payload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol?.nombre,
    };

    // 5. Emitimos y retornamos el JWT
    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre_completo,
        email: usuario.email,
        rol: usuario.rol?.nombre,
      },
    };
  }

  async findAllUsers() {
    return this.usuarioRepository.findAll();
  }

  async updateUser(id: number, usuario: Partial<any>) {
    return this.usuarioRepository.update(id, usuario);
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
    const plainPassword =
      registerDto.password?.trim() || this.generateRandomPassword();
    if (!registerDto.password?.trim()) {
      this.logger.log(
        `No se envió contraseña explícita para ${registerDto.email}, se generó temporal.`,
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
    });

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
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre_completo,
        email: nuevoUsuario.email,
        rol: rolNombre,
      },
    };
  }

  private generateRandomPassword(length = 10): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*-_';
    return Array.from({ length }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length)),
    ).join('');
  }
}
