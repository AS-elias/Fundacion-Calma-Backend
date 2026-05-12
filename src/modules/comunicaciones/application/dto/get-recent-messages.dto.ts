import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetRecentMessagesDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  canalId!: number;
}
