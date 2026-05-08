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
import { CreateEstrategiaProyectoEnlaceDto } from '../../application/dto/create-estrategia-proyecto-enlace.dto';
import { UpdateEstrategiaProyectoEnlaceDto } from '../../application/dto/update-estrategia-proyecto-enlace.dto';
import { CreateEstrategiaProyectoEnlaceUseCase } from '../../application/use-cases/create-estrategia-proyecto-enlace.usecase';
import { DeleteEstrategiaProyectoEnlaceUseCase } from '../../application/use-cases/delete-estrategia-proyecto-enlace.usecase';
import { GetEstrategiaProyectoEnlaceUseCase } from '../../application/use-cases/get-estrategia-proyecto-enlace.usecase';
import { GetEstrategiaProyectoEnlacesUseCase } from '../../application/use-cases/get-estrategia-proyecto-enlaces.usecase';
import { UpdateEstrategiaProyectoEnlaceUseCase } from '../../application/use-cases/update-estrategia-proyecto-enlace.usecase';
import { positiveId } from '../../../estrategia_comercial/estrategia-comercial.utils';

@Controller(['estrategia-proyecto-enlaces', 'estrategia_proyecto_enlaces'])
export class EstrategiaProyectoEnlacesController {
  constructor(
    private readonly createEnlace: CreateEstrategiaProyectoEnlaceUseCase,
    private readonly getEnlaces: GetEstrategiaProyectoEnlacesUseCase,
    private readonly getEnlace: GetEstrategiaProyectoEnlaceUseCase,
    private readonly updateEnlace: UpdateEstrategiaProyectoEnlaceUseCase,
    private readonly deleteEnlace: DeleteEstrategiaProyectoEnlaceUseCase,
  ) {}

  @Get()
  findAll(
    @Query('proyectoId') proyectoId?: string,
    @Query('proyecto_id') proyecto_id?: string,
  ) {
    return this.getEnlaces.execute({ proyectoId, proyecto_id });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.getEnlace.execute(positiveId(id));
  }

  @Post()
  create(@Body() dto: CreateEstrategiaProyectoEnlaceDto) {
    return this.createEnlace.execute(dto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEstrategiaProyectoEnlaceDto,
  ) {
    return this.updateEnlace.execute(positiveId(id), dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.deleteEnlace.execute(positiveId(id));
  }
}
