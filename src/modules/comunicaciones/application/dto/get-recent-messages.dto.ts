import { IsInt, Min } from 'class-validator';

export class GetRecentMessagesDto {
  @IsInt()
  @Min(1)
  canalId!: number;
}
