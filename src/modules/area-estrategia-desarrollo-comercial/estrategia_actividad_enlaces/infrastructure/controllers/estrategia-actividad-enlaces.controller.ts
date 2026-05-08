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
import { CreateEstrategiaActividadEnlaceDto } from '../../application/dto/create-estrategia-actividad-enlace.dto';
import { UpdateEstrategiaActividadEnlaceDto } from '../../application/dto/update-estrategia-actividad-enlace.dto';
import { CreateEstrategiaActividadEnlaceUseCase } from '../../application/use-cases/create-estrategia-actividad-enlace.usecase';
import { DeleteEstrategiaActividadEnlaceUseCase } from '../../application/use-cases/delete-estrategia-actividad-enlace.usecase';
import { GetEstrategiaActividadEnlaceUseCase } from '../../application/use-cases/get-estrategia-actividad-enlace.usecase';
import { GetEstrategiaActividadEnlacesUseCase } from '../../application/use-cases/get-estrategia-actividad-enlaces.usecase';
import { UpdateEstrategiaActividadEnlaceUseCase } from '../../application/use-cases/update-estrategia-actividad-enlace.usecase';
import { positiveId } from '../../../estrategia_comercial/estrategia-comercial.utils';

@Controller(['estrategia-actividad-enlaces', 'estrategia_actividad_enlaces'])
export class EstrategiaActividadEnlacesController {
  constructor(
    private readonly createEnlace: CreateEstrategiaActividadEnlaceUseCase,
    private readonly getEnlaces: GetEstrategiaActividadEnlacesUseCase,
    private readonly getEnlace: GetEstrategiaActividadEnlaceUseCase,
    private readonly updateEnlace: UpdateEstrategiaActividadEnlaceUseCase,
    private readonly deleteEnlace: DeleteEstrategiaActividadEnlaceUseCase,
  ) {}

  @Get()
  findAll(
    @Query('actividadId') actividadId?: string,
    @Query('actividad_id') actividad_id?: string,
  ) {
    return this.getEnlaces.execute({ actividadId, actividad_id });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.getEnlace.execute(positiveId(id));
  }

  @Post()
  create(@Body() dto: CreateEstrategiaActividadEnlaceDto) {
    return this.createEnlace.execute(dto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEstrategiaActividadEnlaceDto,
  ) {
    return this.updateEnlace.execute(positiveId(id), dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.deleteEnlace.execute(positiveId(id));
  }
}
