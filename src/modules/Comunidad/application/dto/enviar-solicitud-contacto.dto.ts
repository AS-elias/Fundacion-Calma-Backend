import { IsNumber, IsNotEmpty } from 'class-validator';

export class EnviarSolicitudContactoDto {
  @IsNumber()
  @IsNotEmpty()
  contactoId!: number;
}
