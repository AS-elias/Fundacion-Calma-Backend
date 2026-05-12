import {
  IsInt,
  Min,
  IsOptional,
  IsString,
  IsBoolean,
  IsUrl,
} from 'class-validator';

export class UpdateChannelDto {
  @IsInt()
  @Min(1)
  canalId!: number;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @IsBoolean()
  esGrupo?: boolean;
}
