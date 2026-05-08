import { Injectable } from '@nestjs/common';
import { ArchivoRepository } from '../../domain/repositories/archivo.repository';
import { Archivo } from '../../domain/entities/archivo.entity';
import { CreateArchivoDto } from '../dto/create-archivo.dto';
import { ConvenioHistorialService } from '../../../convenio_historial/application/services/convenio-historial.service';

@Injectable()
export class CreateArchivoUseCase {
  constructor(
    private readonly archivoRepository: ArchivoRepository,
    private readonly convenioHistorialService: ConvenioHistorialService,
  ) {}

  async execute(dto: CreateArchivoDto): Promise<Archivo> {
    const archivo = new Archivo(
      0,
      dto.convenioId,
      dto.subidoPorId,
      dto.nombreArchivo,
      dto.urlArchivo,
      new Date(),
    );

    const created = await this.archivoRepository.create(archivo);

    await this.convenioHistorialService.registrar(
      created.convenioId,
      'ARCHIVO',
      `Archivo adjuntado: ${created.nombreArchivo}`,
      created.subidoPorId,
    );

    return created;
  }
}
