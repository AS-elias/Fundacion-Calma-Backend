import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BadRequestException, Logger } from '@nestjs/common';
import { ComunicacionesService } from '../../application/services/comunicaciones.service';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateChannelDto } from '../../application/dto/create-channel.dto';
import { MessageDto } from '../../application/dto/message.dto';
import { JoinChannelDto } from '../../application/dto/join-channel.dto';
import { UpdateChannelDto } from '../../application/dto/update-channel.dto';
import { ReactionDto } from '../../application/dto/reaction.dto';
import { ReadReceiptDto } from '../../application/dto/read-receipt.dto';
import { EditDeleteDto } from '../../application/dto/edit-delete.dto';
import { GetRecentMessagesDto } from '../../application/dto/get-recent-messages.dto';

@WebSocketGateway({
  namespace: '/comunicaciones',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class ComunicacionesGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ComunicacionesGateway.name);

  constructor(private readonly comunicacionesService: ComunicacionesService) { }

  async handleConnection(socket: Socket) {
    try {
      const token =
        socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        socket.emit('unauthorized', { message: 'Token ausente' });
        socket.disconnect(true);
        return;
      }

      const payload = this.comunicacionesService.verifyToken(String(token));
      socket.data.user = payload;
      this.logger.log(
        `Socket conectado: ${socket.id}, usuario: ${payload.sub}`,
      );
    } catch (err: any) {
      this.logger.warn(`Conexión rechazada: ${socket.id} -> ${err.message}`);
      socket.emit('unauthorized', { message: err.message || 'Token inválido' });
      socket.disconnect(true);
    }
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`Conexión WebSocket finalizada: ${socket.id}`);
  }

  private async validatePayload<T extends object>(
    payload: unknown,
    dtoClass: new () => T,
  ): Promise<T> {
    const dto = plainToInstance(dtoClass as any, payload);
    const errors = await validate(dto as any);
    if (errors.length > 0) {
      const message = errors
        .map((error) => Object.values(error.constraints ?? {}).join(', '))
        .filter(Boolean)
        .join('; ');
      throw new BadRequestException(
        `Payload validation failed: ${message || 'invalid payload'}`,
      );
    }
    return dto as T;
  }

  @SubscribeMessage('createChannel')
  async createChannel(
    @MessageBody() payload: CreateChannelDto,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      this.logger.log('createChannel - iniciando');
      const dto = await this.validatePayload(payload, CreateChannelDto);
      const canal = await this.comunicacionesService.createChannel(dto);

      this.server.emit('channelCreated', {
        canalId: canal.id,
        nombre: canal.nombre,
        esGrupo: canal.es_grupo,
      });

      socket.emit('createChannelResponse', {
        success: true,
        data: {
          canalId: canal.id,
          nombre: canal.nombre,
          esGrupo: canal.es_grupo,
        },
      });
    } catch (error: any) {
      this.logger.error('createChannel error:', error.message);
      socket.emit('createChannelResponse', {
        success: false,
        error: error.message || 'Error creating channel',
      });
    }
  }

  @SubscribeMessage('joinChannel')
  async joinChannel(
    @MessageBody() payload: JoinChannelDto,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const dto = await this.validatePayload(payload, JoinChannelDto);
      const isParticipant = await this.comunicacionesService.isParticipant(
        dto.canalId,
        dto.usuarioId,
      );
      if (!isParticipant) {
        socket.emit('joinChannelResponse', {
          success: false,
          error: 'No autorizado en este canal',
        });
        return;
      }

      const room = `canal_${payload.canalId}`;
      socket.join(room);
      socket.emit('joinedChannel', { canalId: payload.canalId, room });
      this.server.to(room).emit('presence', {
        canalId: payload.canalId,
        usuarioId: payload.usuarioId,
        connected: true,
      });
      socket.emit('joinChannelResponse', {
        success: true,
        data: { canalId: payload.canalId, room },
      });
    } catch (error: any) {
      this.logger.error('joinChannel error:', error.message);
      socket.emit('joinChannelResponse', {
        success: false,
        error: error.message || 'Error joining channel',
      });
    }
  }

  @SubscribeMessage('addParticipant')
  async addParticipant(
    @MessageBody() payload: JoinChannelDto & { actorId?: number },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const dto = await this.validatePayload(payload, JoinChannelDto);
      await this.comunicacionesService.addParticipant(dto.canalId, dto.usuarioId);
      this.server
        .to(`canal_${payload.canalId}`)
        .emit('participantAdded', payload);
      socket.emit('addParticipantResponse', {
        success: true,
        data: payload,
      });
    } catch (error: any) {
      this.logger.error('addParticipant error:', error.message);
      socket.emit('addParticipantResponse', {
        success: false,
        error: error.message || 'Error adding participant',
      });
    }
  }

  @SubscribeMessage('removeParticipant')
  async removeParticipant(
    @MessageBody() payload: JoinChannelDto & { actorId?: number },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const dto = await this.validatePayload(payload, JoinChannelDto);
      await this.comunicacionesService.removeParticipant(
        dto.canalId,
        dto.usuarioId,
      );
      this.server
        .to(`canal_${payload.canalId}`)
        .emit('participantRemoved', payload);
      socket.emit('removeParticipantResponse', {
        success: true,
        data: payload,
      });
    } catch (error: any) {
      this.logger.error('removeParticipant error:', error.message);
      socket.emit('removeParticipantResponse', {
        success: false,
        error: error.message || 'Error removing participant',
      });
    }
  }

  @SubscribeMessage('leaveChannel')
  async leaveChannel(
    @MessageBody() payload: JoinChannelDto,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const dto = await this.validatePayload(payload, JoinChannelDto);
      const room = `canal_${dto.canalId}`;
      socket.leave(room);
      this.server.to(room).emit('presence', {
        canalId: dto.canalId,
        usuarioId: dto.usuarioId,
        connected: false,
      });
      socket.emit('leaveChannelResponse', {
        success: true,
        data: { canalId: dto.canalId },
      });
    } catch (error: any) {
      this.logger.error('leaveChannel error:', error.message);
      socket.emit('leaveChannelResponse', {
        success: false,
        error: error.message || 'Error leaving channel',
      });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() payload: MessageDto,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const dto = await this.validatePayload(payload, MessageDto);
      const isParticipant = await this.comunicacionesService.isParticipant(
        dto.canalId,
        dto.remitenteId,
      );
      if (!isParticipant) {
        socket.emit('sendMessageResponse', {
          success: false,
          error: 'No autorizado en este canal',
        });
        return;
      }

      const mensaje = await this.comunicacionesService.saveMessage({
        canalId: dto.canalId,
        remitenteId: dto.remitenteId,
        contenido: dto.contenido ?? '',
        tipo: dto.tipo ?? 'text',
        archivoUrl: dto.archivoUrl,
      });
      const response = {
        id: mensaje.id,
        canalId: dto.canalId,
        remitenteId: dto.remitenteId,
        contenido: dto.contenido,
        tipo: dto.tipo || 'text',
        archivoUrl: dto.archivoUrl,
        creadoAt: mensaje.creado_at,
      };

      this.server.to(`canal_${dto.canalId}`).emit('newMessage', response);
      socket.emit('sendMessageResponse', { success: true, data: response });
    } catch (error: any) {
      this.logger.error('sendMessage error:', error.message);
      socket.emit('sendMessageResponse', {
        success: false,
        error: error.message || 'Error sending message',
      });
    }
  }

  @SubscribeMessage('getRecentMessages')
  async getRecentMessages(
    @MessageBody() payload: GetRecentMessagesDto,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const canalesDto = await this.validatePayload(
        payload,
        GetRecentMessagesDto,
      );
      const mensajes = await this.comunicacionesService.getRecentMessages(
        canalesDto.canalId,
      );
      const reversedMessages = mensajes.reverse();
      socket.emit('recentMessages', reversedMessages);
      socket.emit('getRecentMessagesResponse', {
        success: true,
        data: reversedMessages,
      });
    } catch (error: any) {
      this.logger.error('getRecentMessages error:', error.message);
      socket.emit('getRecentMessagesResponse', {
        success: false,
        error: error.message || 'Error fetching messages',
      });
    }
  }

  @SubscribeMessage('getUserChannels')
  async getUserChannels(
    @MessageBody() payload: { usuarioId: number },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const canales = await this.comunicacionesService.getUserChannels(
        payload.usuarioId,
      );
      const result = canales.map((p) => ({
        canalId: p.canal_id,
        nombre: p.canales?.nombre,
        descripcion: p.canales?.descripcion,
        avatarUrl: p.canales?.avatar_url,
        esGrupo: p.canales?.es_grupo,
        totalParticipantes: p.canales?.participantes_canal?.length ?? 0,
        participantes:
          p.canales?.participantes_canal.map((pc) => ({
            usuarioId: pc.usuario_id,
            nombre: pc.usuarios?.nombre_completo,
            avatar: pc.usuarios?.foto_url,
          })) ?? [],
        ultimoMensaje: p.canales?.mensajes?.[0]
          ? {
            id: p.canales.mensajes[0].id,
            contenido: p.canales.mensajes[0].contenido,
            tipo: p.canales.mensajes[0].tipo,
            archivoUrl: p.canales.mensajes[0].archivo_url,
            remitenteId: p.canales.mensajes[0].emisor_id,
            fecha: p.canales.mensajes[0].creado_at,
          }
          : null,
      }));

      socket.emit('userChannels', result);
      socket.emit('getUserChannelsResponse', {
        success: true,
        data: result,
      });
    } catch (error: any) {
      this.logger.error('getUserChannels error:', error.message);
      socket.emit('getUserChannelsResponse', {
        success: false,
        error: error.message || 'Error fetching channels',
      });
    }
  }

  @SubscribeMessage('channelInfo')
  async channelInfo(
    @MessageBody() payload: { canalId: number },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      if (!payload?.canalId) throw new BadRequestException('canalId requerido');
      const canal = await this.comunicacionesService.getChannelInfo(
        payload.canalId,
      );
      if (!canal) {
        socket.emit('channelInfoResponse', {
          success: false,
          error: 'Canal no encontrado',
        });
        return;
      }

      const response = {
        canalId: canal.id,
        nombre: canal.nombre,
        descripcion: canal.descripcion,
        avatarUrl: canal.avatar_url,
        esGrupo: canal.es_grupo,
        participantes:
          canal.participantes_canal?.map((p) => ({
            usuarioId: p.usuario_id,
            nombre: p.usuarios?.nombre_completo,
            avatar: p.usuarios?.foto_url,
          })) ?? [],
        totalParticipantes: canal.participantes_canal?.length ?? 0,
        ultimoMensaje: canal.mensajes?.[0] ?? null,
      };

      socket.emit('channelInfo', response);
      socket.emit('channelInfoResponse', {
        success: true,
        data: response,
      });
    } catch (error: any) {
      this.logger.error('channelInfo error:', error.message);
      socket.emit('channelInfoResponse', {
        success: false,
        error: error.message || 'Error fetching channel info',
      });
    }
  }

  @SubscribeMessage('updateChannel')
  async updateChannel(
    @MessageBody() payload: UpdateChannelDto,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const dto = await this.validatePayload(payload, UpdateChannelDto);
      const canal = await this.comunicacionesService.updateChannel(dto.canalId, {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        avatarUrl: dto.avatarUrl,
        esGrupo: dto.esGrupo,
      });
      this.server.to(`canal_${dto.canalId}`).emit('channelUpdated', canal);
      socket.emit('updateChannelResponse', {
        success: true,
        data: canal,
      });
    } catch (error: any) {
      this.logger.error('updateChannel error:', error.message);
      socket.emit('updateChannelResponse', {
        success: false,
        error: error.message || 'Error updating channel',
      });
    }
  }

  @SubscribeMessage('addReaction')
  async addReaction(
    @MessageBody() payload: ReactionDto,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const dto = await this.validatePayload(payload, ReactionDto);
      const reaction = await this.comunicacionesService.addReaction(dto);
      this.server.to(`canal_${dto.canalId}`).emit('reactionAdded', reaction);
      socket.emit('addReactionResponse', {
        success: true,
        data: reaction,
      });
    } catch (error: any) {
      this.logger.error('addReaction error:', error.message);
      socket.emit('addReactionResponse', {
        success: false,
        error: error.message || 'Error adding reaction',
      });
    }
  }

  @SubscribeMessage('removeReaction')
  async removeReaction(
    @MessageBody() payload: ReactionDto,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const dto = await this.validatePayload(payload, ReactionDto);
      await this.comunicacionesService.removeReaction(
        dto.mensajeId,
        dto.usuarioId,
        dto.emoji,
      );
      this.server.to(`canal_${dto.canalId}`).emit('reactionRemoved', dto);
      socket.emit('removeReactionResponse', {
        success: true,
        data: dto,
      });
    } catch (error: any) {
      this.logger.error('removeReaction error:', error.message);
      socket.emit('removeReactionResponse', {
        success: false,
        error: error.message || 'Error removing reaction',
      });
    }
  }

  @SubscribeMessage('getReactions')
  async getReactions(
    @MessageBody() payload: { mensajeId: number },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      if (!payload?.mensajeId)
        throw new BadRequestException('mensajeId requerido');
      const reactions = await this.comunicacionesService.getReactions(
        payload.mensajeId,
      );
      socket.emit('reactions', reactions);
      socket.emit('getReactionsResponse', {
        success: true,
        data: reactions,
      });
    } catch (error: any) {
      this.logger.error('getReactions error:', error.message);
      socket.emit('getReactionsResponse', {
        success: false,
        error: error.message || 'Error fetching reactions',
      });
    }
  }

  @SubscribeMessage('readMessage')
  async readMessage(
    @MessageBody() payload: ReadReceiptDto,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const dto = await this.validatePayload(payload, ReadReceiptDto);
      await this.comunicacionesService.markAsRead(dto.mensajeId, dto.usuarioId);
      this.server.to(`canal_${dto.canalId}`).emit('readReceipt', dto);
      socket.emit('readMessageResponse', {
        success: true,
        data: dto,
      });
    } catch (error: any) {
      this.logger.error('readMessage error:', error.message);
      socket.emit('readMessageResponse', {
        success: false,
        error: error.message || 'Error marking message as read',
      });
    }
  }

  @SubscribeMessage('editMessage')
  async editMessage(
    @MessageBody() payload: EditDeleteDto,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const dto = await this.validatePayload(payload, EditDeleteDto);
      if (!dto.contenido || dto.contenido.trim() === '') {
        throw new BadRequestException('Contenido requerido para editar mensaje');
      }
      await this.comunicacionesService.editMessage(
        dto.mensajeId,
        dto.remitenteId,
        dto.contenido,
      );
      this.server.to(`canal_${dto.canalId}`).emit('messageEdited', dto);
      socket.emit('editMessageResponse', {
        success: true,
        data: dto,
      });
    } catch (error: any) {
      this.logger.error('editMessage error:', error.message);
      socket.emit('editMessageResponse', {
        success: false,
        error: error.message || 'Error editing message',
      });
    }
  }

  @SubscribeMessage('deleteMessage')
  async deleteMessage(
    @MessageBody() payload: EditDeleteDto,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const dto = await this.validatePayload(payload, EditDeleteDto);
      await this.comunicacionesService.deleteMessage(
        dto.mensajeId,
        dto.remitenteId,
      );
      this.server.to(`canal_${dto.canalId}`).emit('messageDeleted', dto);
      socket.emit('deleteMessageResponse', {
        success: true,
        data: dto,
      });
    } catch (error: any) {
      this.logger.error('deleteMessage error:', error);
      socket.emit('deleteMessageResponse', {
        success: false,
        error: error.message || 'Error deleting message',
      });
    }
  }
}
