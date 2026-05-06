import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common';
import { CreateComentarioUseCase } from '../../application/use-cases/create-comentario.usecase';
import { GetComentariosUseCase } from '../../application/use-cases/get-comentarios.usecase';
import { DeleteComentarioUseCase } from '../../application/use-cases/delete-comentario.usecase';
import { CreateComentarioDto } from '../../application/dto/create-comentario.dto';

@Controller('comentarios')
export class ComentarioController {
  constructor(
    private readonly createComentarioUseCase: CreateComentarioUseCase,
    private readonly getComentariosUseCase: GetComentariosUseCase,
    private readonly deleteComentarioUseCase: DeleteComentarioUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateComentarioDto) {
    return this.createComentarioUseCase.execute(dto);
  }

  @Get(':convenioId')
  async findByConvenio(@Param('convenioId') convenioId: string) {
    return this.getComentariosUseCase.execute(Number(convenioId));
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.deleteComentarioUseCase.execute(Number(id));
    return { message: 'Comentario eliminado' };
  }
}
