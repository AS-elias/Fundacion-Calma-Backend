import { Injectable } from '@nestjs/common';
import { ConvenioRepository } from '../../domain/repositories/convenio.repository';
import { Convenio } from '../../domain/entities/convenio.entity';
import { CreateConvenioDto } from '../dto/create-convenio.dto';
import { ConvenioHistorialService } from '../../../convenio_historial/application/services/convenio-historial.service';

@Injectable()
export class CreateConvenioUseCase {
  constructor(
    private readonly convenioRepository: ConvenioRepository,
    private readonly convenioHistorialService: ConvenioHistorialService,
  ) {}

  async execute(dto: CreateConvenioDto): Promise<Convenio> {
    const convenio = new Convenio(
      0,
      dto.areaId,
      dto.entidadNombre,
      dto.logoUrl ?? null,
      dto.ruc,
      dto.rubro,
      dto.contactoNombre,
      dto.telefonoContacto,
      dto.estado,
      dto.tipo,
      dto.conexion,
      dto.fechaExpiracion,
      dto.creadorId,
      new Date(),
    );

    const created = await this.convenioRepository.create(convenio);

    await this.convenioHistorialService.registrar(
      created.id,
      'CREACION',
      'Convenio registrado.',
      created.creadorId,
    );

    return created;
  }
}
