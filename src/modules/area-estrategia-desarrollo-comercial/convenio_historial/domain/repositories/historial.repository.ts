import { ConvenioHistorial } from '../entities/historial.entity';

export abstract class HistorialRepository {
  abstract create(entry: ConvenioHistorial): Promise<ConvenioHistorial>;

  abstract findByConvenio(convenioId: number): Promise<ConvenioHistorial[]>;

  abstract deleteByConvenio(convenioId: number): Promise<number>;
}
