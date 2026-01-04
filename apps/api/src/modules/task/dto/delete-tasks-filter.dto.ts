import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DeleteTasksQueryDto {
    @ApiPropertyOptional({ example: 'done' })
    @IsOptional()
    @IsString()
    status?: string;
}
