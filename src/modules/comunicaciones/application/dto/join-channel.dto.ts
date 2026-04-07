import { IsInt, Min } from 'class-validator';

export class JoinChannelDto {
  @IsInt()
  @Min(1)
  canalId!: number;

  @IsInt()
  @Min(1)
  usuarioId!: number;
}
