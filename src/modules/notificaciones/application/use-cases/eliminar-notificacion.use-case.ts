import { Inject, Injectable } from '@nestjs/common';
import { NotificacionRepository } from '../../domain/repositories/notificacion.repository';

@Injectable()
export class EliminarNotificacionUseCase {
  constructor(
    @Inject(NotificacionRepository)
    private repo: NotificacionRepository,
  ) {}

  async execute(id: number, usuarioId?: number) {
    return this.repo.eliminar(id, usuarioId);
  }
}
