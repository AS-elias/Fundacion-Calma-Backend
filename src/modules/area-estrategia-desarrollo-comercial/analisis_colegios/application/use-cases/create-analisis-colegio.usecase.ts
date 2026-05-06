import { Injectable } from '@nestjs/common';
import { CreateAnalisisColegioDto } from '../dto/create-analisis-colegio.dto';
import { AnalisisColegioRepository } from '../../domain/repositories/analisis-colegio.repository';

@Injectable()
export class CreateAnalisisColegioUseCase {
  constructor(private readonly repository: AnalisisColegioRepository) {}

  execute(dto: CreateAnalisisColegioDto) {
    return this.repository.create(dto);
  }
}
