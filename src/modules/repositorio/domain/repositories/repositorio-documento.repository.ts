import { RepositorioDocumento } from '../entities/repositorio-documento.entity';

export abstract class RepositorioDocumentoRepository {
  abstract create(data: RepositorioDocumento): Promise<RepositorioDocumento>;
  abstract findByBloque(bloqueId: number): Promise<any>;
  abstract findByCarpeta(carpetaId: number): Promise<any>;
  abstract crearCarpeta(data: any): Promise<any>;
  abstract deleteCarpeta(id: number): Promise<void>;
  abstract delete(id: number): Promise<void>;
  abstract mover(
    id: number,
    padreId: number | null,
    esCarpeta: boolean,
  ): Promise<any>;
}
