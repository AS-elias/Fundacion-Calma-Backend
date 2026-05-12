import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateChannelDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  areaId?: number;

  @IsOptional()
  @IsBoolean()
  esGrupo?: boolean;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @Type(() => Number)
  participanteIds!: number[];

  @IsInt()
  @Min(1)
  creadorId!: number;
}
