import {
    Controller,
    Get,
    UseGuards,
    Query,
} from '@nestjs/common';
import { AuthService } from '../../application/services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('usuarios')
export class UsuariosController {
    constructor(private readonly authService: AuthService) { }

    // Buscar usuarios por email (para comunicaciones)
    @UseGuards(JwtAuthGuard)
    @Get('search')
    async searchUsers(@Query('email') email: string) {
        if (!email || email.trim().length < 3) {
            return { users: [] };
        }
        const users = await this.authService.findAllUsers();
        const filtered = users.filter(user =>
            user.email.toLowerCase().includes(email.toLowerCase().trim()) &&
            user.estado === 'ACTIVO'
        );
        return {
            users: filtered.map(user => ({
                id: user.id,
                email: user.email,
                nombre: user.nombre_completo,
                apellido: user.apellido_completo,
                rol: user.rol?.nombre,
                fotoUrl: user.foto_url,
            }))
        };
    }
}