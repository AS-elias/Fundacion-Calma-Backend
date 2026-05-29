import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Body,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudStorageService } from '../../../../core/cloud-storage/cloud-storage.service';
import { memoryStorage } from 'multer';
import { ComunicacionesService } from '../../application/services/comunicaciones.service';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CreateChannelDto } from '../../application/dto/create-channel.dto';
import { UpdateChannelDto } from '../../application/dto/update-channel.dto';
import { ReactionDto } from '../../application/dto/reaction.dto';

@Controller('comunicaciones')
@UseGuards(JwtAuthGuard)
export class ComunicacionesController {
  constructor(
    private readonly comunicacionesService: ComunicacionesService,
    private readonly cloudStorageService: CloudStorageService,
  ) {}

  @Post('channels')
  async createChannel(@Body() dto: CreateChannelDto) {
    return this.comunicacionesService.createChannel(dto);
  }

  @Get('channels/:id/info')
  async getChannelInfo(@Param('id') id: string) {
    const canalId = Number(id);
    if (Number.isNaN(canalId) || canalId < 1) {
      throw new BadRequestException('canalId inválido');
    }
    return this.comunicacionesService.getChannelInfo(canalId);
  }

  @Patch('channels/:id')
  async updateChannel(@Param('id') id: string, @Body() dto: UpdateChannelDto) {
    const canalId = Number(id);
    if (Number.isNaN(canalId) || canalId < 1) {
      throw new BadRequestException('canalId inválido');
    }
    return this.comunicacionesService.updateChannel(canalId, dto);
  }

  @Delete('channels/:id')
  async deleteChannel(@Param('id') id: string, @Req() req: any) {
    const canalId = Number(id);
    if (Number.isNaN(canalId) || canalId < 1) {
      throw new BadRequestException('canalId inválido');
    }
    const usuarioId = req.user?.id || req.user?.sub;
    return this.comunicacionesService.deleteChannel(canalId, usuarioId);
  }

  @Post('channels/:id/files')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    }),
  )
  async uploadFile(
    @Param('id') id: string,
    @UploadedFile() file: any,
    @Req() req: any,
  ) {
    const canalId = Number(id);
    if (!file) {
      throw new BadRequestException('Archivo requerido');
    }
    if (Number.isNaN(canalId) || canalId < 1) {
      throw new BadRequestException('canalId inválido');
    }

    const userId = Number(req.user?.id || req.user?.sub);
    if (Number.isNaN(userId) || userId < 1) {
      throw new BadRequestException('Usuario inválido');
    }

    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const cloudUrl = await this.cloudStorageService.uploadFile(
      file.buffer,
      'comunicaciones',
      `${timestamp}_${safeName}`,
    );

    const message = await this.comunicacionesService.saveMessage({
      canalId,
      remitenteId: userId,
      tipo: 'file',
      archivoUrl: cloudUrl,
    });

    return {
      message: 'Archivo subido',
      data: message,
    };
  }

  @Post('messages/:id/reactions')
  async addReaction(@Param('id') id: string, @Body() body: ReactionDto) {
    const mensajeId = Number(id);
    if (Number.isNaN(mensajeId) || mensajeId < 1) {
      throw new BadRequestException('mensajeId inválido');
    }
    if (!body.usuarioId) {
      throw new BadRequestException('usuarioId es requerido');
    }
    return this.comunicacionesService.addReaction({
      mensajeId,
      usuarioId: body.usuarioId,
      emoji: body.emoji,
    });
  }

  @Get('webrtc/ice-servers')
  getIceServers() {
    return {
      stun: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
      ],
      turn: (process.env.TURN_SERVERS || '')
        .split(',')
        .filter((s) => s.trim())
        .map((server) => {
          const parts = server.trim().split('|');
          return {
            urls: parts[0],
            username: parts[1] || undefined,
            credential: parts[2] || undefined,
          };
        })
        .filter((t) => t.urls),
    };
  }
}
