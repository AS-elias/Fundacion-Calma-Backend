import { IsInt, Min, IsString, IsOptional } from 'class-validator';

export class MessageDto {
  @IsInt()
  @Min(1)
  canalId!: number;

  @IsInt()
  @Min(1)
  remitenteId!: number;

  @IsOptional()
  @IsString()
  contenido?: string;

  @IsOptional()
  @IsString()
  tipo?: 'text' | 'image' | 'file' | 'sticker';

  @IsOptional()
  @IsString()
  archivoUrl?: string;
}
