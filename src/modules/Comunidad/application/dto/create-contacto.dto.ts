import { IsNumber, IsNotEmpty } from 'class-validator';

export class AddContactoDto {
  @IsNumber()
  @IsNotEmpty()
  usuarioId: number;
}
