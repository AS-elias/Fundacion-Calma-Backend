import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { COMUNICACIONES_REPOSITORY } from '../../domain/repositories/comunicaciones.repository';
import type {
  CanalData,
  ComunicacionesRepository,
  MensajeData,
  ReactionData,
} from '../../domain/repositories/comunicaciones.repository';

@Injectable()
export class ComunicacionesService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(COMUNICACIONES_REPOSITORY)
    private readonly repo: ComunicacionesRepository,
  ) {}

  verifyToken(token: string) {
    if (!token) throw new UnauthorizedException('Token no enviado');
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'your-secret-key',
      });
    } catch (err) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  async createChannel(data: CanalData) {
    return this.repo.createChannel(data);
  }

  async updateChannel(canalId: number, data: Partial<CanalData>) {
    return this.repo.updateChannel(canalId, data);
  }

  async getChannelInfo(canalId: number) {
    return this.repo.getChannelInfo(canalId);
  }

  async addParticipant(canalId: number, usuarioId: number, actorId: number) {
    return this.repo.addParticipant(canalId, usuarioId, actorId);
  }

  async removeParticipant(canalId: number, usuarioId: number, actorId: number) {
    return this.repo.removeParticipant(canalId, usuarioId, actorId);
  }

  async isParticipant(canalId: number, usuarioId: number) {
    return this.repo.isParticipant(canalId, usuarioId);
  }

  async saveMessage(data: MensajeData) {
    return this.repo.saveMessage(data);
  }

  async getRecentMessages(canalId: number, usuarioId: number, limit?: number) {
    return this.repo.getRecentMessages(canalId, usuarioId, limit);
  }

  async getUserChannels(usuarioId: number) {
    return this.repo.getUserChannels(usuarioId);
  }

  async markAsRead(mensajeId: number, usuarioId: number) {
    return this.repo.markAsRead(mensajeId, usuarioId);
  }

  async editMessage(mensajeId: number, remitenteId: number, contenido: string) {
    return this.repo.editMessage(mensajeId, remitenteId, contenido);
  }

  async deleteMessage(mensajeId: number, remitenteId: number) {
    return this.repo.deleteMessage(mensajeId, remitenteId);
  }

  async deleteMessageForMe(mensajeId: number, usuarioId: number) {
    return this.repo.deleteMessageForMe(mensajeId, usuarioId);
  }

  async deleteMessageForAll(mensajeId: number, remitenteId: number) {
    return this.repo.deleteMessageForAll(mensajeId, remitenteId);
  }

  async addReaction(reaction: ReactionData) {
    return this.repo.addReaction(reaction);
  }

  async removeReaction(mensajeId: number, usuarioId: number, emoji: string) {
    return this.repo.removeReaction(mensajeId, usuarioId, emoji);
  }

  async getReactions(mensajeId: number) {
    return this.repo.getReactions(mensajeId);
  }

  async getReactionCount(mensajeId: number, emoji: string) {
    return this.repo.getReactionCount(mensajeId, emoji);
  }

  async deleteChannel(canalId: number, usuarioId: number) {
    return this.repo.deleteChannel(canalId, usuarioId);
  }

  async makeAdmin(canalId: number, usuarioId: number, actorId: number) {
    return this.repo.makeAdmin(canalId, usuarioId, actorId);
  }

  async removeAdmin(canalId: number, usuarioId: number, actorId: number) {
    return this.repo.removeAdmin(canalId, usuarioId, actorId);
  }
}
