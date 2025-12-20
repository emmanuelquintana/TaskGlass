import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTagDto {
  @ApiPropertyOptional({ example: 'platform', maxLength: 64 })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  groupKey?: string;

  @ApiPropertyOptional({ example: 'amazon', maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;

  @ApiPropertyOptional({ example: '#22c55e', maxLength: 16 })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  color?: string;
}
