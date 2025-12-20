import { ApiProperty } from '@nestjs/swagger';
import { TaskSortOrderUpdateModel } from './task-sort-order-update.model';

export class BatchUpdateTaskSortOrderResultModel {
    @ApiProperty({ example: '3f2c9a2e-7a1d-4b2f-9c2f-2a7f5b9d1c11' })
    workspaceId!: string;

    @ApiProperty({ example: 2 })
    updated!: number;

    @ApiProperty({ type: [TaskSortOrderUpdateModel] })
    items!: TaskSortOrderUpdateModel[];
}
