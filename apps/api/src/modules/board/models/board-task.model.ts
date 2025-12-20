import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BoardTagModel } from './board-tag.model';

export class BoardTaskModel {
    @ApiProperty({ example: '20764583-6c35-4dda-9500-0ed1bb1422a8' })
    id!: string;

    @ApiProperty({ example: '48c1681d-7a02-4fe1-8926-0013f25348f1' })
    workspaceId!: string;

    @ApiProperty({ example: 'todo', enum: ['todo', 'in_progress', 'blocked', 'done'] })
    status!: string;

    @ApiProperty({ example: 'Review invoices' })
    title!: string;

    @ApiPropertyOptional({ example: 'Check and reconcile invoices' })
    description?: string | null;

    @ApiProperty({ example: 3 })
    priority!: number;

    @ApiPropertyOptional({ example: '2025-12-20', description: 'YYYY-MM-DD' })
    dueDate?: string | null;

    @ApiProperty({ example: 0 })
    sortOrder!: number;

    @ApiPropertyOptional({ example: 'd986e563-ebf7-4af2-adcf-205e83291501' })
    templateId?: string | null;

    @ApiProperty({ type: [BoardTagModel] })
    tags!: BoardTagModel[];
}
