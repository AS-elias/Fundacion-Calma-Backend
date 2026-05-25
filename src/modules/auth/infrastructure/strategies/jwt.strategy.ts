import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      // Le dice a NestJS que busque el token en la cabecera "Authorization: Bearer <token>"
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      //IMPORTANTE: En producción esto debe venir de tu .env

      secretOrKey:
        process.env.JWT_SECRET ||
        '482e2c532202344f14e99e7136aa0a2fc5288f88b964f4f734586eb3b5345a4b',
    });
  }

  // Esta función se ejecuta AUTOMÁTICAMENTE si el token es válido
  async validate(payload: any) {
    // Verificamos si el usuario aún existe en la base de datos (por si lo eliminaron después de darle el token)
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id: payload.sub },
    });

    if (!usuario || usuario.estado === 'INACTIVO') {
      throw new UnauthorizedException(
        'Acceso denegado: Usuario no válido o inactivo',
      );
    }

    // Lo que retornes aquí, NestJS lo pegará en "req.user" para que lo uses en tus controladores
    return {
      id: payload.sub,
      email: payload.email,
      rol: payload.rol,
    };
  }
}
