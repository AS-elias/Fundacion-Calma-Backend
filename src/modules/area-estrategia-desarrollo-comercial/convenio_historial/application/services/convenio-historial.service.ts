import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../infrastructure/prisma/prisma.service';
import { ConvenioHistorial } from '../../domain/entities/historial.entity';
import { HistorialRepository } from '../../domain/repositories/historial.repository';

@Injectable()
export class ConvenioHistorialService {
  constructor(
    private readonly historialRepository: HistorialRepository,
    private readonly prisma: PrismaService,
  ) {}

  async registrar(
    convenioId: number,
    accion: string,
    descripcion: string,
    usuarioId?: number | null,
  ): Promise<ConvenioHistorial> {
    const responsable = await this.obtenerNombreUsuario(usuarioId);
    const descripcionConResponsable = this.agregarResponsable(
      descripcion,
      responsable,
    );

    const historial = new ConvenioHistorial(
      0,
      convenioId,
      usuarioId ?? null,
      accion,
      descripcionConResponsable,
      new Date(),
    );

    return this.historialRepository.create(historial);
  }

  private async obtenerNombreUsuario(
    usuarioId?: number | null,
  ): Promise<string | null> {
    if (!usuarioId) {
      return null;
    }

    const usuario = await this.prisma.usuarios.findUnique({
      where: { id: usuarioId },
      select: {
        nombre_completo: true,
        apellido_completo: true,
      },
    });

    if (!usuario) {
      return null;
    }

    return `${usuario.nombre_completo ?? ''} ${
      usuario.apellido_completo ?? ''
    }`.trim();
  }

  private agregarResponsable(
    descripcion: string,
    responsable: string | null,
  ): string {
    const texto = descripcion.trim();

    if (!responsable || /responsable:/i.test(texto)) {
      return texto;
    }

    return `${texto}\nResponsable: ${responsable}.`;
  }
}
