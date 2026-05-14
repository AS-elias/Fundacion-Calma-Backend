import { RepositorioDocumento } from '../entities/repositorio-documento.entity';

export abstract class RepositorioDocumentoRepository {
  abstract create(data: RepositorioDocumento): Promise<RepositorioDocumento>;
  abstract findByBloque(bloqueId: number): Promise<RepositorioDocumento[]>;
  abstract delete(id: number): Promise<void>;
}