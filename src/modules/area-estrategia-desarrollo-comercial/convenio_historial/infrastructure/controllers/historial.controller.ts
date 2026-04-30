import { Controller, Delete, Get, Param } from '@nestjs/common';
import { ClearHistorialUseCase } from '../../application/use-cases/clear-historial.usecase';
import { GetHistorialUseCase } from '../../application/use-cases/get-historial.usecase';

@Controller('convenio-historial')
export class HistorialController {
  constructor(
    private readonly getHistorial: GetHistorialUseCase,
    private readonly clearHistorial: ClearHistorialUseCase,
  ) {}

  @Get('convenio/:convenioId')
  async findByConvenio(@Param('convenioId') convenioId: string) {
    return this.getHistorial.execute(Number(convenioId));
  }

  @Delete('convenio/:convenioId')
  async clearByConvenio(@Param('convenioId') convenioId: string) {
    const deletedCount = await this.clearHistorial.execute(Number(convenioId));

    return {
      deletedCount,
      message: 'Historial limpiado exitosamente.',
      mensaje: 'Historial limpiado exitosamente.',
    };
  }
}
