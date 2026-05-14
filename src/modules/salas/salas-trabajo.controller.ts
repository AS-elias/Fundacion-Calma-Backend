import {
  Controller,
  Get,
  Post,
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

@Controller('salas-trabajo')
@UseGuards(AuthGuard('jwt')) // Protegemos las rutas para que solo usuarios logueados accedan
export class SalasTrabajoController {
  constructor(
    private readonly getSalasUseCase: GetSalasUseCase,
    private readonly getSalaGeneralUseCase: GetSalaGeneralUseCase,
    private readonly createSalaUseCase: CreateSalaUseCase,
    private readonly deleteSalaUseCase: DeleteSalaUseCase,
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
    return this.createSalaUseCase.execute({ ...data, creador_id: req.user.id });
  }

  @Delete(':id')
  async deleteSala(@Param('id') id: string) {
    return this.deleteSalaUseCase.execute(Number(id));
  }
}