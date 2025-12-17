import { ApiProperty } from '@nestjs/swagger';

export class ColumnModel {
    @ApiProperty({ example: '0c5ce8b6-19ac-4cf5-9a1a-7b1cc44d84c2' })
    id!: string;

    @ApiProperty({ example: '3f2c9a2e-7a1d-4b2f-9c2f-2a7f5b9d1c11' })
    workspaceId!: string;

    @ApiProperty({
        example: 'todo',
        description: 'Column key mapped to tg_task_status enum'
    })
    key!: string;

    @ApiProperty({ example: 'To do' })
    title!: string;

    @ApiProperty({ example: 1 })
    sortOrder!: number;
}
