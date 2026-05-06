import { Injectable } from '@nestjs/common';
import { ActividadEnlace } from '../../domain/entities/actividad-enlace.entity';
import { Actividad } from '../../domain/entities/actividad.entity';
import { EstadoActividad } from '../../domain/enums/estado-actividad.enum';
import { ActividadRepository } from '../../domain/repositories/actividad.repository';
import { UpdateActividadDto } from '../dto/update-actividad.dto';

@Injectable()
export class UpdateActividadUseCase {
  constructor(private readonly actividadRepository: ActividadRepository) {}

  async execute(id: number, dto: UpdateActividadDto): Promise<Actividad> {
    const actividadData: Partial<Actividad> = {
      areaId: dto.areaId,
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      estado: dto.estado as EstadoActividad | undefined,
      fechaLimite: dto.fechaLimite as Date | null | undefined,
      creadorId: dto.creadorId,
      enlaces: dto.enlaces?.map(
        (enlace) =>
          new ActividadEnlace(
            0,
            enlace.nombreDocumento,
            enlace.url,
            new Date(),
          ),
      ),
    };

    return this.actividadRepository.update(id, actividadData);
  }
}
