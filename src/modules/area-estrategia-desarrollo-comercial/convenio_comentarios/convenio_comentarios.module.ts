import { Module } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

import { ComentarioController } from './infrastructure/controllers/comentarios.controller';

import { CreateComentarioUseCase } from './application/use-cases/create-comentario.usecase';
import { GetComentariosUseCase } from './application/use-cases/get-comentarios.usecase';
import { DeleteComentarioUseCase } from './application/use-cases/delete-comentario.usecase';

import { ComentarioRepository } from './domain/repositories/comentario.repository';
import { PrismaComentarioRepository } from './infrastructure/repositories/prisma-comentario.repository';
import { ConvenioHistorialModule } from '../convenio_historial/convenio_historial.module';

@Module({
  imports: [ConvenioHistorialModule],
  controllers: [ComentarioController],

  providers: [
    PrismaService,

    CreateComentarioUseCase,
    GetComentariosUseCase,
    DeleteComentarioUseCase,

    {
      provide: ComentarioRepository,
      useClass: PrismaComentarioRepository,
    },
  ],
})
export class ConvenioComentariosModule {}
