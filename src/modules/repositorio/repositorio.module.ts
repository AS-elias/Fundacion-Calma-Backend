import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

import { RepositorioStorageService } from './application/services/repositorio-storage.service';
import { PrismaRepositorioDocumentoRepository } from './infrastructure/repositories/prisma-repositorio-documento.repository';
import { RepositorioController } from './presentation/controllers/repositorio.controller';

@Module({
  imports: [ConfigModule],
  controllers: [RepositorioController],
  providers: [
    PrismaService,
    RepositorioStorageService,
    PrismaRepositorioDocumentoRepository,
  ],
})
export class RepositorioModule {}
