import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../infrastructure/prisma/prisma.service';
import { ConvenioHistorial } from '../../domain/entities/historial.entity';
import { HistorialRepository } from '../../domain/repositories/historial.repository';

@Injectable()
export class PrismaHistorialRepository extends HistorialRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(entry: ConvenioHistorial): Promise<ConvenioHistorial> {
    const created = await this.prisma.convenio_historial.create({
      data: {
        convenio_id: entry.convenioId,
        usuario_id: entry.usuarioId,
        accion: entry.accion,
        descripcion: entry.descripcion,
      },
    });

    return new ConvenioHistorial(
      created.id,
      created.convenio_id as number,
      created.usuario_id ?? null,
      created.accion,
      created.descripcion,
      created.fecha_creacion ?? new Date(),
    );
  }

  async findByConvenio(convenioId: number): Promise<ConvenioHistorial[]> {
    const historial = await this.prisma.convenio_historial.findMany({
      where: {
        convenio_id: convenioId,
      },
      orderBy: {
        fecha_creacion: 'desc',
      },
    });

    return historial.map(
      (entry) =>
        new ConvenioHistorial(
          entry.id,
          entry.convenio_id as number,
          entry.usuario_id ?? null,
          entry.accion,
          entry.descripcion,
          entry.fecha_creacion ?? new Date(),
        ),
    );
  }

  async deleteByConvenio(convenioId: number): Promise<number> {
    const result = await this.prisma.convenio_historial.deleteMany({
      where: {
        convenio_id: convenioId,
      },
    });

    return result.count;
  }
}
