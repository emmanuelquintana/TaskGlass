import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListTasksQueryDto {
  @ApiPropertyOptional({ example: 'todo' })
  @IsOptional()
  @IsIn(['todo', 'doing', 'blocked', 'done'])
  status?: string;

  @ApiPropertyOptional({ example: 'bank' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ example: 0, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  page?: number;

  @ApiPropertyOptional({ example: 50, minimum: 1, maximum: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  size?: number;
}
