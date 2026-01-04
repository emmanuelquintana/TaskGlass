import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min, IsArray } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Review bank sprint tickets', maxLength: 160 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title!: string;

  @ApiProperty({ example: 'Start with highest priority items', required: false, maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ example: 'todo', required: false })
  @IsOptional()
  @IsIn(['todo', 'doing', 'blocked', 'done'])
  status?: string;

  @ApiProperty({ example: '7e2f55f3-8d1c-4d0f-9a2b-20a3c4e5f6a7' })
  @IsString()
  @IsNotEmpty()
  workspaceId!: string;

  @ApiProperty({ example: 3, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  priority?: number;

  @ApiProperty({ example: '2025-12-20', required: false })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiProperty({ example: ['uuid1', 'uuid2'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];
}
