import { Injectable } from '@nestjs/common';
import { ConvenioRepository } from '../../domain/repositories/convenio.repository';
import { Convenio } from '../../domain/entities/convenio.entity';
import { UpdateConvenioDto } from '../dto/update-convenio.dto';
import { ConvenioHistorialService } from '../../../convenio_historial/application/services/convenio-historial.service';

@Injectable()
export class UpdateConvenioUseCase {
  constructor(
    private readonly convenioRepository: ConvenioRepository,
    private readonly convenioHistorialService: ConvenioHistorialService,
  ) {}

  async execute(id: number, dto: UpdateConvenioDto): Promise<Convenio> {
    const updated = await this.convenioRepository.update(id, dto);

    await this.convenioHistorialService.registrar(
      updated.id,
      'ACTUALIZACION',
      'Convenio actualizado.',
      updated.creadorId,
    );

    return updated;
  }
}
