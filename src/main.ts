import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { join } from 'path';
import helmet from 'helmet';
import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import * as winston from 'winston';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike('Backend', {
              colors: true,
              appName: true,
            }),
          ),
        }),
      ],
    }),
  });
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));
  app.setGlobalPrefix('api');
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  app.enableCors({
    origin: ['http://localhost:4200'],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // 1. Añadir Cabeceras de Seguridad (Helmet)
  app.use(helmet());

  // 3. Validación Estricta
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades del objeto que no tienen decoradores en el DTO
      forbidNonWhitelisted: true, // Arroja un error en lugar de simplemente eliminar las propiedades no deseadas
      transform: true, // Transforma automáticamente el payload al tipo de instancia del DTO
    }),
  );

  await app.listen(process.env.PORT ?? 3005);
}
bootstrap();
