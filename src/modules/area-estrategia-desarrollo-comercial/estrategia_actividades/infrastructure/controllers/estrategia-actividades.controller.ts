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
import { CreateEstrategiaActividadDto } from '../../application/dto/create-estrategia-actividad.dto';
import { UpdateEstrategiaActividadDto } from '../../application/dto/update-estrategia-actividad.dto';
import { CreateEstrategiaActividadUseCase } from '../../application/use-cases/create-estrategia-actividad.usecase';
import { DeleteEstrategiaActividadUseCase } from '../../application/use-cases/delete-estrategia-actividad.usecase';
import { GetEstrategiaActividadUseCase } from '../../application/use-cases/get-estrategia-actividad.usecase';
import { GetEstrategiaActividadesUseCase } from '../../application/use-cases/get-estrategia-actividades.usecase';
import { UpdateEstrategiaActividadUseCase } from '../../application/use-cases/update-estrategia-actividad.usecase';
import { positiveId } from '../../../estrategia_comercial/estrategia-comercial.utils';

@Controller(['estrategia-actividades', 'estrategia_actividades'])
export class EstrategiaActividadesController {
  constructor(
    private readonly createActividad: CreateEstrategiaActividadUseCase,
    private readonly getActividades: GetEstrategiaActividadesUseCase,
    private readonly getActividad: GetEstrategiaActividadUseCase,
    private readonly updateActividad: UpdateEstrategiaActividadUseCase,
    private readonly deleteActividad: DeleteEstrategiaActividadUseCase,
  ) {}

  @Get()
  findAll(@Query('estado') estado?: string, @Query('search') search?: string) {
    return this.getActividades.execute({ estado, search });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.getActividad.execute(positiveId(id));
  }

  @Post()
  create(@Body() dto: CreateEstrategiaActividadDto) {
    return this.createActividad.execute(dto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEstrategiaActividadDto,
    @Query('usuarioNombre') usuarioNombre?: string,
  ) {
    return this.updateActividad.execute(positiveId(id), dto, usuarioNombre);
  }

  @Delete(':id')
  delete(
    @Param('id') id: string,
    @Query('usuarioNombre') usuarioNombre?: string,
  ) {
    return this.deleteActividad.execute(positiveId(id), usuarioNombre);
  }
}
