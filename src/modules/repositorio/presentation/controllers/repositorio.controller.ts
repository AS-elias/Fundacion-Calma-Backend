import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RepositorioStorageService } from '../../application/services/repositorio-storage.service';
import { RepositorioDocumento } from '../../domain/entities/repositorio-documento.entity';
import { PrismaRepositorioDocumentoRepository } from '../../infrastructure/repositories/prisma-repositorio-documento.repository';

type UploadedRepositorioFile = {
  originalname: string;
  buffer: Buffer;
};

@Controller('repositorio')
export class RepositorioController {
  constructor(
    private readonly repo: PrismaRepositorioDocumentoRepository,
    private readonly storage: RepositorioStorageService,
  ) {}

  @Get()
  async listarBloques() {
    return this.repo.listarBloques();
  }

  @Get('bloque/:bloqueId')
  async findByBloque(@Param('bloqueId') bloqueId: string) {
    const id = Number(bloqueId);

    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('bloqueId debe ser un numero valido.');
    }

    const existeBloque = await this.repo.existsBloque(id);

    if (!existeBloque) {
      throw new NotFoundException('El bloque del repositorio no existe.');
    }

    return this.repo.findByBloque(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile() file: UploadedRepositorioFile | undefined,
    @Body() body: any,
  ) {
    const bloqueId = Number(body.bloqueId);

    if (!Number.isInteger(bloqueId) || bloqueId <= 0) {
      throw new BadRequestException('bloqueId debe ser un numero valido.');
    }

    if (!file) {
      throw new BadRequestException('Debe enviar un archivo real.');
    }

    const existeBloque = await this.repo.existsBloque(bloqueId);

    if (!existeBloque) {
      throw new NotFoundException(
        'El bloque del repositorio no existe. Ejecuta el seed o envia un bloqueId existente.',
      );
    }

    const storedFile = await this.storage.saveFile(file);

    const documento = new RepositorioDocumento(
      0,
      bloqueId,
      storedFile.nombreDocumento,
      storedFile.urlDocumento,
      new Date(),
    );

    return this.repo.create(documento);
  }

  @Post('enlace')
  async createEnlace(@Body() body: any) {
    const bloqueId = Number(body.bloqueId);
    const nombre = String(body.nombre ?? '').trim() || 'Fundacion Calma';
    const url = this.normalizarUrl(String(body.url ?? '').trim());

    if (!Number.isInteger(bloqueId) || bloqueId <= 0) {
      throw new BadRequestException('bloqueId debe ser un numero valido.');
    }

    if (!url) {
      throw new BadRequestException('Debe enviar el enlace de la red social.');
    }

    const existeBloque = await this.repo.existsBloque(bloqueId);

    if (!existeBloque) {
      throw new NotFoundException('El bloque del repositorio no existe.');
    }

    const documento = new RepositorioDocumento(
      0,
      bloqueId,
      nombre,
      url,
      new Date(),
    );

    return this.repo.create(documento);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Req() req: any): Promise<void> {
    if (this.esPracticante(req.user?.rol)) {
      throw new ForbiddenException(
        'Los practicantes no pueden eliminar archivos ni enlaces del repositorio.',
      );
    }

    const documentoId = Number(id);

    if (!Number.isInteger(documentoId) || documentoId <= 0) {
      throw new BadRequestException('id debe ser un numero valido.');
    }

    return this.repo.delete(documentoId);
  }

  private normalizarUrl(url: string): string {
    if (!url) {
      return '';
    }

    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  }

  private esPracticante(rol: string | undefined): boolean {
    const normalized = (rol ?? '')
      .toString()
      .trim()
      .toLowerCase();

    return normalized === 'practicante' || normalized === 'coordinador';
  }
}
