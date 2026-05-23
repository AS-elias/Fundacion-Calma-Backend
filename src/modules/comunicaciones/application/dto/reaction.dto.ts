import { IsInt, Min, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ReactionDto {
  @IsInt()
  @Min(1)
  mensajeId!: number;

  @IsOptional()
  @IsInt()
  usuarioId?: number;

  @IsString()
  @IsNotEmpty()
  emoji!: string;

  @IsInt()
  @Min(1)
  canalId!: number;
}
