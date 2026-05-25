import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';

import { CreateConvenioUseCase } from '../../application/use-cases/create-convenio.usecase';
import { GetConveniosUseCase } from '../../application/use-cases/get-convenios.usecase';
import { GetConvenioUseCase } from '../../application/use-cases/get-convenio.usecase';
import { UpdateConvenioUseCase } from '../../application/use-cases/update-convenio.usecase';
import { DeleteConvenioUseCase } from '../../application/use-cases/delete-convenio.usecase';

import { CreateConvenioDto } from '../../application/dto/create-convenio.dto';
import { UpdateConvenioDto } from '../../application/dto/update-convenio.dto';

@Controller('convenios')
export class ConveniosController {
  constructor(
    private readonly createConvenio: CreateConvenioUseCase,
    private readonly getConvenios: GetConveniosUseCase,
    private readonly getConvenio: GetConvenioUseCase,
    private readonly updateConvenio: UpdateConvenioUseCase,
    private readonly deleteConvenio: DeleteConvenioUseCase,
  ) {}

  private withSuccessMessage<T extends object>(data: T, message: string) {
    return {
      ...data,
      message,
      mensaje: message,
    };
  }

  @Post()
  async create(@Body() dto: CreateConvenioDto) {
    const convenio = await this.createConvenio.execute(dto);
    return this.withSuccessMessage(convenio, 'Convenio guardado exitosamente.');
  }

  @Get()
  async findAll() {
    return this.getConvenios.execute();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.getConvenio.execute(Number(id));
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateConvenioDto) {
    const convenio = await this.updateConvenio.execute(Number(id), dto);
    return this.withSuccessMessage(
      convenio,
      'Se guardaron los cambios exitosamente.',
    );
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Query('usuarioId') usuarioId?: string,
    @Query('usuarioNombre') usuarioNombre?: string,
  ) {
    return this.deleteConvenio.execute(
      Number(id),
      usuarioId ? Number(usuarioId) : undefined,
      usuarioNombre,
    );
  }
}
