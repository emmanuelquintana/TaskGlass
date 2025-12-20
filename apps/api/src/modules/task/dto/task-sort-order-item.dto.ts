import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

/**
 * TaskSortOrderItemDto represents a single task reordering operation.
 */
export class TaskSortOrderItemDto {
    @ApiProperty({ example: '7e2f55f3-8d1c-4d0f-9a2b-20a3c4e5f6a7' })
    @IsUUID()
    id!: string;

    /**
     * Accepts sortOrder (camelCase) OR sort_order (snake_case).
     * Also converts "0" -> 0 when coming from some clients.
     */
    @ApiProperty({ example: 0 })
    @Transform(({ value, obj }) => {
        const v = value ?? obj?.sort_order;
        if (typeof v === 'string' && v.trim() !== '') return Number(v);
        return v;
    })
    @IsInt()
    @Min(0)
    sortOrder!: number;

    @ApiPropertyOptional({ example: 'in_progress', enum: ['todo', 'in_progress', 'blocked', 'done'] })
    @IsOptional()
    @IsIn(['todo', 'in_progress', 'blocked', 'done'])
    status?: string;
}
