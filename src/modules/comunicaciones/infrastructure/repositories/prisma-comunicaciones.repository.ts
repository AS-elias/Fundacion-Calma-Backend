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
        const participantes = Array.from(
            new Set([...data.participanteIds, data.creadorId]),
        );
        const esChatDirecto = participantes.length === 2 && data.esGrupo !== true;

        if (esChatDirecto) {
            const candidates = await this.prisma.canales.findMany({
                where: {
                    es_grupo: false,
                    participantes_canal: {
                        some: {
                            usuario_id: { in: participantes },
                        },
                    },
                },
                include: { participantes_canal: true },
            });

            const sortedParticipants = participantes.slice().sort((a, b) => a - b);
            const existing = candidates.find((canal) => {
                const channelUsers = canal.participantes_canal
                    .map((p) => p.usuario_id)
                    .sort((a, b) => a - b);
                return (
                    channelUsers.length === sortedParticipants.length &&
                    channelUsers.every((id, index) => id === sortedParticipants[index])
                );
            });

            if (existing) {
                return existing;
            }
        }

        return this.prisma.$transaction(async (tx) => {
            const canal = await tx.canales.create({
                data: {
                    nombre: data.nombre,
                    area_id: data.areaId ?? null,
                    es_grupo: esChatDirecto ? false : data.esGrupo ?? true,
                    descripcion: data.descripcion,
                    avatar_url: data.avatarUrl,
                },
            });

            if (participantes.length > 0) {
                await tx.participantes_canal.createMany({
                    data: participantes.map((usuarioId) => ({
                        canal_id: canal.id,
                        usuario_id: usuarioId,
                        es_admin: usuarioId === data.creadorId,
                    })),
                    skipDuplicates: true,
                });
            }

            return canal;
        });
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

    async addParticipant(canalId: number, usuarioId: number, actorId: number) {
        const actor = await this.prisma.participantes_canal.findFirst({
            where: { canal_id: canalId, usuario_id: actorId },
        });
        if (!actor || !actor.es_admin) {
            throw new Error('No tienes permisos para agregar participantes a este grupo');
        }

        return this.prisma.participantes_canal.create({
            data: { canal_id: canalId, usuario_id: usuarioId },
        });
    }

    async removeParticipant(canalId: number, usuarioId: number, actorId: number) {
        // Un usuario siempre puede eliminarse a sí mismo (salir del grupo)
        if (usuarioId !== actorId) {
            const actor = await this.prisma.participantes_canal.findFirst({
                where: { canal_id: canalId, usuario_id: actorId },
            });
            if (!actor || !actor.es_admin) {
                throw new Error('No tienes permisos para eliminar a otros participantes');
            }
        }

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
        const result = await this.prisma.participantes_canal.findMany({
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
                        _count: {
                            select: {
                                mensajes: {
                                    where: {
                                        leido: false,
                                        emisor_id: { not: usuarioId },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        return result.map(pc => {
            const { _count, ...canalData } = pc.canales;
            return {
                ...pc,
                canales: {
                    ...canalData,
                    unreadCount: _count?.mensajes || 0,
                },
            };
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

    async deleteChannel(canalId: number) {
        return this.prisma.canales.delete({
            where: { id: canalId },
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

    async makeAdmin(canalId: number, usuarioId: number, actorId: number) {
        // Verificar que el actor es admin del canal
        const actor = await this.prisma.participantes_canal.findFirst({
            where: { canal_id: canalId, usuario_id: actorId },
        });
        if (!actor || !actor.es_admin) {
            throw new Error('No tienes permisos para hacer admin a otros usuarios');
        }

        return this.prisma.participantes_canal.update({
            where: {
                canal_id_usuario_id: {
                    canal_id: canalId,
                    usuario_id: usuarioId,
                },
            },
            data: { es_admin: true },
            include: { usuarios: true },
        });
    }

    async removeAdmin(canalId: number, usuarioId: number, actorId: number) {
        // Verificar que el actor es admin del canal antes de que pueda quitar permisos a otros
        const actor = await this.prisma.participantes_canal.findFirst({
            where: { canal_id: canalId, usuario_id: actorId },
        });
        
        if (!actor || !actor.es_admin) {
            throw new Error('No tienes permisos para quitar el administrador a otros usuarios');
        }

        return this.prisma.participantes_canal.update({
            where: {
                canal_id_usuario_id: { canal_id: canalId, usuario_id: usuarioId },
            },
            data: { es_admin: false },
            include: { usuarios: true },
        });
    }
}
