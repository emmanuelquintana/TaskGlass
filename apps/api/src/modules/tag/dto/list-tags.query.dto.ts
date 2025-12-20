import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ListTagsQueryDto {
  @ApiPropertyOptional({ example: 'platform' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  groupKey?: string;

  @ApiPropertyOptional({ example: 'ama' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;
}
