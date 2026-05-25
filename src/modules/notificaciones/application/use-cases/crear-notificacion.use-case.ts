import { Inject, Injectable } from '@nestjs/common';
import { CrearNotificacionDto } from '../dto/crear-notificacion.dto';
import { NotificacionRepository } from '../../domain/repositories/notificacion.repository';

@Injectable()
export class CrearNotificacionUseCase {
  constructor(
    @Inject(NotificacionRepository)
    private repo: NotificacionRepository,
  ) {}

  async execute(dto: CrearNotificacionDto) {
    return this.repo.crear(dto);
  }
}
