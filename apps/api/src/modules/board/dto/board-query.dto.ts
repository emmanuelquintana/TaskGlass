import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';

/**
 * BoardQueryDto defines optional filters for the board view.
 */
export class BoardQueryDto {
    /**
     * ISO date (YYYY-MM-DD). When provided, tasks are filtered by due_date = date.
     */
    @ApiPropertyOptional({ example: '2025-12-20', description: 'ISO date (YYYY-MM-DD)' })
    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in YYYY-MM-DD format' })
    date?: string;
}
