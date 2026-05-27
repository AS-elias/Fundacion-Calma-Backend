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
  Put,
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
import { CreateCarpetaDto } from '../../application/dto/create-carpeta.dto';
import { SystemGateway } from '../../../websockets/gateways/system.gateway';
import { NotificacionSistemaService } from '../../../notificaciones/application/services/notificacion-sistema.service';

type UploadedRepositorioFile = {
  originalname: string;
  buffer: Buffer;
};

@Controller('repositorio')
export class RepositorioController {
  constructor(
    private readonly repo: PrismaRepositorioDocumentoRepository,
    private readonly storage: RepositorioStorageService,
    private readonly systemGateway: SystemGateway,
    private readonly notificacionSistema: NotificacionSistemaService,
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

  @Post('carpeta')
  @UseGuards(JwtAuthGuard)
  async createCarpeta(@Body() body: CreateCarpetaDto, @Req() req: any) {
    const result = await this.repo.crearCarpeta(body);
    this.systemGateway.emitSistemaActualizado('repositorio', 'crear');
    
    this.notificacionSistema
      .registrar(
        'Nueva Carpeta Creada',
        `Se ha creado la carpeta "${body.nombre}" en el repositorio.`,
        {
          apartado: 'repositorio',
          accion: 'crear',
          actorId: req.user?.sub ?? req.user?.id,
        },
      )
      .catch((e) => console.error('Error al notificar nueva carpeta:', e));

    return result;
  }

  @Get('carpetas/:carpetaId')
  async findByCarpeta(@Param('carpetaId') carpetaId: string) {
    const id = Number(carpetaId);
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('carpetaId debe ser un numero valido.');
    }
    return this.repo.findByCarpeta(id);
  }

  @Delete('carpetas/:id')
  @UseGuards(JwtAuthGuard)
  async removeCarpeta(@Param('id') id: string, @Req() req: any): Promise<void> {
    if (this.esPracticante(req.user?.rol)) {
      throw new ForbiddenException(
        'Los practicantes no pueden eliminar carpetas.',
      );
    }

    const carpetaId = Number(id);

    if (!Number.isInteger(carpetaId) || carpetaId <= 0) {
      throw new BadRequestException('id debe ser un numero valido.');
    }

    await this.repo.deleteCarpeta(carpetaId);
    this.systemGateway.emitSistemaActualizado('repositorio', 'eliminar');
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile() file: UploadedRepositorioFile | undefined,
    @Body() body: any,
    @Req() req: any,
  ) {
    const bloqueId = Number(body.bloqueId);
    const carpetaId = body.padreId ? Number(body.padreId) : null;

    if (!Number.isInteger(bloqueId) || bloqueId <= 0) {
      throw new BadRequestException('bloqueId debe ser un numero valido.');
    }

    if (!file) {
      throw new BadRequestException('Debe enviar un archivo real.');
    }

    // Corregir codificación de Multer (latin1 a utf8) para evitar caracteres como Ã³
    try {
      file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
    } catch (e) {
      // Ignorar si falla la conversión
    }

    const existeBloque = await this.repo.existsBloque(bloqueId);

    if (!existeBloque) {
      throw new NotFoundException(
        'El bloque del repositorio no existe. Ejecuta el seed o envia un bloqueId existente.',
      );
    }

    const storedFile = await this.storage.saveFile(file);

    const esUsuarioPracticante = this.esPracticante(req.user?.rol);
    const estado = esUsuarioPracticante ? 'pendiente' : 'aprobado';
    const subidoPor = req.user?.sub ?? req.user?.id;

    const documento = new RepositorioDocumento(
      0,
      bloqueId,
      storedFile.nombreDocumento,
      storedFile.urlDocumento,
      new Date(),
      carpetaId,
      estado,
      subidoPor,
    );

    const result = await this.repo.create(documento);
    this.systemGateway.emitSistemaActualizado('repositorio', 'crear');

    const mensajeNotificacion = esUsuarioPracticante 
      ? `Ha subido el archivo "${storedFile.nombreDocumento}" y está pendiente de aprobación. Haz clic aquí para revisarlo.`
      : `Se ha subido el archivo "${storedFile.nombreDocumento}" al repositorio público.`;

    this.notificacionSistema
      .registrar(
        esUsuarioPracticante ? 'Documento Pendiente de Aprobación' : 'Nuevo Archivo Subido',
        mensajeNotificacion,
        {
          apartado: 'repositorio',
          accion: 'subir',
          actorId: req.user?.sub ?? req.user?.id,
        },
      )
      .catch((e) => console.error('Error al notificar nuevo archivo:', e));

    return result;
  }

  @Post('enlace')
  @UseGuards(JwtAuthGuard)
  async createEnlace(@Body() body: any, @Req() req: any) {
    const bloqueId = Number(body.bloqueId);
    const carpetaId = body.padreId ? Number(body.padreId) : null;
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

    const esUsuarioPracticante = this.esPracticante(req.user?.rol);
    const estado = esUsuarioPracticante ? 'pendiente' : 'aprobado';
    const subidoPor = req.user?.sub ?? req.user?.id;

    const documento = new RepositorioDocumento(
      0,
      bloqueId,
      nombre,
      url,
      new Date(),
      carpetaId,
      estado,
      subidoPor,
    );

    const result = await this.repo.create(documento);
    this.systemGateway.emitSistemaActualizado('repositorio', 'crear');

    const mensajeNotificacionEnlace = esUsuarioPracticante 
      ? `Ha añadido el enlace "${nombre}" y está pendiente de aprobación. Haz clic aquí para revisarlo.`
      : `Se ha añadido el enlace "${nombre}" al repositorio público.`;

    this.notificacionSistema
      .registrar(
        esUsuarioPracticante ? 'Enlace Pendiente de Aprobación' : 'Nuevo Enlace Añadido',
        mensajeNotificacionEnlace,
        {
          apartado: 'repositorio',
          accion: 'crear',
          actorId: req.user?.sub ?? req.user?.id,
        },
      )
      .catch((e) => console.error('Error al notificar nuevo enlace:', e));

    return result;
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

    await this.repo.delete(documentoId);
    this.systemGateway.emitSistemaActualizado('repositorio', 'eliminar');
  }

  @Put(':id/mover')
  @UseGuards(JwtAuthGuard)
  async mover(
    @Param('id') id: string,
    @Body() body: { padreId: number | null; esCarpeta?: boolean },
    @Req() req: any,
  ) {
    if (this.esPracticante(req.user?.rol)) {
      throw new ForbiddenException(
        'Los practicantes no pueden mover elementos del repositorio.',
      );
    }

    const itemId = Number(id);

    if (!Number.isInteger(itemId) || itemId <= 0) {
      throw new BadRequestException('id debe ser un numero valido.');
    }

    const padreId = body.padreId ? Number(body.padreId) : null;
    const esCarpeta = Boolean(body.esCarpeta);

    const result = await this.repo.mover(itemId, padreId, esCarpeta);
    this.systemGateway.emitSistemaActualizado('repositorio', 'editar');
    return result;
  }

  @Put(':id/estado')
  @UseGuards(JwtAuthGuard)
  async cambiarEstado(
    @Param('id') id: string,
    @Body() body: { estado: 'aprobado' | 'rechazado' },
    @Req() req: any,
  ) {
    if (this.esPracticante(req.user?.rol)) {
      throw new ForbiddenException(
        'Los practicantes no pueden aprobar o rechazar documentos.',
      );
    }

    const documentoId = Number(id);

    if (!Number.isInteger(documentoId) || documentoId <= 0) {
      throw new BadRequestException('id debe ser un numero valido.');
    }

    if (body.estado === 'rechazado') {
      await this.repo.delete(documentoId);
      this.systemGateway.emitSistemaActualizado('repositorio', 'eliminar');
      return { message: 'Documento rechazado y eliminado' };
    }

    await this.repo.actualizarEstado(documentoId, 'aprobado');
    this.systemGateway.emitSistemaActualizado('repositorio', 'editar');
    
    this.notificacionSistema
      .registrar(
        'Documento Aprobado',
        `Un documento pendiente ha sido aprobado en el repositorio.`,
        {
          apartado: 'repositorio',
          accion: 'editar',
          actorId: req.user?.sub ?? req.user?.id,
        },
      )
      .catch((e) => console.error('Error al notificar aprobacion:', e));

    return { message: 'Documento aprobado' };
  }

  private normalizarUrl(url: string): string {
    if (!url) {
      return '';
    }

    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  }

  private esPracticante(rol: string | undefined): boolean {
    const normalized = (rol ?? '').toString().trim().toLowerCase();

    return normalized === 'practicante' || normalized === 'coordinador';
  }
}
