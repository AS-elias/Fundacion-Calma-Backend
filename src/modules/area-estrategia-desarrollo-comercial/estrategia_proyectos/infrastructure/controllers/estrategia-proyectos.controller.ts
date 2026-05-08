import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateEstrategiaProyectoDto } from '../../application/dto/create-estrategia-proyecto.dto';
import { UpdateEstrategiaProyectoDto } from '../../application/dto/update-estrategia-proyecto.dto';
import { CreateEstrategiaProyectoUseCase } from '../../application/use-cases/create-estrategia-proyecto.usecase';
import { DeleteEstrategiaProyectoUseCase } from '../../application/use-cases/delete-estrategia-proyecto.usecase';
import { GetEstrategiaProyectoUseCase } from '../../application/use-cases/get-estrategia-proyecto.usecase';
import { GetEstrategiaProyectosUseCase } from '../../application/use-cases/get-estrategia-proyectos.usecase';
import { UpdateEstrategiaProyectoUseCase } from '../../application/use-cases/update-estrategia-proyecto.usecase';
import { positiveId } from '../../../estrategia_comercial/estrategia-comercial.utils';

@Controller(['estrategia-proyectos', 'estrategia_proyectos'])
export class EstrategiaProyectosController {
  constructor(
    private readonly createProyecto: CreateEstrategiaProyectoUseCase,
    private readonly getProyectos: GetEstrategiaProyectosUseCase,
    private readonly getProyecto: GetEstrategiaProyectoUseCase,
    private readonly updateProyecto: UpdateEstrategiaProyectoUseCase,
    private readonly deleteProyecto: DeleteEstrategiaProyectoUseCase,
  ) {}

  @Get()
  findAll(
    @Query('empresaId') empresaId?: string,
    @Query('empresa_id') empresa_id?: string,
    @Query('estado') estado?: string,
    @Query('search') search?: string,
  ) {
    return this.getProyectos.execute({ empresaId, empresa_id, estado, search });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.getProyecto.execute(positiveId(id));
  }

  @Post()
  create(@Body() dto: CreateEstrategiaProyectoDto) {
    return this.createProyecto.execute(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEstrategiaProyectoDto) {
    return this.updateProyecto.execute(positiveId(id), dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.deleteProyecto.execute(positiveId(id));
  }
}
