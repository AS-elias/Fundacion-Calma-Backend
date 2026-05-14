import { Inject, Injectable } from '@nestjs/common';
import { NotificacionRepository } from '../../domain/repositories/notificacion.repository';


@Injectable()
export class MarcarLeidoUseCase {
  constructor(
    @Inject(NotificacionRepository)
    private repo: NotificacionRepository,
  ) {}

  async execute(id: number, leido: boolean) {
    return this.repo.marcarLeido(id, leido);
  }
}
