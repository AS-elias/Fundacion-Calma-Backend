import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from '../../application/services/auth.service';
import { LoginDto } from '../../application/dto/login.dto';
import { RegisterDto } from '../../application/dto/register.dto';

import { ForgotPasswordDto } from '../../application/dto/forgot-password.dto';
import { ResetPasswordDto } from '../../application/dto/reset-password.dto';
import { ChangePasswordDto } from '../../application/dto/change-password.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { PerfilStorageService } from '../../application/services/perfil-storage.service';

type UploadedProfileFile = {
  originalname: string;
  buffer: Buffer;
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly perfilStorage: PerfilStorageService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto);
  }

  /** Primer ingreso: contraseña temporal → nueva contraseña (+ tokens) */
  @Post('change-password')
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    return await this.authService.changePassword(changePasswordDto);
  }

  // 📝 REGISTRO - Solo administradores pueden crear nuevos usuarios
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  // 🔥 RUTA PROTEGIDA DE PRUEBA
  @UseGuards(JwtAuthGuard)
  @Get('perfil')
  obtenerPerfilProtegido(@Req() req: any) {
    return {
      mensaje: '¡Acceso autorizado a la zona segura!',
      usuario: req.user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  obtenerMiPerfil(@Req() req: any) {
    return this.authService.findUserById(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @UseInterceptors(FileInterceptor('foto'))
  async actualizarMiPerfil(
    @Req() req: any,
    @Body() body: any,
    @UploadedFile() foto?: UploadedProfileFile,
  ) {
    let fotoUrl: string | undefined;

    if (foto) {
      const storedFile = await this.perfilStorage.saveFile(foto);
      fotoUrl = storedFile.urlArchivo;
    }

    return this.authService.updateOwnProfile(req.user.id, {
      ...body,
      ...(fotoUrl ? { foto_url: fotoUrl } : {}),
    });
  }

  // Listar usuarios (admin)
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('users')
  listarUsuarios() {
    return this.authService.findAllUsers();
  }

  // Actualizar usuario (admin)
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch('users/:id')
  actualizarUsuario(@Param('id') id: string, @Body() body: any) {
    return this.authService.updateUser(Number(id), body);
  }

  // --- 2FA ENDPOINTS ---

  @UseGuards(JwtAuthGuard)
  @Post('2fa/generate')
  generate2fa(@Req() req: any, @Body('method') method: 'APP' | 'EMAIL') {
    return this.authService.generate2fa(req.user.id, method);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/enable')
  enable2fa(@Req() req: any, @Body('code') code: string, @Body('method') method: 'APP' | 'EMAIL') {
    return this.authService.enable2fa(req.user.id, code, method);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/disable')
  disable2fa(@Req() req: any) {
    return this.authService.disable2fa(req.user.id);
  }

  @Post('2fa/authenticate')
  authenticate2fa(@Body('usuarioId') usuarioId: number, @Body('code') code: string) {
    return this.authService.authenticate2fa(usuarioId, code);
  }

  @Post('2fa/resend')
  resend2faEmail(@Body('usuarioId') usuarioId: number) {
    return this.authService.resend2faEmail(usuarioId);
  }
}
