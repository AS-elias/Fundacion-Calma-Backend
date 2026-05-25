import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { ISalaRepository } from '../../domain/repositories/sala.repository';
import { SalaEntity } from '../../domain/entities/sala.entity';

/** Implementación del repositorio de Salas usando Prisma */
@Injectable()
export class PrismaSalaRepository implements ISalaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerSalasRegulares(): Promise<SalaEntity[]> {
    return this.prisma.salas_trabajo.findMany({
      where: { es_general: false },
    });
  }

  async obtenerSalaGeneral(): Promise<SalaEntity | null> {
    return this.prisma.salas_trabajo.findFirst({
      where: { es_general: true },
    });
  }

  async crearSala(data: { nombre: string; area: string; link: string; descripcion?: string; creador_id?: number }): Promise<SalaEntity> {
    return this.prisma.salas_trabajo.create({
      data: {
        nombre: data.nombre,
        area: data.area,
        link: data.link,
        descripcion: data.descripcion || null,
        es_general: false,
        creador_id: data.creador_id || null,
      },
    });
  }

  async eliminarSala(id: number): Promise<void> {
    await this.prisma.salas_trabajo.delete({
      where: { id },
    });
  }

  async verificarSalaExiste(id: number): Promise<boolean> {
    const count = await this.prisma.salas_trabajo.count({ where: { id } });
    return count > 0;
  }

  async actualizarSala(id: number, data: Partial<{ nombre: string; area: string; link: string; descripcion: string }>): Promise<SalaEntity> {
    return this.prisma.salas_trabajo.update({
      where: { id },
      data,
    });
  }
}