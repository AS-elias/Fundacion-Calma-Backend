import { IsInt, Min, IsString, IsNotEmpty } from 'class-validator';

export class ReactionDto {
  @IsInt()
  @Min(1)
  mensajeId!: number;

  @IsInt()
  @Min(1)
  usuarioId!: number;

  @IsString()
  @IsNotEmpty()
  emoji!: string;

  @IsInt()
  @Min(1)
  canalId!: number;
}
