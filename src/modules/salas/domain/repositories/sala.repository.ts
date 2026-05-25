import { SalaEntity } from '../entities/sala.entity';

export const SALA_REPOSITORY = 'SALA_REPOSITORY';

export interface ISalaRepository {
  obtenerSalasRegulares(): Promise<SalaEntity[]>;
  obtenerSalaGeneral(): Promise<SalaEntity | null>;
  crearSala(data: { nombre: string; area: string; link: string; descripcion?: string }): Promise<SalaEntity>;
  eliminarSala(id: number): Promise<void>;
  actualizarSala(id: number, data: Partial<{ nombre: string; area: string; link: string; descripcion: string }>): Promise<SalaEntity>;
  verificarSalaExiste(id: number): Promise<boolean>;
}