import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Min } from 'class-validator';

export class ColumnSortOrderItemDto {
    @ApiProperty({ example: '0c5ce8b6-19ac-4cf5-9a1a-7b1cc44d84c2' })
    @IsUUID('4')
    id!: string;

    @ApiProperty({ example: 1, minimum: 1 })
    @IsInt()
    @Min(1)
    sortOrder!: number;
}
