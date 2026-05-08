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
import { CreateAnalisisColegioDto } from '../../application/dto/create-analisis-colegio.dto';
import { UpdateAnalisisColegioDto } from '../../application/dto/update-analisis-colegio.dto';
import { CreateAnalisisColegioUseCase } from '../../application/use-cases/create-analisis-colegio.usecase';
import { DeleteAnalisisColegioUseCase } from '../../application/use-cases/delete-analisis-colegio.usecase';
import { GetAnalisisColegioUseCase } from '../../application/use-cases/get-analisis-colegio.usecase';
import { GetAnalisisColegiosUseCase } from '../../application/use-cases/get-analisis-colegios.usecase';
import { UpdateAnalisisColegioUseCase } from '../../application/use-cases/update-analisis-colegio.usecase';

@Controller(['analisis-colegios', 'analisis_colegios'])
export class AnalisisColegiosController {
  constructor(
    private readonly createColegio: CreateAnalisisColegioUseCase,
    private readonly getColegios: GetAnalisisColegiosUseCase,
    private readonly getColegio: GetAnalisisColegioUseCase,
    private readonly updateColegio: UpdateAnalisisColegioUseCase,
    private readonly deleteColegio: DeleteAnalisisColegioUseCase,
  ) {}

  @Get()
  findAll(@Query('search') search?: string, @Query('tipo') tipo?: string) {
    return this.getColegios.execute({ search, tipo });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.getColegio.execute(Number(id));
  }

  @Post()
  create(@Body() dto: CreateAnalisisColegioDto) {
    return this.createColegio.execute(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAnalisisColegioDto) {
    return this.updateColegio.execute(Number(id), dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.deleteColegio.execute(Number(id));
  }
}
