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
import { PresenceService } from '../../../../core/services/presence.service';

import { NotificacionSistemaService } from '../../../notificaciones/application/services/notificacion-sistema.service';

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
  private activeCallTimeouts = new Map<string, NodeJS.Timeout>(); // Track call timeouts

  constructor(
    private readonly comunicacionesService: ComunicacionesService, 
    private readonly presenceService: PresenceService,
    private readonly notificacionSistema: NotificacionSistemaService,
  ) { }

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
      payload.sub = Number(payload.sub); // Parse as Number to prevent bugs
      socket.data.user = payload;
      this.presenceService.addUser(payload.sub);
      socket.join(`user_${payload.sub}`); // Join to user-specific room for WebRTC signaling

      // Auto-join all channel rooms so the socket receives newMessage events
      // from every channel regardless of which screen the user is on
      const canalesDelUsuario = await this.comunicacionesService.getUserChannels(payload.sub);
      for (const participacion of canalesDelUsuario) {
        socket.join(`canal_${participacion.canal_id}`);
      }

      this.server.emit('userOnline', { usuarioId: payload.sub });
      this.logger.log(
        `Socket conectado: ${socket.id}, usuario: ${payload.sub} (${canalesDelUsuario.length} canales)`,
      );
    } catch (err: any) {
      this.logger.warn(`Conexión rechazada: ${socket.id} -> ${err.message}`);
      socket.emit('unauthorized', { message: err.message || 'Token inválido' });
      socket.disconnect(true);
    }
  }

  handleDisconnect(socket: Socket) {
    if (socket.data.user) {
      this.presenceService.removeUser(socket.data.user.sub);
      this.server.emit('userOffline', { usuarioId: socket.data.user.sub });
    }
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
  ) {
    try {
      this.logger.log('createChannel - iniciando');
      const dto = await this.validatePayload(payload, CreateChannelDto);
      const canal = await this.comunicacionesService.createChannel(dto);

      const connectedUsers = Array.from(this.presenceService.getConnectedUsers() || []);

      this.server.emit('channelCreated', {
        canalId: canal.id,
        nombre: canal.nombre,
        esGrupo: canal.es_grupo,
      });

      return {
        success: true,
        data: {
          canalId: canal.id,
          nombre: canal.nombre,
          descripcion: canal.descripcion,
          avatarUrl: canal.avatar_url,
          esGrupo: canal.es_grupo,
          participantes: canal.participantes_canal?.map(pc => ({
            usuarioId: pc.usuario_id,
            nombre: pc.usuarios?.nombre_completo,
            avatar: pc.usuarios?.foto_url,
            esAdmin: pc.es_admin ?? false,
            isOnline: connectedUsers.includes(pc.usuario_id),
          })) ?? [],
        },
      };
    } catch (error: any) {
      this.logger.error('createChannel error:', error.message);
      return {
        success: false,
        error: error.message || 'Error creating channel',
      };
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
      const actorId = socket.data.user.sub; // Obtenemos el usuario que hace la petición
      const dto = await this.validatePayload(payload, JoinChannelDto);
      await this.comunicacionesService.addParticipant(dto.canalId, dto.usuarioId, actorId);
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
      const actorId = socket.data.user.sub; // Obtenemos el usuario que hace la petición
      const dto = await this.validatePayload(payload, JoinChannelDto);
      await this.comunicacionesService.removeParticipant(
        dto.canalId,
        dto.usuarioId,
        actorId
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

  @SubscribeMessage('deleteChannel')
  async deleteChannel(
    @MessageBody() payload: JoinChannelDto,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const dto = await this.validatePayload(payload, JoinChannelDto);
      const usuarioId = socket.data.user.sub;
      await this.comunicacionesService.deleteChannel(dto.canalId, usuarioId);
      const room = `canal_${dto.canalId}`;
      socket.leave(room);
      this.server.to(room).emit('channelDeleted', { canalId: dto.canalId });
      socket.emit('deleteChannelResponse', {
        success: true,
        data: { canalId: dto.canalId },
      });
    } catch (error: any) {
      this.logger.error('deleteChannel error:', error.message);
      socket.emit('deleteChannelResponse', {
        success: false,
        error: error.message || 'Error deleting channel',
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
      // IMPORTANTE: Usar el ID del usuario autenticado, NO el del payload del cliente
      const usuarioId = socket.data.user.sub;
      
      const isParticipant = await this.comunicacionesService.isParticipant(
        dto.canalId,
        usuarioId,
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
        remitenteId: usuarioId,
        contenido: dto.contenido ?? '',
        tipo: dto.tipo ?? 'text',
        archivoUrl: dto.archivoUrl,
      });
      const response = {
        id: mensaje.id,
        canalId: dto.canalId,
        remitenteId: usuarioId,
        contenido: dto.contenido,
        tipo: dto.tipo || 'text',
        archivoUrl: dto.archivoUrl,
        creadoAt: mensaje.creado_at,
      };

      this.server.to(`canal_${dto.canalId}`).emit('newMessage', response);
      socket.emit('sendMessageResponse', { success: true, data: response });

      // Notify other participants
      try {
        const canalInfo = await this.comunicacionesService.getChannelInfo(dto.canalId);
        if (canalInfo && canalInfo.participantes_canal) {
          const senderName = socket.data.user?.nombre || 'Un usuario';
          const titulo = 'Nuevo mensaje';
          const descripcion = `Tienes un nuevo mensaje en ${canalInfo.nombre || 'el chat'}`;
          
          canalInfo.participantes_canal.forEach(p => {
            if (p.usuario_id !== usuarioId) {
              this.notificacionSistema.registrar(
                titulo,
                descripcion,
                {
                  apartado: 'Comunicaciones',
                  accion: 'Nuevo mensaje recibido',
                  usuarioId: p.usuario_id,
                }
              ).catch(e => this.logger.warn(`Failed to notify user ${p.usuario_id}: ${e.message}`));
            }
          });
        }
      } catch (notifyErr) {
        this.logger.warn(`Could not send notifications for new message: ${notifyErr}`);
      }
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
      const usuarioId = socket.data.user?.sub;
      const mensajes = await this.comunicacionesService.getRecentMessages(
        canalesDto.canalId,
        usuarioId,
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
      const connectedUsers = Array.from(this.presenceService.getConnectedUsers() || []);

      const result = canales.map((p: any) => ({
        canalId: p.canal_id,
        nombre: p.canales?.nombre,
        descripcion: p.canales?.descripcion,
        avatarUrl: p.canales?.avatar_url,
        esGrupo: p.canales?.es_grupo,
        unreadCount: p.canales?.unreadCount ?? 0,
        totalParticipantes: p.canales?.participantes_canal?.length ?? 0,
        participantes:
          p.canales?.participantes_canal.map((pc) => ({
            usuarioId: pc.usuario_id,
            nombre: pc.usuarios?.nombre_completo,
            avatar: pc.usuarios?.foto_url,
            esAdmin: pc.es_admin ?? false,
            isOnline: connectedUsers.includes(pc.usuario_id),
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

      const connectedUsers = Array.from(this.presenceService.getConnectedUsers() || []);

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
            esAdmin: p.es_admin ?? false,
            isOnline: connectedUsers.includes(p.usuario_id),
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
      const usuarioId = socket.data.user.sub; // Usar usuario autenticado
      await this.comunicacionesService.markAsRead(dto.mensajeId, usuarioId);
      this.server.to(`canal_${dto.canalId}`).emit('messageRead', { ...dto, usuarioId });
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

  @SubscribeMessage('reactToMessage')
  async reactToMessage(
    @MessageBody() payload: ReactionDto,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const dto = await this.validatePayload(payload, ReactionDto);
      const usuarioId = socket.data.user.sub;
      
      // Obtener todas las reacciones del mensaje
      const existingReactions = await this.comunicacionesService.getReactions(dto.mensajeId);
      
      // IMPORTANTE: Buscar si el usuario ya reaccionó a este mensaje (sin importar el emoji viejo)
      const userReaction = existingReactions.find((r: any) => r.usuario_id === usuarioId);
      if (userReaction) {
        if (userReaction.emoji === dto.emoji) {
          // Caso B: Toggle off (el usuario le dio click al MISMO emoji para quitarlo)
          await this.comunicacionesService.removeReaction(dto.mensajeId, usuarioId, dto.emoji);
          
          const count = await this.comunicacionesService.getReactionCount(dto.mensajeId, dto.emoji);
          this.server.to(`canal_${dto.canalId}`).emit('messageReacted', {
            mensajeId: dto.mensajeId,
            usuarioId: usuarioId,
            emoji: dto.emoji,
            count: count
          });
        } else {
          // Caso C: Cambiar reacción (el usuario tenía un emoji y eligió uno NUEVO)
          const oldEmoji = userReaction.emoji;
          
          // Borrar reacción vieja y guardar la nueva
          await this.comunicacionesService.removeReaction(dto.mensajeId, usuarioId, oldEmoji);
          await this.comunicacionesService.addReaction({ ...dto, usuarioId });
          
          // Disparar evento para RESTAR el emoji viejo
          const oldCount = await this.comunicacionesService.getReactionCount(dto.mensajeId, oldEmoji);
          this.server.to(`canal_${dto.canalId}`).emit('messageReacted', {
            mensajeId: dto.mensajeId,
            usuarioId: usuarioId,
            emoji: oldEmoji,
            count: oldCount
          });
          
          // Disparar evento para SUMAR el emoji nuevo
          const newCount = await this.comunicacionesService.getReactionCount(dto.mensajeId, dto.emoji);
          this.server.to(`canal_${dto.canalId}`).emit('messageReacted', {
            mensajeId: dto.mensajeId,
            usuarioId: usuarioId,
            emoji: dto.emoji,
            count: newCount
          });
        }
      } else {
        // Caso A: Toggle on (el usuario no tenía ninguna reacción)
        await this.comunicacionesService.addReaction({ ...dto, usuarioId });
        
        const count = await this.comunicacionesService.getReactionCount(dto.mensajeId, dto.emoji);
        this.server.to(`canal_${dto.canalId}`).emit('messageReacted', {
          mensajeId: dto.mensajeId,
          usuarioId: usuarioId,
          emoji: dto.emoji,
          count: count
        });
      }
      socket.emit('reactToMessageResponse', { success: true });
    } catch (error: any) {
      this.logger.error('reactToMessage error:', error.message);
      socket.emit('reactToMessageResponse', {
        success: false,
        error: error.message || 'Error reacting to message',
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
      const usuarioId = socket.data.user.sub; // Usar usuario autenticado
      await this.comunicacionesService.editMessage(
        dto.mensajeId,
        usuarioId,
        dto.contenido,
      );
      this.server.to(`canal_${dto.canalId}`).emit('messageEdited', { ...dto, remitenteId: usuarioId });
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
      const usuarioId = socket.data.user.sub; // Usar usuario autenticado
      await this.comunicacionesService.deleteMessage(
        dto.mensajeId,
        usuarioId,
      );
      this.server.to(`canal_${dto.canalId}`).emit('messageDeleted', { ...dto, remitenteId: usuarioId });
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

  @SubscribeMessage('makeAdmin')
  async makeAdmin(
    @MessageBody() payload: { canalId: number; usuarioId: number },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const actorId = socket.data.user.sub; // El ID del usuario autenticado que realiza la acción
      
      // Llamamos al servicio para actualizar el registro en la BD
      await this.comunicacionesService.makeAdmin(payload.canalId, payload.usuarioId, actorId);
      
      // Emitimos al canal que este usuario ahora es administrador
      this.server.to(`canal_${payload.canalId}`).emit('adminMade', {
        canalId: payload.canalId,
        usuarioId: payload.usuarioId,
        hechoPorId: actorId
      });
      
      socket.emit('makeAdminResponse', { success: true, data: payload });
    } catch (error: any) {
      this.logger.error('makeAdmin error:', error.message);
      socket.emit('makeAdminResponse', {
        success: false,
        error: error.message || 'Error making user admin',
      });
    }
  }

  @SubscribeMessage('removeAdmin')
  async removeAdmin(
    @MessageBody() payload: { canalId: number; usuarioId: number },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const actorId = socket.data.user.sub; // Usuario autenticado
      
      await this.comunicacionesService.removeAdmin(payload.canalId, payload.usuarioId, actorId);
      
      // Notificamos al canal sobre el retiro de permisos
      this.server.to(`canal_${payload.canalId}`).emit('adminRemoved', {
        canalId: payload.canalId,
        usuarioId: payload.usuarioId,
        hechoPorId: actorId
      });
      
      socket.emit('removeAdminResponse', { success: true, data: payload });
    } catch (error: any) {
      this.logger.error('removeAdmin error:', error.message);
      socket.emit('removeAdminResponse', {
        success: false,
        error: error.message || 'Error removing admin',
      });
    }
  }

  @SubscribeMessage('getConnectedUsers')
  getConnectedUsers() {
    return { connectedUsers: this.presenceService.getConnectedUsers() };
  }

  // WebRTC Signaling Events
  @SubscribeMessage('callOffer')
  async callOffer(
    @MessageBody() payload: { targetUserId: number; fromUserId: number; fromName: string; callType: 'voice' | 'video'; offer: any; canalId?: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const usuarioId = socket.data.user.sub; // Usar usuario autenticado, no payload.fromUserId
    const enhancedPayload = {
      ...payload,
      fromUserId: usuarioId, // Sobrescribir con el usuario autenticado
      timestamp: new Date().toISOString(),
      callId: `${usuarioId}_${payload.targetUserId}_${Date.now()}`, // Unique call ID
    };

    // Register call in chat if canalId is provided
    if (payload.canalId) {
      try {
        await this.comunicacionesService.saveMessage({
          canalId: payload.canalId,
          remitenteId: usuarioId,
          contenido: `Se inició una llamada ${payload.callType}`,
          tipo: 'call',
          archivoUrl: null,
        });
      } catch (err) {
        this.logger.warn(`Error saving call message: ${err}`);
      }
    }

    // Set 10-second timeout for call response
    const timeoutId = setTimeout(() => {
      this.activeCallTimeouts.delete(enhancedPayload.callId);
      this.server.to(`user_${payload.targetUserId}`).emit('callRejected', {
        callId: enhancedPayload.callId,
        reason: 'No answer - timeout after 10 seconds',
      });
      this.server.to(`user_${usuarioId}`).emit('callRejected', {
        callId: enhancedPayload.callId,
        reason: 'Recipient did not answer',
      });

      // Register timeout in chat
      if (payload.canalId) {
        try {
          this.comunicacionesService.saveMessage({
            canalId: payload.canalId,
            remitenteId: usuarioId,
            contenido: `Llamada ${payload.callType} no respondida`,
            tipo: 'call_missed',
            archivoUrl: null,
          }).catch(err => this.logger.warn(`Error saving missed call: ${err}`));
        } catch (err) {
          this.logger.warn(`Error in missed call timeout: ${err}`);
        }
      }
    }, 10000); // 10 seconds

    this.activeCallTimeouts.set(enhancedPayload.callId, timeoutId);

    this.server.to(`user_${payload.targetUserId}`).emit('callOffer', enhancedPayload);
    socket.emit('callOfferSent', { success: true, callId: enhancedPayload.callId });
  }

  @SubscribeMessage('callAnswer')
  async callAnswer(
    @MessageBody() payload: { targetUserId: number; fromUserId: number; callId: string; answer: any; canalId?: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const usuarioId = socket.data.user.sub; // Usar usuario autenticado
    
    // Clear timeout since call was answered
    const timeoutId = this.activeCallTimeouts.get(payload.callId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.activeCallTimeouts.delete(payload.callId);
    }

    // Register answered call in chat
    if (payload.canalId) {
      try {
        await this.comunicacionesService.saveMessage({
          canalId: payload.canalId,
          remitenteId: usuarioId,
          contenido: `Respondió a la llamada`,
          tipo: 'call_answered',
          archivoUrl: null,
        });
      } catch (err) {
        this.logger.warn(`Error saving answered call message: ${err}`);
      }
    }

    const enhancedPayload = {
      ...payload,
      fromUserId: usuarioId, // Sobrescribir con usuario autenticado
      timestamp: new Date().toISOString(),
    };
    this.server.to(`user_${payload.targetUserId}`).emit('callAnswer', enhancedPayload);
    socket.emit('callAnswerSent', { success: true });
  }

  @SubscribeMessage('iceCandidate')
  async iceCandidate(
    @MessageBody() payload: { targetUserId: number; fromUserId: number; callId: string; candidate: any },
    @ConnectedSocket() socket: Socket,
  ) {
    const usuarioId = socket.data.user.sub; // Usar usuario autenticado
    const enhancedPayload = {
      ...payload,
      fromUserId: usuarioId, // Sobrescribir con usuario autenticado
      timestamp: new Date().toISOString(),
    };
    this.server.to(`user_${payload.targetUserId}`).emit('iceCandidate', enhancedPayload);
  }

  @SubscribeMessage('endCall')
  async endCall(
    @MessageBody() payload: { targetUserId: number; fromUserId: number; callId: string; canalId?: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const usuarioId = socket.data.user.sub; // Usar usuario autenticado
    
    // Clear timeout if still active
    const timeoutId = this.activeCallTimeouts.get(payload.callId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.activeCallTimeouts.delete(payload.callId);
    }

    // Register call end in chat
    if (payload.canalId) {
      try {
        await this.comunicacionesService.saveMessage({
          canalId: payload.canalId,
          remitenteId: usuarioId,
          contenido: `Finalizó la llamada`,
          tipo: 'call_ended',
          archivoUrl: null,
        });
      } catch (err) {
        this.logger.warn(`Error saving call end message: ${err}`);
      }
    }

    const enhancedPayload = {
      ...payload,
      fromUserId: usuarioId, // Sobrescribir con usuario autenticado
      timestamp: new Date().toISOString(),
    };
    this.server.to(`user_${payload.targetUserId}`).emit('endCall', enhancedPayload);
    socket.emit('callEnded', { success: true, callId: payload.callId });
  }
}
