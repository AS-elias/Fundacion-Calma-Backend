import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetSalasUseCase } from './application/use-cases/get-salas.usecase';
import { GetSalaGeneralUseCase } from './application/use-cases/get-sala-general.usecase';
import { CreateSalaUseCase } from './application/use-cases/create-sala.usecase';
import { DeleteSalaUseCase } from './application/use-cases/delete-sala.usecase';
import { UpdateSalaUseCase } from './application/use-cases/update-sala.usecase';
import { UpdateSalaDto } from './application/update-sala.dto';
import { SystemGateway } from '../websockets/gateways/system.gateway';

@Controller('salas-trabajo')
@UseGuards(AuthGuard('jwt')) // Protegemos las rutas para que solo usuarios logueados accedan
export class SalasTrabajoController {
  constructor(
    private readonly getSalasUseCase: GetSalasUseCase,
    private readonly getSalaGeneralUseCase: GetSalaGeneralUseCase,
    private readonly createSalaUseCase: CreateSalaUseCase,
    private readonly deleteSalaUseCase: DeleteSalaUseCase,
    private readonly updateSalaUseCase: UpdateSalaUseCase,
    private readonly systemGateway: SystemGateway,
  ) {}

  @Get()
  async getSalas() {
    // Se espera 0 argumentos, por lo que lo llamamos vacío
    return this.getSalasUseCase.execute();
  }

  @Get('general')
  async getSalaGeneral() {
    return this.getSalaGeneralUseCase.execute();
  }

  @Post()
  async createSala(@Body() data: any, @Request() req) {
    // Combinamos los datos del body con el ID del usuario logueado en 1 solo argumento
    const result = await this.createSalaUseCase.execute({
      ...data,
      creador_id: req.user.id,
    });
    this.systemGateway.emitSistemaActualizado('salas', 'crear');
    return result;
  }

  @Put(':id')
  async updateSala(@Param('id') id: string, @Body() data: UpdateSalaDto) {
    const result = await this.updateSalaUseCase.execute(Number(id), data);
    this.systemGateway.emitSistemaActualizado('salas', 'editar');
    return result;
  }

  @Delete(':id')
  async deleteSala(@Param('id') id: string) {
    const result = await this.deleteSalaUseCase.execute(Number(id));
    this.systemGateway.emitSistemaActualizado('salas', 'eliminar');
    return result;
  }
}
