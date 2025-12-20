import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsUUID, ValidateNested } from 'class-validator';
import { TaskSortOrderItemDto } from './task-sort-order-item.dto';

/**
 * BatchUpdateTaskSortOrderDto updates task ordering in batch for a given workspace.
 */
export class BatchUpdateTaskSortOrderDto {
    @ApiProperty({ example: '48c1681d-7a02-4fe1-8926-0013f25348f1' })
    @IsUUID()
    workspaceId!: string;

    @ApiProperty({
        type: [TaskSortOrderItemDto],
        example: [
            { id: '20764583-6c35-4dda-9500-0ed1bb1422a8', sortOrder: 0, status: 'todo' },
            { id: 'df8be949-aaac-47d4-af99-40aeb295a919', sortOrder: 1, status: 'todo' }
        ]
    })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => TaskSortOrderItemDto)
    items!: TaskSortOrderItemDto[];
}
