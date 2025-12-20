import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BoardTagModel } from './board-tag.model';

export class BoardTaskModel {
    @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
    id!: string;

    @ApiProperty({ example: 'Review invoices' })
    title!: string;

    @ApiPropertyOptional({ example: 'Check and reconcile all invoices from marketplaces.' })
    description?: string | null;

    @ApiProperty({ example: 'todo', enum: ['todo', 'in_progress', 'blocked', 'done'] })
    status!: string;

    @ApiProperty({ example: 3 })
    priority!: number;

    @ApiPropertyOptional({ example: '2025-12-20', description: 'ISO date (YYYY-MM-DD) or null' })
    dueDate?: string | null;

    @ApiProperty({ example: 0 })
    sortOrder!: number;

    @ApiPropertyOptional({ example: 'd2f2c0e4-1fd7-4d4f-9be5-6c09d0c7f2f1' })
    templateId?: string | null;

    @ApiProperty({ type: [BoardTagModel] })
    tags!: BoardTagModel[];
}
