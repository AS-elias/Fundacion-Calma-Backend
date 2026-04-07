import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import {
    ComunicacionesRepository,
    CanalData,
    MensajeData,
    ReactionData,
} from '../../domain/repositories/comunicaciones.repository';

@Injectable()
export class PrismaComunicacionesRepository implements ComunicacionesRepository {
    constructor(private readonly prisma: PrismaService) { }

    async createChannel(data: CanalData) {
        const canal = await this.prisma.canales.create({
            data: {
                nombre: data.nombre,
                area_id: data.areaId ?? null,
                es_grupo: data.esGrupo ?? true,
                descripcion: data.descripcion,
                avatar_url: data.avatarUrl,
            },
        });

        const participantes = Array.from(
            new Set([...data.participanteIds, data.creadorId]),
        );
        if (participantes.length > 0) {
            await this.prisma.participantes_canal.createMany({
                data: participantes.map((usuarioId) => ({
                    canal_id: canal.id,
                    usuario_id: usuarioId,
                })),
                skipDuplicates: true,
            });
        }

        return canal;
    }

    async updateChannel(canalId: number, data: Partial<CanalData>) {
        return this.prisma.canales.update({
            where: { id: canalId },
            data: {
                nombre: data.nombre,
                area_id: data.areaId ?? undefined,
                es_grupo: data.esGrupo,
                descripcion: data.descripcion,
                avatar_url: data.avatarUrl,
            },
        });
    }

    async getChannelInfo(canalId: number) {
        return this.prisma.canales.findUnique({
            where: { id: canalId },
            include: {
                participantes_canal: { include: { usuarios: true } },
                mensajes: {
                    orderBy: { creado_at: 'desc' },
                    take: 1,
                    include: { usuarios: true },
                },
            },
        });
    }

    async addParticipant(canalId: number, usuarioId: number) {
        return this.prisma.participantes_canal.create({
            data: { canal_id: canalId, usuario_id: usuarioId },
        });
    }

    async removeParticipant(canalId: number, usuarioId: number) {
        return this.prisma.participantes_canal.deleteMany({
            where: { canal_id: canalId, usuario_id: usuarioId },
        });
    }

    async isParticipant(canalId: number, usuarioId: number) {
        const participante = await this.prisma.participantes_canal.findFirst({
            where: { canal_id: canalId, usuario_id: usuarioId },
        });
        return Boolean(participante);
    }

    async saveMessage(data: MensajeData) {
        return this.prisma.mensajes.create({
            data: {
                canal_id: data.canalId,
                emisor_id: data.remitenteId,
                contenido: data.contenido ?? '',
                archivo_url: data.archivoUrl ?? null,
                tipo: data.tipo ?? 'text',
            },
        });
    }

    async getRecentMessages(canalId: number, limit = 50) {
        return this.prisma.mensajes.findMany({
            where: { canal_id: canalId },
            orderBy: { creado_at: 'desc' },
            take: limit,
            include: { usuarios: true },
        });
    }

    async getUserChannels(usuarioId: number) {
        return this.prisma.participantes_canal.findMany({
            where: { usuario_id: usuarioId },
            include: {
                canales: {
                    include: {
                        participantes_canal: { include: { usuarios: true } },
                        mensajes: {
                            orderBy: { creado_at: 'desc' },
                            take: 1,
                            include: { usuarios: true },
                        },
                    },
                },
            },
        });
    }

    async markAsRead(mensajeId: number, usuarioId: number) {
        return this.prisma.mensajes.updateMany({
            where: { id: mensajeId, emisor_id: usuarioId },
            data: { leido: true },
        });
    }

    async editMessage(mensajeId: number, remitenteId: number, contenido: string) {
        return this.prisma.mensajes.updateMany({
            where: { id: mensajeId, emisor_id: remitenteId },
            data: { contenido },
        });
    }

    async deleteMessage(mensajeId: number, remitenteId: number) {
        return this.prisma.mensajes.deleteMany({
            where: { id: mensajeId, emisor_id: remitenteId },
        });
    }

    async addReaction(reaction: ReactionData) {
        return this.prisma.reacciones_mensaje.create({
            data: {
                mensaje_id: reaction.mensajeId,
                usuario_id: reaction.usuarioId,
                emoji: reaction.emoji,
            },
        });
    }

    async removeReaction(mensajeId: number, usuarioId: number, emoji: string) {
        return this.prisma.reacciones_mensaje.deleteMany({
            where: { mensaje_id: mensajeId, usuario_id: usuarioId, emoji },
        });
    }

    async getReactions(mensajeId: number) {
        return this.prisma.reacciones_mensaje.findMany({
            where: { mensaje_id: mensajeId },
            include: { usuarios: true },
        });
    }
}
