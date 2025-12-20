import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ example: 'platform', maxLength: 64 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  groupKey!: string;

  @ApiProperty({ example: 'amazon', maxLength: 80 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;

  @ApiPropertyOptional({ example: '#22c55e', maxLength: 16 })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  color?: string;
}
