import { IsInt, Min, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class MessageDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  canalId!: number;

  @Type(() => Number)
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
