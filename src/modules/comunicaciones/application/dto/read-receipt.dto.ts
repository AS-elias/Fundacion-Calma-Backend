import { IsInt, Min, IsOptional } from 'class-validator';

export class ReadReceiptDto {
  @IsInt()
  @Min(1)
  canalId!: number;

  @IsInt()
  @Min(0)
  mensajeId!: number;

  @IsOptional()
  @IsInt()
  usuarioId?: number;
}
