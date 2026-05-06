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
import { CreateAnalisisDifusionDto } from '../../application/dto/create-analisis-difusion.dto';
import { UpdateAnalisisDifusionDto } from '../../application/dto/update-analisis-difusion.dto';
import { CreateAnalisisDifusionUseCase } from '../../application/use-cases/create-analisis-difusion.usecase';
import { DeleteAnalisisDifusionUseCase } from '../../application/use-cases/delete-analisis-difusion.usecase';
import { GetAnalisisDifusionUseCase } from '../../application/use-cases/get-analisis-difusion.usecase';
import { GetAnalisisDifusionesUseCase } from '../../application/use-cases/get-analisis-difusiones.usecase';
import { UpdateAnalisisDifusionUseCase } from '../../application/use-cases/update-analisis-difusion.usecase';

@Controller(['analisis-difusiones', 'analisis_difusiones'])
export class AnalisisDifusionesController {
  constructor(
    private readonly createDifusion: CreateAnalisisDifusionUseCase,
    private readonly getDifusiones: GetAnalisisDifusionesUseCase,
    private readonly getDifusion: GetAnalisisDifusionUseCase,
    private readonly updateDifusion: UpdateAnalisisDifusionUseCase,
    private readonly deleteDifusion: DeleteAnalisisDifusionUseCase,
  ) {}

  @Get()
  findAll(@Query('search') search?: string, @Query('estado') estado?: string) {
    return this.getDifusiones.execute({ search, estado });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.getDifusion.execute(Number(id));
  }

  @Post()
  create(@Body() dto: CreateAnalisisDifusionDto) {
    return this.createDifusion.execute(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAnalisisDifusionDto) {
    return this.updateDifusion.execute(Number(id), dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.deleteDifusion.execute(Number(id));
  }
}
