import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateComentarioUseCase } from '../../application/use-cases/create-comentario.usecase';
import { GetComentariosUseCase } from '../../application/use-cases/get-comentarios.usecase';
import { DeleteComentarioUseCase } from '../../application/use-cases/delete-comentario.usecase';
import { CreateComentarioDto } from '../../application/dto/create-comentario.dto';
import { JwtAuthGuard } from '../../../../auth/infrastructure/guards/jwt-auth.guard';

@Controller('comentarios')
export class ComentarioController {
  constructor(
    private readonly createComentarioUseCase: CreateComentarioUseCase,
    private readonly getComentariosUseCase: GetComentariosUseCase,
    private readonly deleteComentarioUseCase: DeleteComentarioUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateComentarioDto, @Request() req: any) {
    return this.createComentarioUseCase.execute({
      ...dto,
      usuarioId: req.user.id,
    });
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
