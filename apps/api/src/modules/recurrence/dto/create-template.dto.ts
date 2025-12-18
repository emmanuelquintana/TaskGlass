import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateRecurrenceTemplateDto {
  @ApiProperty({ example: 'Review invoices', maxLength: 160 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title!: string;

  @ApiPropertyOptional({ example: 'Check new invoices in the morning', maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ example: 'todo', description: 'Default status for generated tasks' })
  @IsOptional()
  @IsIn(['todo', 'in_progress', 'blocked', 'done'])
  statusDefault?: string;

  @ApiPropertyOptional({ example: 3, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  priority?: number;

  @ApiPropertyOptional({ example: 'daily', description: 'Cadence identifier (currently supported: daily)' })
  @IsOptional()
  @IsIn(['daily'])
  cadence?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
