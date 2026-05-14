import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSalaDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  area!: string;

  @IsString()
  @IsNotEmpty()
  link!: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsOptional()
  creador_id?: number;
}