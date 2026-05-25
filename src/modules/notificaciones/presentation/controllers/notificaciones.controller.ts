import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { NotificacionPrismaRepository } from '../../infrastructure/repositories/prisma-notificacion.repository';
import { NotificacionStorageService } from '../../application/services/notificacion-storage.service';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { UsuarioActual } from '../../../auth/infrastructure/decorators/current-user.decorator';
import { RolesFundacion } from '../../../auth/domain/enums/roles.enum';

type UploadedNotificacionFile = {
  originalname: string;
  buffer: Buffer;
};

@Controller('notificaciones')
export class NotificacionesController {

  constructor(
    private readonly repo: NotificacionPrismaRepository,
    private readonly storage: NotificacionStorageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('imagen'))
  async crear(
    @UploadedFile() imagen: UploadedNotificacionFile | undefined,
    @Body() data: any,
    @Req() req: any,
  ) {
    this.assertPuedeCrearNotificacion(req.user);

    const titulo = String(data.titulo ?? '').trim();
    const mensaje = String(data.mensaje ?? '').trim();
    const tipo = 'comunicados';

    if (!titulo || !mensaje) {
      throw new BadRequestException('titulo y mensaje son obligatorios.');
    }

    let imagenUrl: string | null = null;

    if (imagen) {
      const storedImage = await this.storage.saveFile(imagen);
      imagenUrl = storedImage.urlArchivo;
    }

    const noti = await this.repo.crear({
      titulo,
      mensaje,
      tipo,
      imagen: imagenUrl,
    });

    return noti;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  listar(
    @UsuarioActual() usuario: { id: number; rol: string },
    @Query('usuarioId') usuarioId?: string
  ) {
    return this.repo.listar(usuario.id, usuario.rol, this.parseOptionalUserId(usuarioId));
  }

  @Patch(':id/leido')
  async marcar(
    @Param('id') id: string,
    @Body() body: any,
    @Query('usuarioId') usuarioId?: string,
  ) {
    const notificacionId = this.parseId(id);

    try {
      return await this.repo.marcarLeido(
        notificacionId,
        Boolean(body.leido),
        this.parseOptionalUserId(usuarioId ?? body.usuarioId),
      );
    } catch {
      throw new NotFoundException('La notificacion no existe.');
    }
  }

  @Patch(':id/favorito')
  async marcarFavorito(
    @Param('id') id: string,
    @Body() body: any,
    @Query('usuarioId') usuarioId?: string,
  ) {
    const notificacionId = this.parseId(id);
    const usuario = this.parseOptionalUserId(usuarioId ?? body.usuarioId);

    if (!usuario) {
      throw new BadRequestException('usuarioId es obligatorio para marcar favoritos.');
    }

    try {
      return await this.repo.actualizarPreferencia(notificacionId, usuario, {
        favorito: Boolean(body.favorito),
      });
    } catch {
      throw new NotFoundException('La notificacion no existe.');
    }
  }

  @Patch(':id/archivado')
  async marcarArchivado(
    @Param('id') id: string,
    @Body() body: any,
    @Query('usuarioId') usuarioId?: string,
  ) {
    const notificacionId = this.parseId(id);
    const usuario = this.parseOptionalUserId(usuarioId ?? body.usuarioId);

    if (!usuario) {
      throw new BadRequestException('usuarioId es obligatorio para archivar notificaciones.');
    }

    try {
      return await this.repo.actualizarPreferencia(notificacionId, usuario, {
        archivado: Boolean(body.archivado),
      });
    } catch {
      throw new NotFoundException('La notificacion no existe.');
    }
  }

  @Delete(':id')
  async eliminar(
    @Param('id') id: string,
    @Query('usuarioId') usuarioId?: string,
  ) {
    const notificacionId = this.parseId(id);
    const usuario = this.parseOptionalUserId(usuarioId);

    if (!usuario) {
      throw new BadRequestException('usuarioId es obligatorio para eliminar la notificacion solo para el usuario actual.');
    }

    try {
      return await this.repo.eliminar(notificacionId, usuario);
    } catch {
      throw new NotFoundException('La notificacion no existe.');
    }
  }

  private parseId(id: string): number {
    const parsedId = Number(id);

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      throw new BadRequestException('id debe ser un numero valido.');
    }

    return parsedId;
  }

  private parseOptionalUserId(id: string | number | undefined): number | undefined {
    if (id === undefined || id === null || id === '') {
      return undefined;
    }

    const parsedId = Number(id);

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      throw new BadRequestException('usuarioId debe ser un numero valido.');
    }

    return parsedId;
  }

  private assertPuedeCrearNotificacion(user: any): void {
    const rolesPermitidos = [
      RolesFundacion.ADMIN,
      RolesFundacion.ADMINISTRADOR,
      RolesFundacion.DIRECTOR,
    ];

    if (!user || !rolesPermitidos.includes(user.rol)) {
      throw new ForbiddenException('Solo el administrador o director pueden crear notificaciones.');
    }
  }
}
