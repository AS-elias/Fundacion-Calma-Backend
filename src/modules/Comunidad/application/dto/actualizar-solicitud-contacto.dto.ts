import { IsString, IsIn, IsNotEmpty } from 'class-validator';

export class ActualizarSolicitudContactoDto {
    @IsString()
    @IsNotEmpty()
    @IsIn(['aceptado', 'rechazado'])
    estado!: 'aceptado' | 'rechazado';
}
