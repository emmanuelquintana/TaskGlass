import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, Matches } from 'class-validator';

export class BoardQueryDto {
    @ApiPropertyOptional({ example: '2025-12-20', description: 'YYYY-MM-DD' })
    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/)
    runDate?: string;

    @ApiPropertyOptional({ example: 'd986e563-ebf7-4af2-adcf-205e83291501' })
    @IsOptional()
    @IsUUID()
    savedViewId?: string;

    @ApiPropertyOptional({ description: 'Search term for title/description' })
    @IsOptional()
    q?: string;

    @ApiPropertyOptional({ description: 'Filter by priority (min)' })
    @IsOptional()
    priorityMin?: number;

    @ApiPropertyOptional({ description: 'Filter by priority (max)' })
    @IsOptional()
    priorityMax?: number;

    @ApiPropertyOptional({ description: 'Filter by status', isArray: true, type: String })
    @IsOptional()
    statuses?: string[];

    @ApiPropertyOptional({ description: 'Filter by tags', isArray: true, type: String })
    @IsOptional()
    tagIds?: string[];
}
