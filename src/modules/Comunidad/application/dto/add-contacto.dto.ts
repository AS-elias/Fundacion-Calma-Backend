import { IsNumber } from 'class-validator';

export class AddContactoDto {
  @IsNumber()
  contactoId!: number;
}
