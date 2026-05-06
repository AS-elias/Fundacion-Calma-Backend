import { Injectable } from '@nestjs/common';
import { ArchivoRepository } from '../../domain/repositories/archivo.repository';
import { Archivo } from '../../domain/entities/archivo.entity';

@Injectable()
export class GetArchivosUseCase {
  constructor(private readonly archivoRepository: ArchivoRepository) {}

  async execute(convenioId: number): Promise<Archivo[]> {
    return this.archivoRepository.findByConvenio(convenioId);
  }
}
