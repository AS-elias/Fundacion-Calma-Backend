import { Injectable } from '@nestjs/common';
import { ArchivoRepository } from '../../domain/repositories/archivo.repository';

@Injectable()
export class DeleteArchivoUseCase {
  constructor(private readonly archivoRepository: ArchivoRepository) {}

  async execute(id: number): Promise<void> {
    return this.archivoRepository.delete(id);
  }
}
