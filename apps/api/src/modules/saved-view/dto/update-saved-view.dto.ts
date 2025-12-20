import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSavedViewDto {
  @ApiPropertyOptional({ example: 'Liverpool - Today', maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;

  @ApiPropertyOptional({ example: { tags: { platform: ['liverpool'] }, status: ['todo', 'in_progress'] } })
  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;

  @ApiPropertyOptional({ example: { by: 'dueDate', dir: 'asc' } })
  @IsOptional()
  @IsObject()
  sort?: Record<string, unknown>;
}
