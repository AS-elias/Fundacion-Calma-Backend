export const COMUNICACIONES_REPOSITORY = 'COMUNICACIONES_REPOSITORY';

export interface CanalData {
  nombre: string;
  areaId?: number;
  esGrupo?: boolean;
  descripcion?: string;
  avatarUrl?: string;
  creadorId: number;
  participanteIds: number[];
}

export interface MensajeData {
  canalId: number;
  remitenteId: number;
  contenido?: string;
  tipo?:
    | 'text'
    | 'image'
    | 'file'
    | 'sticker'
    | 'call'
    | 'call_missed'
    | 'call_answered'
    | 'call_ended';
  archivoUrl?: string | null;
}

export interface ReactionData {
  mensajeId: number;
  usuarioId: number;
  emoji: string;
}

export interface ComunicacionesRepository {
  createChannel(data: CanalData): Promise<any>;
  updateChannel(canalId: number, data: Partial<CanalData>): Promise<any>;
  getChannelInfo(canalId: number): Promise<any>;
  addParticipant(
    canalId: number,
    usuarioId: number,
    actorId: number,
  ): Promise<any>;
  removeParticipant(
    canalId: number,
    usuarioId: number,
    actorId: number,
  ): Promise<any>;
  isParticipant(canalId: number, usuarioId: number): Promise<boolean>;
  saveMessage(data: MensajeData): Promise<any>;
  getRecentMessages(
    canalId: number,
    usuarioId: number,
    limit?: number,
  ): Promise<any[]>;
  getUserChannels(usuarioId: number): Promise<any[]>;
  markAsRead(mensajeId: number, usuarioId: number): Promise<any>;
  editMessage(
    mensajeId: number,
    remitenteId: number,
    contenido: string,
  ): Promise<any>;
  deleteMessage(mensajeId: number, remitenteId: number): Promise<any>;
  deleteMessageForMe(mensajeId: number, usuarioId: number): Promise<any>;
  deleteMessageForAll(mensajeId: number, remitenteId: number): Promise<any>;
  deleteChannel(canalId: number, usuarioId: number): Promise<any>;
  addReaction(reaction: ReactionData): Promise<any>;
  removeReaction(
    mensajeId: number,
    usuarioId: number,
    emoji: string,
  ): Promise<any>;
  getReactions(mensajeId: number): Promise<any[]>;
  getReactionCount(mensajeId: number, emoji: string): Promise<number>;
  makeAdmin(canalId: number, usuarioId: number, actorId: number): Promise<any>;
  removeAdmin(
    canalId: number,
    usuarioId: number,
    actorId: number,
  ): Promise<any>;
}
