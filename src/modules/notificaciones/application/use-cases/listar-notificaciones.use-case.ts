import { Inject, Injectable } from '@nestjs/common';
import { NotificacionRepository } from '../../domain/repositories/notificacion.repository';

@Injectable()
export class ListarNotificacionesUseCase {
  constructor(
    @Inject(NotificacionRepository)
    private repo: NotificacionRepository,
  ) {}

  async execute() {
    return this.repo.listar();
  }
}
