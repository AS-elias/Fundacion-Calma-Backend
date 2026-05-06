import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';

import { CreateActividadUseCase } from '../../application/use-cases/create-actividad.usecase';
import { GetActividadesUseCase } from '../../application/use-cases/get-actividades.usecase';
import { GetActividadUseCase } from '../../application/use-cases/get-actividad.usecase';
import { UpdateActividadUseCase } from '../../application/use-cases/update-actividad.usecase';
import { CreateActividadDto } from '../../application/dto/create-actividad.dto';
import { UpdateActividadDto } from '../../application/dto/update-actividad.dto';

@Controller('actividades')
export class ActividadesController {
  constructor(
    private readonly createActividad: CreateActividadUseCase,
    private readonly getActividades: GetActividadesUseCase,
    private readonly getActividad: GetActividadUseCase,
    private readonly updateActividad: UpdateActividadUseCase,
  ) {}

  private withSuccessMessage<T extends object>(data: T, message: string) {
    return {
      ...data,
      message,
      mensaje: message,
    };
  }

  @Post()
  async create(@Body() dto: CreateActividadDto) {
    const actividad = await this.createActividad.execute(dto);

    return this.withSuccessMessage(actividad, 'Actividad creada exitosamente.');
  }

  @Get()
  async findAll(
    @Query('estado') estado?: string,
    @Query('search') search?: string,
  ) {
    return this.getActividades.execute({ estado, search });
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.getActividad.execute(Number(id));
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateActividadDto) {
    const actividad = await this.updateActividad.execute(Number(id), dto);

    return this.withSuccessMessage(
      actividad,
      'Se guardaron los cambios exitosamente.',
    );
  }
}
