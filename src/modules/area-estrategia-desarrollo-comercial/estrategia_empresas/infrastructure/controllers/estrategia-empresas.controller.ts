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
import { CreateEstrategiaEmpresaDto } from '../../application/dto/create-estrategia-empresa.dto';
import { UpdateEstrategiaEmpresaDto } from '../../application/dto/update-estrategia-empresa.dto';
import { CreateEstrategiaEmpresaUseCase } from '../../application/use-cases/create-estrategia-empresa.usecase';
import { DeleteEstrategiaEmpresaUseCase } from '../../application/use-cases/delete-estrategia-empresa.usecase';
import { GetEstrategiaEmpresaUseCase } from '../../application/use-cases/get-estrategia-empresa.usecase';
import { GetEstrategiaEmpresasUseCase } from '../../application/use-cases/get-estrategia-empresas.usecase';
import { UpdateEstrategiaEmpresaUseCase } from '../../application/use-cases/update-estrategia-empresa.usecase';
import { positiveId } from '../../../estrategia_comercial/estrategia-comercial.utils';

@Controller(['estrategia-empresas', 'estrategia_empresas'])
export class EstrategiaEmpresasController {
  constructor(
    private readonly createEmpresa: CreateEstrategiaEmpresaUseCase,
    private readonly getEmpresas: GetEstrategiaEmpresasUseCase,
    private readonly getEmpresa: GetEstrategiaEmpresaUseCase,
    private readonly updateEmpresa: UpdateEstrategiaEmpresaUseCase,
    private readonly deleteEmpresa: DeleteEstrategiaEmpresaUseCase,
  ) {}

  @Get()
  findAll(@Query('search') search?: string) {
    return this.getEmpresas.execute({ search });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.getEmpresa.execute(positiveId(id));
  }

  @Post()
  create(@Body() dto: CreateEstrategiaEmpresaDto) {
    return this.createEmpresa.execute(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEstrategiaEmpresaDto) {
    return this.updateEmpresa.execute(positiveId(id), dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.deleteEmpresa.execute(positiveId(id));
  }
}
