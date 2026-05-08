import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from '../../application/services/auth.service';
import { LoginDto } from '../../application/dto/login.dto';
import { RegisterDto } from '../../application/dto/register.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto.email, loginDto.password);
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
}
