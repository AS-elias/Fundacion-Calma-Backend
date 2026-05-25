import { Inject, Injectable } from '@nestjs/common';
import { NotificacionRepository } from '../../domain/repositories/notificacion.repository';

@Injectable()
export class ListarNotificacionesUseCase {
  constructor(
    @Inject(NotificacionRepository)
    private repo: NotificacionRepository,
  ) {}

  async execute(actualUserId: number, rol: string, queryUserId?: number) {
    return this.repo.listar(actualUserId, rol, queryUserId);
  }
}
