import { IsInt, Min, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class EditDeleteDto {
  @IsInt()
  @Min(1)
  canalId!: number;

  @IsInt()
  @Min(1)
  mensajeId!: number;

  @IsOptional()
  @IsInt()
  remitenteId?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  contenido?: string;
}
