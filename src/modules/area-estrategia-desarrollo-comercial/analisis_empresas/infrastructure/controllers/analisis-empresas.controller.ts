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
import { CreateAnalisisEmpresaDto } from '../../application/dto/create-analisis-empresa.dto';
import { UpdateAnalisisEmpresaDto } from '../../application/dto/update-analisis-empresa.dto';
import { CreateAnalisisEmpresaUseCase } from '../../application/use-cases/create-analisis-empresa.usecase';
import { DeleteAnalisisEmpresaUseCase } from '../../application/use-cases/delete-analisis-empresa.usecase';
import { GetAnalisisEmpresaUseCase } from '../../application/use-cases/get-analisis-empresa.usecase';
import { GetAnalisisEmpresasUseCase } from '../../application/use-cases/get-analisis-empresas.usecase';
import { UpdateAnalisisEmpresaUseCase } from '../../application/use-cases/update-analisis-empresa.usecase';

@Controller(['analisis-empresas', 'analisis_empresas'])
export class AnalisisEmpresasController {
  constructor(
    private readonly createEmpresa: CreateAnalisisEmpresaUseCase,
    private readonly getEmpresas: GetAnalisisEmpresasUseCase,
    private readonly getEmpresa: GetAnalisisEmpresaUseCase,
    private readonly updateEmpresa: UpdateAnalisisEmpresaUseCase,
    private readonly deleteEmpresa: DeleteAnalisisEmpresaUseCase,
  ) {}

  @Get()
  findAll(@Query('search') search?: string, @Query('estado') estado?: string) {
    return this.getEmpresas.execute({ search, estado });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.getEmpresa.execute(Number(id));
  }

  @Post()
  create(@Body() dto: CreateAnalisisEmpresaDto) {
    return this.createEmpresa.execute(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAnalisisEmpresaDto) {
    return this.updateEmpresa.execute(Number(id), dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.deleteEmpresa.execute(Number(id));
  }
}
