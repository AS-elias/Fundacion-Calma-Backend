import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

import { CreateArchivoUseCase } from './application/use-cases/create-archivo.usecase';
import { GetArchivosUseCase } from './application/use-cases/get-archivos.usecase';
import { DeleteArchivoUseCase } from './application/use-cases/delete-archivo.usecase';
import { ConvenioArchivoStorageService } from './application/services/convenio-archivo-storage.service';

import { ArchivoRepository } from './domain/repositories/archivo.repository';
import { PrismaArchivoRepository } from './infrastructure/repositories/prisma-archivo.repository';

import { ArchivosController } from './infrastructure/controllers/archivos.controller';

@Module({
  imports: [ConfigModule],
  controllers: [ArchivosController],
  providers: [
    PrismaService,

    CreateArchivoUseCase,
    GetArchivosUseCase,
    DeleteArchivoUseCase,
    ConvenioArchivoStorageService,

    {
      provide: ArchivoRepository,
      useClass: PrismaArchivoRepository,
    },
  ],
})
export class ConvenioArchivosModule {}
