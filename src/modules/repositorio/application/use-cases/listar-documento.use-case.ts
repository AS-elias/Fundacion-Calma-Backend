import { Inject } from '@nestjs/common';
import type { RepositorioDocumentoRepository } from '../../domain/repositories/repositorio-documento.repository';

export class ListarDocumentoUseCase {
  constructor(
    @Inject('RepositorioDocumentoRepository')
    private repo: RepositorioDocumentoRepository,
  ) {}

  async ejecutar(dto: any) {
    return this.repo.findByBloque(dto.bloqueId);
  }
}
