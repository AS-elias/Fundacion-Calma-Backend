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
import { CreateAnalisisTareaDto } from '../../application/dto/create-analisis-tarea.dto';
import { UpdateAnalisisTareaDto } from '../../application/dto/update-analisis-tarea.dto';
import { CreateAnalisisTareaUseCase } from '../../application/use-cases/create-analisis-tarea.usecase';
import { DeleteAnalisisTareaUseCase } from '../../application/use-cases/delete-analisis-tarea.usecase';
import { GetAnalisisTareaUseCase } from '../../application/use-cases/get-analisis-tarea.usecase';
import { GetAnalisisTareasUseCase } from '../../application/use-cases/get-analisis-tareas.usecase';
import { UpdateAnalisisTareaUseCase } from '../../application/use-cases/update-analisis-tarea.usecase';

@Controller(['analisis-tareas', 'analisis_tareas'])
export class AnalisisTareasController {
  constructor(
    private readonly createTarea: CreateAnalisisTareaUseCase,
    private readonly getTareas: GetAnalisisTareasUseCase,
    private readonly getTarea: GetAnalisisTareaUseCase,
    private readonly updateTarea: UpdateAnalisisTareaUseCase,
    private readonly deleteTarea: DeleteAnalisisTareaUseCase,
  ) {}

  @Get()
  findAll(@Query('search') search?: string, @Query('estado') estado?: string) {
    return this.getTareas.execute({ search, estado });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.getTarea.execute(Number(id));
  }

  @Post()
  create(@Body() dto: CreateAnalisisTareaDto) {
    return this.createTarea.execute(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAnalisisTareaDto) {
    return this.updateTarea.execute(Number(id), dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.deleteTarea.execute(Number(id));
  }
}
