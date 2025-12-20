import { ApiProperty } from '@nestjs/swagger';

export class TaskSortOrderUpdateModel {
    @ApiProperty({ example: '7e2f55f3-8d1c-4d0f-9a2b-20a3c4e5f6a7' })
    id!: string;

    @ApiProperty({ example: 0 })
    sortOrder!: number;

    @ApiProperty({ example: 'todo', enum: ['todo', 'in_progress', 'blocked', 'done'] })
    status!: string;
}
