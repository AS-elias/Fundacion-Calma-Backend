import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { UsuariosController } from './infrastructure/controllers/usuarios.controller';
import { AuthService } from './application/services/auth.service';
import { UsuarioRepositoryImpl } from './infrastructure/repositories/usuario.repository.impl';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { AuthLoggerMiddleware } from './infrastructure/strategies/middleware/logger.middleware';
import { USUARIO_REPOSITORY } from './domain/repositories/usuario.repository';
import { EmailService } from '../../core/services/email.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController, UsuariosController],
  providers: [
    AuthService,
    EmailService,
    PrismaService,
    JwtStrategy,
    {
      provide: USUARIO_REPOSITORY,
      useClass: UsuarioRepositoryImpl,
    },
  ],
  exports: [USUARIO_REPOSITORY],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthLoggerMiddleware).forRoutes('auth');
  }
}
