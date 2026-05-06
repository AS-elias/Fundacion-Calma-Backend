import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateArchivoDto } from '../../application/dto/create-archivo.dto';
import { GetArchivosUseCase } from '../../application/use-cases/get-archivos.usecase';
import { CreateArchivoUseCase } from '../../application/use-cases/create-archivo.usecase';
import { DeleteArchivoUseCase } from '../../application/use-cases/delete-archivo.usecase';
import { ConvenioArchivoStorageService } from '../../application/services/convenio-archivo-storage.service';
import { Archivo } from '../../domain/entities/archivo.entity';

type UploadedConvenioFile = {
  originalname: string;
  buffer: Buffer;
};

@Controller('convenio-archivos')
export class ArchivosController {
  constructor(
    private readonly getArchivos: GetArchivosUseCase,
    private readonly createArchivo: CreateArchivoUseCase,
    private readonly deleteArchivo: DeleteArchivoUseCase,
    private readonly archivoStorage: ConvenioArchivoStorageService,
  ) {}

  @Get('convenio/:convenioId')
  async findByConvenio(
    @Param('convenioId') convenioId: string,
  ): Promise<Archivo[]> {
    return this.getArchivos.execute(Number(convenioId));
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile() file: UploadedConvenioFile | undefined,
    @Body() dto: CreateArchivoDto,
  ): Promise<Archivo> {
    dto.convenioId = Number(dto.convenioId);
    dto.subidoPorId = Number(dto.subidoPorId);

    if (Number.isNaN(dto.convenioId) || Number.isNaN(dto.subidoPorId)) {
      throw new BadRequestException(
        'convenioId y subidoPorId deben ser numeros validos.',
      );
    }

    if (file) {
      const storedFile = await this.archivoStorage.saveFile(file);
      dto.nombreArchivo = storedFile.nombreArchivo;
      dto.urlArchivo = storedFile.urlArchivo;
    }

    if (!dto.urlArchivo) {
      throw new BadRequestException(
        'Debe enviar un archivo o una URL valida para el convenio.',
      );
    }

    if (dto.urlArchivo.startsWith('blob:')) {
      throw new BadRequestException(
        'No se puede guardar una URL temporal tipo blob:. Envie el archivo real al backend.',
      );
    }

    return this.createArchivo.execute(dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.deleteArchivo.execute(Number(id));
  }
}
