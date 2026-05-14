import { Inject } from '@nestjs/common';
import type { RepositorioDocumentoRepository } from '../../domain/repositories/repositorio-documento.repository';

export class EliminarDocumentoUseCase {
  constructor(
    @Inject('RepositorioDocumentoRepository')
    private repo: RepositorioDocumentoRepository,
  ) {}

  async ejecutar(dto: any) {
    return this.repo.delete(dto.id);
  }
}
