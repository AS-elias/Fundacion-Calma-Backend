import { Injectable } from '@nestjs/common';
import { UpdateAnalisisColegioDto } from '../dto/update-analisis-colegio.dto';
import { AnalisisColegioRepository } from '../../domain/repositories/analisis-colegio.repository';

@Injectable()
export class UpdateAnalisisColegioUseCase {
  constructor(private readonly repository: AnalisisColegioRepository) {}

  execute(id: number, dto: UpdateAnalisisColegioDto) {
    return this.repository.update(id, dto);
  }
}
