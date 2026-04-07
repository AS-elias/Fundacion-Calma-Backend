import { IsInt, Min } from 'class-validator';

export class ReadReceiptDto {
  @IsInt()
  @Min(1)
  canalId!: number;

  @IsInt()
  @Min(1)
  mensajeId!: number;

  @IsInt()
  @Min(1)
  usuarioId!: number;
}
