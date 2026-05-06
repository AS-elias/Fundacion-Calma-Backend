import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class JoinChannelDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  canalId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  usuarioId!: number;
}
