import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSavedViewDto {
  @ApiProperty({ example: 'Liverpool - Today', maxLength: 80 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;

  @ApiPropertyOptional({ example: { tags: { platform: ['liverpool'] }, status: ['todo'] } })
  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;

  @ApiPropertyOptional({ example: { by: 'priority', dir: 'desc' } })
  @IsOptional()
  @IsObject()
  sort?: Record<string, unknown>;
}
