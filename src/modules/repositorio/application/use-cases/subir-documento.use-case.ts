import { Inject } from '@nestjs/common';
import { RepositorioDocumento } from '../../domain/entities/repositorio-documento.entity';
import type { RepositorioDocumentoRepository } from '../../domain/repositories/repositorio-documento.repository';

export class SubirDocumentoUseCase {
  constructor(
    @Inject('RepositorioDocumentoRepository')
    private repo: RepositorioDocumentoRepository,
  ) {}

  async ejecutar(dto: any, file: any) {
    const doc = new RepositorioDocumento(
      0,
      dto.bloqueId,
      file.originalname,
      file.filename,
      new Date(),
    );

    return this.repo.create(doc);
  }
}
