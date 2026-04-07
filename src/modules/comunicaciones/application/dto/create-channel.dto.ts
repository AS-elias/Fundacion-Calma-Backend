import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
  Min,
} from 'class-validator';

export class CreateChannelDto {
  @IsString()
  nombre!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  areaId?: number;

  @IsOptional()
  @IsBoolean()
  esGrupo?: boolean;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  participanteIds!: number[];

  @IsInt()
  @Min(1)
  creadorId!: number;
}
