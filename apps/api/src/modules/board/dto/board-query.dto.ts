import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';

export class BoardQueryDto {
    @ApiPropertyOptional({ example: '2025-12-20', description: 'YYYY-MM-DD' })
    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/)
    runDate?: string;
}
