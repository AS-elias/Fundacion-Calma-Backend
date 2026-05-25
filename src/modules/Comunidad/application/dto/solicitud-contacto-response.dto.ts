export class SolicitudContactoResponseDto {
  id!: number;
  usuarioId!: number;
  contactoId!: number;
  estado!: 'pendiente' | 'aceptado' | 'rechazado';
  fechaCreacion!: Date;
  fechaActualizado!: Date;
  usuarioSolicitante?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    fotUrl?: string;
  };
  usuarioContacto?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    fotUrl?: string;
  };
}
