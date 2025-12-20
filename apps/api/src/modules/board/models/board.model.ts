import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BoardColumnModel } from './board-column.model';
import { BoardTaskModel } from './board-task.model';

export class BoardModel {
    @ApiProperty({ example: '3f2c9a2e-7a1d-4b2f-9c2f-2a7f5b9d1c11' })
    workspaceId!: string;

    /**
     * Requested board date (YYYY-MM-DD). If null, board is not filtered by date.
     */
    @ApiPropertyOptional({ example: '2025-12-20' })
    date?: string;

    @ApiProperty({ type: [BoardColumnModel] })
    columns!: BoardColumnModel[];

    @ApiProperty({ type: [BoardTaskModel] })
    tasks!: BoardTaskModel[];
}
