import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCarpetaDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  bloqueId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  padreId?: number;

  @IsNotEmpty()
  @IsString()
  nombre: string;
}
