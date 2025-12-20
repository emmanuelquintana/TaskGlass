import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BoardColumnModel } from './board-column.model';

export class BoardModel {
    @ApiProperty({ example: '48c1681d-7a02-4fe1-8926-0013f25348f1' })
    workspaceId!: string;

    @ApiPropertyOptional({ example: '2025-12-20', description: 'YYYY-MM-DD' })
    runDate?: string;

    @ApiProperty({ type: [BoardColumnModel] })
    columns!: BoardColumnModel[];
}
