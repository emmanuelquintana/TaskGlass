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
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ example: 'todo', required: false })
  @IsOptional()
  @IsIn(['todo', 'in_progress', 'blocked', 'done'])
  status?: string;
}

// Updated status to support in_progress
