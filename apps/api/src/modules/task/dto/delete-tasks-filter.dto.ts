import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export class DeleteTasksQueryDto {
    @ApiPropertyOptional({ example: 'done' })
    @IsOptional()
    @IsIn(['todo', 'in_progress', 'blocked', 'done'])
    status?: string;
}
