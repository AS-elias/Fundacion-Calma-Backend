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
import { CreateAnalisisTareaEnlaceDto } from '../../application/dto/create-analisis-tarea-enlace.dto';
import { UpdateAnalisisTareaEnlaceDto } from '../../application/dto/update-analisis-tarea-enlace.dto';
import { CreateAnalisisTareaEnlaceUseCase } from '../../application/use-cases/create-analisis-tarea-enlace.usecase';
import { DeleteAnalisisTareaEnlaceUseCase } from '../../application/use-cases/delete-analisis-tarea-enlace.usecase';
import { GetAnalisisTareaEnlacesUseCase } from '../../application/use-cases/get-analisis-tarea-enlaces.usecase';
import { UpdateAnalisisTareaEnlaceUseCase } from '../../application/use-cases/update-analisis-tarea-enlace.usecase';

@Controller(['analisis-tarea-enlaces', 'analisis_tarea_enlaces'])
export class AnalisisTareaEnlacesController {
  constructor(
    private readonly createEnlace: CreateAnalisisTareaEnlaceUseCase,
    private readonly getEnlaces: GetAnalisisTareaEnlacesUseCase,
    private readonly updateEnlace: UpdateAnalisisTareaEnlaceUseCase,
    private readonly deleteEnlace: DeleteAnalisisTareaEnlaceUseCase,
  ) {}

  @Get()
  findAll(
    @Query('tareaId') tareaId?: string,
    @Query('tarea_id') tareaIdSnake?: string,
  ) {
    const rawTareaId = tareaId ?? tareaIdSnake;

    return this.getEnlaces.execute({
      tareaId: rawTareaId ? Number(rawTareaId) : undefined,
    });
  }

  @Post()
  create(@Body() dto: CreateAnalisisTareaEnlaceDto) {
    return this.createEnlace.execute(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAnalisisTareaEnlaceDto) {
    return this.updateEnlace.execute(Number(id), dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.deleteEnlace.execute(Number(id));
  }
}
