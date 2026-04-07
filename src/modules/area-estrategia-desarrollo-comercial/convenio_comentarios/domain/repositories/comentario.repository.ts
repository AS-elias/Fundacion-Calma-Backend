import { ConvenioComentario } from '../entities/comentario.entity';

export abstract class ComentarioRepository {
  abstract create(data: ConvenioComentario): Promise<ConvenioComentario>;

  abstract findByConvenio(convenioId: number): Promise<ConvenioComentario[]>;

  abstract delete(id: number): Promise<void>;
}
