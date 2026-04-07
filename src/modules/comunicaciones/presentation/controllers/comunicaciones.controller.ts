import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Body,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ComunicacionesService } from '../../application/services/comunicaciones.service';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { UpdateChannelDto } from '../../application/dto/update-channel.dto';
import { ReactionDto } from '../../application/dto/reaction.dto';

@Controller('comunicaciones')
@UseGuards(JwtAuthGuard)
export class ComunicacionesController {
  constructor(private readonly comunicacionesService: ComunicacionesService) { }

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

  @Post('channels/:id/files')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/comunicaciones',
        filename: (_req, file, cb) => {
          const timestamp = Date.now();
          const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
          cb(null, `${timestamp}_${safeName}`);
        },
      }),
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

    const userId = Number(req.user?.sub);
    if (Number.isNaN(userId) || userId < 1) {
      throw new BadRequestException('Usuario inválido');
    }

    const message = await this.comunicacionesService.saveMessage({
      canalId,
      remitenteId: userId,
      tipo: 'file',
      archivoUrl: `/uploads/comunicaciones/${file.filename}`,
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
    return this.comunicacionesService.addReaction({
      mensajeId,
      usuarioId: body.usuarioId,
      emoji: body.emoji,
    });
  }
}
