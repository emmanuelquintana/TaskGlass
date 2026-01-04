import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTaskDto {
  @ApiProperty({ example: 'Updated title', required: false, maxLength: 160 })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  title?: string;

  @ApiProperty({ example: 'Updated description', required: false, maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ example: 'todo', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  priority?: number;

  @ApiProperty({ example: '2024-12-31', required: false })
  @IsOptional()
  dueDate?: string;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  points?: number;
}

// Updated status to support in_progress
